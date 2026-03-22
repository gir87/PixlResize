import React from "react";
import {
  Settings,
  Image as ImageIcon,
  Crop,
  X,
  Heart,
  Coffee,
} from "lucide-react";
import { CompressionSettings, OutputFormat, Preset, CropRatio } from "../types";

interface SidebarProps {
  settings: CompressionSettings;
  setSettings: (settings: CompressionSettings) => void;
  presets: Preset[];
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  setSettings,
  presets,
  isOpen,
  onClose,
}) => {
  const handleFormatChange = (format: OutputFormat) => {
    setSettings({ ...settings, format });
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, quality: parseInt(e.target.value) });
  };

  const handleLongestSideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, longestSide: parseInt(e.target.value) || 0 });
  };

  const handleCropChange = (cropRatio: CropRatio) => {
    setSettings({ ...settings, cropRatio });
  };

  const applyPreset = (preset: Preset) => {
    setSettings(preset.settings);
  };

  const cropRatios: { label: string; value: CropRatio }[] = [
    { label: "Original", value: "original" },
    { label: "1:1", value: "1:1" },
    { label: "2:3", value: "2:3" },
    { label: "4:5", value: "4:5" },
    { label: "5:7", value: "5:7" },
    { label: "6:19", value: "6:19" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 w-80 bg-zinc-950 border-r border-zinc-800 h-full flex flex-col overflow-y-auto p-6 space-y-8 text-zinc-100 z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold tracking-tight text-white">
            PixlResize
          </h1>

          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Settings className="w-4 h-4" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">
              Output Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["webp", "jpeg", "png"] as OutputFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFormatChange(f)}
                    className={`py-2 text-xs font-medium rounded-md border transition-all ${
                      settings.format === f
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-zinc-300">
                  Quality
                </label>
                <span className="text-xs font-mono text-zinc-500">
                  {settings.quality}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={settings.quality}
                onChange={handleQualityChange}
                disabled={settings.format === "png"}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Longest Side (px)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.longestSide}
                  onChange={handleLongestSideChange}
                  className="w-full pl-3 pr-10 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600 uppercase">
                  px
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Crop className="w-4 h-4" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">
              Crop Ratio
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {cropRatios.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => handleCropChange(ratio.value)}
                className={`py-2 text-xs font-medium rounded-md border transition-all ${
                  settings.cropRatio === ratio.value
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-500 italic">
            Portrait/Landscape orientation is automatically detected.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <ImageIcon className="w-4 h-4" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">
              Presets
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`flex flex-col items-start p-3 text-left border rounded-lg transition-all group ${
                  JSON.stringify(settings) === JSON.stringify(preset.settings)
                    ? "bg-indigo-950/30 border-indigo-500/50"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    JSON.stringify(settings) === JSON.stringify(preset.settings)
                      ? "text-indigo-400"
                      : "text-zinc-200"
                  }`}
                >
                  {preset.name}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {preset.settings.format.toUpperCase()} • Q:
                  {preset.settings.quality} • {preset.settings.longestSide}px
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <h2 className="text-xs font-semibold uppercase tracking-wider">
              Support
            </h2>
          </div>
          <a
            href={import.meta.env.VITE_BUY_ME_A_COFFEE_URL || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all duration-300"
          >
            <div className="p-2 bg-zinc-800 rounded-full group-hover:bg-indigo-500 transition-all duration-300">
              <Coffee className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white fill-transparent group-hover:fill-white transition-all" />
            </div>
            <span className="text-sm font-medium text-zinc-200 group-hover:text-indigo-400 transition-colors">
              Buy me a coffee
            </span>
          </a>
        </section>

        <div className="mt-auto pt-6 border-t border-zinc-800">
          <p className="text-[10px] text-zinc-500 text-center">
            All processing happens locally in your browser.
          </p>
        </div>
      </div>
    </>
  );
};
