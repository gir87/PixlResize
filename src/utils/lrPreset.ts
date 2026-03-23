// DC1 Lightroom preset applied via Canvas pixel manipulation.
// Implements: per-channel tone curves → master tone curve → HSL adjustments.
// Values extracted directly from public/DC1.xmp.

type Curve = [number, number][];

const MASTER_CURVE: Curve = [[0,0],[70,64],[137,130],[203,197],[255,249]];
const RED_CURVE: Curve   = [[1,10],[40,40],[74,77],[103,112],[150,161],[197,204],[255,255]];
const GREEN_CURVE: Curve = [[0,11],[36,37],[71,73],[101,111],[147,161],[200,208],[255,255]];
const BLUE_CURVE: Curve  = [[0,11],[31,34],[68,72],[99,110],[129,146],[178,192],[255,255]];

const HSL_ADJ: Record<'hue'|'sat'|'lum', Record<string, number>> = {
  hue: { red:-3,  orange:5,  yellow:-5,  green:-10, aqua:0,  blue:-3,  purple:-10, magenta:0  },
  sat: { red:-5,  orange:-5, yellow:-3,  green:-10, aqua:0,  blue:-18, purple:0,   magenta:0  },
  lum: { red:-5,  orange:0,  yellow:-8,  green:-18, aqua:-3, blue:-8,  purple:-8,  magenta:-13 },
};

const HUE_CENTERS: [string, number][] = [
  ['red', 0], ['orange', 30], ['yellow', 60], ['green', 120],
  ['aqua', 180], ['blue', 220], ['purple', 280], ['magenta', 330],
];
const HUE_HALF_WIDTH = 40;

// Linear interpolation along a curve defined by (input, output) control points.
function lerpCurve(curve: Curve, v: number): number {
  if (v <= curve[0][0]) return curve[0][1];
  const last = curve[curve.length - 1];
  if (v >= last[0]) return last[1];
  for (let j = 0; j < curve.length - 1; j++) {
    if (v >= curve[j][0] && v <= curve[j + 1][0]) {
      const t = (v - curve[j][0]) / (curve[j + 1][0] - curve[j][0]);
      return curve[j][1] + t * (curve[j + 1][1] - curve[j][1]);
    }
  }
  return v;
}

// Build a 256-entry LUT: apply channelCurve first, then MASTER_CURVE.
function buildCombinedLUT(channelCurve: Curve): Uint8Array {
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const afterChannel = Math.max(0, Math.min(255, Math.round(lerpCurve(channelCurve, i))));
    lut[i] = Math.max(0, Math.min(255, Math.round(lerpCurve(MASTER_CURVE, afterChannel))));
  }
  return lut;
}

function hueWeight(pixelHue: number, center: number): number {
  let diff = Math.abs(pixelHue - center);
  if (diff > 180) diff = 360 - diff;
  if (diff >= HUE_HALF_WIDTH) return 0;
  return Math.cos((diff / HUE_HALF_WIDTH) * (Math.PI / 2));
}

// --- Module-level precomputed tables (built once) ---

const RED_LUT   = buildCombinedLUT(RED_CURVE);
const GREEN_LUT = buildCombinedLUT(GREEN_CURVE);
const BLUE_LUT  = buildCombinedLUT(BLUE_CURVE);

// HSL_TABLE[h*3 + 0/1/2] = precomputed hue/sat/lum shift for each integer hue degree.
const HSL_TABLE = new Float32Array(360 * 3);
for (let h = 0; h < 360; h++) {
  let hShift = 0, sShift = 0, lShift = 0;
  for (const [name, center] of HUE_CENTERS) {
    const w = hueWeight(h, center);
    if (w > 0) {
      hShift += w * HSL_ADJ.hue[name];
      sShift += w * HSL_ADJ.sat[name];
      lShift += w * HSL_ADJ.lum[name];
    }
  }
  HSL_TABLE[h * 3]     = hShift;
  HSL_TABLE[h * 3 + 1] = sShift;
  HSL_TABLE[h * 3 + 2] = lShift;
}

// Cubic helper for HSL→RGB conversion.
function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/**
 * Apply the DC1 Lightroom preset to all pixels on the given canvas context.
 * Must be called after drawImage and before any border fill.
 */
export function applyDC1Preset(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Step 1: tone curves (per-channel → master)
    let r = RED_LUT[data[i]];
    let g = GREEN_LUT[data[i + 1]];
    let b = BLUE_LUT[data[i + 2]];

    // Step 2: HSL adjustments
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;

    if (d > 0.001) { // skip achromatic pixels
      const l = (max + min) / 2;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      let h: number;
      if (max === rn)      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      else if (max === gn) h = ((bn - rn) / d + 2) / 6;
      else                 h = ((rn - gn) / d + 4) / 6;

      const hDeg = Math.round(h * 360) % 360;
      const ti = hDeg * 3;
      const hueShift = HSL_TABLE[ti];
      const satShift = HSL_TABLE[ti + 1];
      const lumShift = HSL_TABLE[ti + 2];

      const newH = ((h * 360 + hueShift + 360) % 360) / 360;
      const newS = Math.max(0, Math.min(1, s * Math.max(0, 1 + satShift / 100)));
      const newL = Math.max(0, Math.min(1, l + lumShift / 200));

      const q = newL < 0.5 ? newL * (1 + newS) : newL + newS - newL * newS;
      const p = 2 * newL - q;
      r = Math.round(hue2rgb(p, q, newH + 1 / 3) * 255);
      g = Math.round(hue2rgb(p, q, newH) * 255);
      b = Math.round(hue2rgb(p, q, newH - 1 / 3) * 255);
    }

    data[i]     = r;
    data[i + 1] = g;
    data[i + 2] = b;
    // alpha (data[i+3]) unchanged
  }

  ctx.putImageData(imageData, 0, 0);
}
