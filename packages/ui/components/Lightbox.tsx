"use client";

import { cn } from "@hisabkit/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Download, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import * as React from "react";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: { url: string; title?: string }[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function Lightbox({ isOpen, onClose, images, currentIndex, onNavigate }: LightboxProps) {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex + 1) % images.length);
    resetTransform();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex - 1 + images.length) % images.length);
    resetTransform();
  };

  const resetTransform = () => {
    setScale(1);
    setRotation(0);
  };

  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const rotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = images[currentIndex];
    if (!current) return;

    const anchor = document.createElement("a");
    anchor.href = current.url;
    anchor.download = current.title || "hisabkit-attachment";
    anchor.target = "_blank";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm animate-in fade-in duration-300" />
        <DialogPrimitive.Content className="fixed inset-0 z-[101] flex flex-col items-center justify-center outline-none animate-in zoom-in-95 duration-300">
          <DialogPrimitive.Title className="sr-only">
            {currentImage.title || "Attachment Preview"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Viewing attachment file in full screen
          </DialogPrimitive.Description>

          {/* Header/Toolbar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent z-[102]">
            <div className="text-white text-sm font-bold truncate max-w-[50%]">
              {currentImage.title || `Attachment ${currentIndex + 1}`}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={handleDownload}
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-bold ring-1 ring-white/20"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <div className="w-px h-6 bg-white/10 mx-1 sm:mx-2" />
              <button
                onClick={zoomIn}
                type="button"
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={zoomOut}
                type="button"
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={rotate}
                type="button"
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                type="button"
                className="rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all p-2 ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
            onClick={onClose}
          >
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImage.url}
                alt={currentImage.title || "Preview"}
                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm"
              />
            </div>

            {/* Navigation Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md z-[103]"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNext}
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md z-[103]"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Bar (Optional) */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 p-4 animate-in slide-in-from-bottom-4 duration-500 z-[102]">
              {images.map((img, idx) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(idx);
                    resetTransform();
                  }}
                  className={cn(
                    "w-12 h-12 rounded-md overflow-hidden border-2 transition-all",
                    currentIndex === idx
                      ? "border-primary scale-110 shadow-lg"
                      : "border-transparent opacity-50 hover:opacity-100",
                  )}
                >
                  <img
                    src={img.url}
                    className="w-full h-full object-cover"
                    alt={`Thumbnail ${idx}`}
                  />
                </button>
              ))}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
