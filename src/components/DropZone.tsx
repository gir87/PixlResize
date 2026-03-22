import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = Array.from(e.dataTransfer.files).filter((file: File) =>
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        onFilesAdded(files);
      }
    },
    [onFilesAdded]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((file: File) =>
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        onFilesAdded(files);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 hover:border-indigo-500 transition-all cursor-pointer overflow-hidden"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center space-y-4 text-center px-6">
          <div className="p-4 bg-zinc-800 rounded-full group-hover:bg-indigo-900/50 group-hover:scale-110 transition-all duration-300">
            <Upload className="w-8 h-8 text-zinc-500 group-hover:text-indigo-500" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-zinc-100">
              Drop your images here
            </p>
            <p className="text-sm text-zinc-500">
              or click to browse from your computer
            </p>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <ImageIcon className="w-3 h-3" />
              JPG, PNG, WebP
            </div>
            <div className="w-1 h-1 bg-zinc-700 rounded-full" />
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Multiple files supported
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
};
