import { Loader2 } from "lucide-react";

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-burgundy" />
        <p className="text-charcoal/60 font-playfair">Loading...</p>
      </div>
    </div>
  );
};
