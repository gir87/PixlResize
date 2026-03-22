import React from "react";
import {
  Download,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { ProcessedImage } from "../types";
import { formatSize } from "../utils/imageProcessor";
import { motion } from "motion/react";

interface ImagePreviewProps {
  image: ProcessedImage;
  onRemove: (id: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  onRemove,
}) => {
  const savings =
    image.originalSize > 0
      ? Math.max(
          0,
          Math.round(
            ((image.originalSize - image.processedSize) / image.originalSize) *
              100,
          ),
        )
      : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
    >
      <div className="relative aspect-square bg-zinc-950 flex items-center justify-center overflow-hidden">
        {image.status === "processing" ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Processing
            </span>
          </div>
        ) : image.status === "error" ? (
          <div className="flex flex-col items-center gap-2 text-red-500">
            <AlertCircle className="w-8 h-8" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Error
            </span>
          </div>
        ) : (
          <>
            <img
              src={image.url}
              alt={image.originalName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <a
                href={image.url}
                download={`pixlresize-${image.originalName.split(".")[0]}.${image.format}`}
                className="p-2 bg-white rounded-full text-zinc-900 hover:bg-indigo-500 hover:text-white transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => onRemove(image.id)}
                className="p-2 bg-white rounded-full text-zinc-900 hover:bg-red-500 hover:text-white transition-colors"
                title="Remove"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            {savings > 0 && (
              <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                -{savings}%
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3
            className="text-xs font-semibold text-zinc-100 truncate flex-1"
            title={image.originalName}
          >
            {image.originalName}
          </h3>
          <div className="flex items-center gap-1">
            {image.status === "completed" && (
              <CheckCircle2 className="w-3 h-3 text-indigo-500" />
            )}
            <span className="text-[10px] font-bold text-zinc-500 uppercase">
              {image.format}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-medium">
          <div className="flex flex-col">
            <span className="text-zinc-500 uppercase tracking-tighter">
              Original
            </span>
            <span className="text-zinc-300">
              {formatSize(image.originalSize)}
            </span>
          </div>
          <ArrowRight className="w-3 h-3 text-zinc-700" />
          <div className="flex flex-col items-end text-right">
            <span className="text-zinc-500 uppercase tracking-tighter">
              Processed
            </span>
            <span
              className={
                image.processedSize < image.originalSize
                  ? "text-indigo-500"
                  : "text-zinc-300"
              }
            >
              {formatSize(image.processedSize)}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
          <span className="text-[10px] text-zinc-500">
            {Math.round(image.width)} × {Math.round(image.height)} px
          </span>
          <button
            onClick={() => onRemove(image.id)}
            className="text-[10px] font-bold text-zinc-500 hover:text-red-500 uppercase tracking-wider transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
};
