export const MapSkeleton = () => {
  return (
    <div className="w-full h-full min-h-[400px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Loading map...</p>
    </div>
  );
};
