import { Lightbox } from "@hisabkit/ui/components/Lightbox";
import { Download, FileText, X } from "lucide-react";

/**
 * AttachmentLightbox Component
 * Unified component to handle previews for both images and documents (PDFs).
 * Organizes viewing logic out of main pages for better maintainability.
 */

interface AttachmentLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: {
    name: string;
    type: "image" | "pdf";
    url: string;
  } | null;
}

export function AttachmentLightbox({ isOpen, onClose, attachment }: AttachmentLightboxProps) {
  if (!isOpen || !attachment) return null;

  if (attachment.type === "image") {
    return (
      <Lightbox
        isOpen={isOpen}
        onClose={onClose}
        images={[{ url: attachment.url, title: attachment.name }]}
        currentIndex={0}
        onNavigate={() => {}}
      />
    );
  }

  // PDF Viewer Implementation
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                {attachment.name}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                  PDF Document
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={attachment.url}
              download={attachment.name}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all text-xs font-black uppercase tracking-widest"
              title="Download File"
            >
              <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Using object for better PDF handling */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
          <object data={attachment.url} type="application/pdf" className="w-full h-full">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
              <div className="p-6 rounded-full bg-slate-50 dark:bg-slate-900 mb-4">
                <FileText className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                Unable to preview PDF directly
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Your browser doesn't support inline PDF previews. Please download the file to view
                it.
              </p>
              <a
                href={attachment.url}
                download={attachment.name}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold"
              >
                Download PDF
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
}
