import api from "@/shared/api/client";
import { cn } from "@hisabkit/lib/utils";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface AuthenticatedImageProps {
  url: string;
  alt?: string;
  className?: string;
  fallbackIconClassName?: string;
  onLoad?: () => void;
}

/**
 * AuthenticatedImage
 * Fetches an image via the authenticated API client and displays it using an object URL.
 * Necessary for images that require custom headers (Authorization, X-TenantID).
 */
export function AuthenticatedImage({
  url,
  alt,
  className,
  fallbackIconClassName,
  onLoad,
}: AuthenticatedImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let currentUrl: string | null = null;
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(url, { responseType: "blob" });
        currentUrl = URL.createObjectURL(res.data);
        setObjectUrl(currentUrl);
        onLoad?.();
      } catch (_e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      load();
    }

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [url, onLoad]);

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg", className)} />
    );
  }

  if (error || !objectUrl) {
    return (
      <div
        className={cn(
          "bg-slate-50 dark:bg-slate-900 flex items-center justify-center rounded-lg",
          className,
        )}
      >
        <FileText className={cn("text-slate-300", fallbackIconClassName)} />
      </div>
    );
  }

  return (
    <img
      src={objectUrl}
      alt={alt || "Authenticated asset"}
      className={cn("object-cover", className)}
    />
  );
}
