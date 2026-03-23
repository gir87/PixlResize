import { useState, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { DropZone } from "./components/DropZone";
import { ImagePreview } from "./components/ImagePreview";
import { CompressionSettings, ProcessedImage, Preset } from "./types";
import { processImage } from "./utils/imageProcessor";
import { Download, Trash2, Image as ImageIcon, Menu } from "lucide-react";
import { AnimatePresence } from "motion/react";

const DEFAULT_SETTINGS: CompressionSettings = {
  format: "webp",
  quality: 90,
  longestSide: 1920,
  cropRatio: "original",
  hasBorder: false,
  applyLrPreset: false,
};

const PRESETS: Preset[] = [
  {
    id: "web-optimized",
    name: "Web Optimized",
    settings: {
      format: "webp",
      quality: 90,
      longestSide: 1920,
      cropRatio: "original",
      hasBorder: false,
      applyLrPreset: false,
    },
  },
  {
    id: "border-preset",
    name: "Border and DC1 Preset",
    settings: {
      format: "jpeg",
      quality: 95,
      longestSide: 2048,
      cropRatio: "original",
      hasBorder: true,
      applyLrPreset: true,
    },
  },
  {
    id: "social-portrait",
    name: "Social Portrait (4:5)",
    settings: {
      format: "jpeg",
      quality: 90,
      longestSide: 1920,
      cropRatio: "4:5",
      hasBorder: true,
      applyLrPreset: false,
    },
  },
  {
    id: "cinematic",
    name: "Cinematic (19:6)",
    settings: {
      format: "webp",
      quality: 90,
      longestSide: 2560,
      cropRatio: "19:6",
      hasBorder: false,
      applyLrPreset: false,
    },
  },
];

export default function App() {
  const [settings, setSettings] =
    useState<CompressionSettings>(DEFAULT_SETTINGS);
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      const newImages: ProcessedImage[] = files.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        originalName: file.name,
        originalSize: file.size,
        processedSize: 0,
        url: "",
        format: settings.format,
        width: 0,
        height: 0,
        status: "processing",
      }));

      setImages((prev) => [...newImages, ...prev]);

      // Process each image
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const placeholder = newImages[i];

        try {
          const result = await processImage(file, settings);
          setImages((prev) =>
            prev.map((img) =>
              img.id === placeholder.id
                ? { ...img, ...result, status: "completed" }
                : img,
            ),
          );
        } catch (error) {
          console.error("Error processing image:", error);
          setImages((prev) =>
            prev.map((img) =>
              img.id === placeholder.id ? { ...img, status: "error" } : img,
            ),
          );
        }
      }
    },
    [settings],
  );

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.url) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach((img) => {
      if (img.url) URL.revokeObjectURL(img.url);
    });
    setImages([]);
  };

  const downloadAll = () => {
    images.forEach((img) => {
      if (img.status === "completed") {
        const link = document.createElement("a");
        link.href = img.url;
        link.download = `pixlresize-${img.originalName.split(".")[0]}.${img.format}`;
        link.click();
      }
    });
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      <Sidebar
        settings={settings}
        setSettings={setSettings}
        presets={PRESETS}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-zinc-400 hover:text-white lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest truncate">
              Workspace
            </h2>
            {images.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full">
                <span className="text-[10px] font-bold text-zinc-400">
                  {images.length} Images
                </span>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={clearAll}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">Download All</span>
                <span className="xs:hidden">Save</span>
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-zinc-950">
          <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
            <DropZone onFilesAdded={handleFilesAdded} />

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600">
                  <ImageIcon className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">
                    Processed Images
                  </h3>
                </div>
              </div>

              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 lg:py-20 text-center space-y-4 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                  <div className="p-4 bg-zinc-900 rounded-full shadow-sm">
                    <ImageIcon className="w-8 h-8 text-zinc-700" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-500">
                      No images processed yet
                    </p>
                    <p className="text-xs text-zinc-600">
                      Upload some photos to see them here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  <AnimatePresence mode="popLayout">
                    {images.map((image) => (
                      <ImagePreview
                        key={image.id}
                        image={image}
                        onRemove={removeImage}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
