export type OutputFormat = 'webp' | 'jpeg' | 'png';

export type CropRatio = 'original' | '1:1' | '2:3' | '3:2' | '4:5' | '5:4' | '5:7' | '7:5' | '6:19' | '19:6';

export interface CompressionSettings {
  format: OutputFormat;
  quality: number;
  longestSide: number;
  cropRatio: CropRatio;
  hasBorder: boolean;
}

export interface ProcessedImage {
  id: string;
  originalName: string;
  originalSize: number;
  processedSize: number;
  url: string;
  format: OutputFormat;
  width: number;
  height: number;
  status: 'processing' | 'completed' | 'error';
}

export interface Preset {
  id: string;
  name: string;
  settings: CompressionSettings;
}
