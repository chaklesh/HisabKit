/**
 * PageLoader.tsx
 * Route-level loading skeleton used in all Suspense fallbacks.
 */
import { Skeleton } from "./Skeleton";

export function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-6" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-10 w-64 rounded-md" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
