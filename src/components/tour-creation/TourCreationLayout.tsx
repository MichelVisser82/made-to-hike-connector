import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface TourCreationLayoutProps {
  children: ReactNode;
  onBack: () => void;
  editMode?: boolean;
  tourTitle?: string;
}

export function TourCreationLayout({
  children,
  onBack,
  editMode = false,
  tourTitle,
}: TourCreationLayoutProps) {
  return (
    <div className="min-h-screen bg-cream-light">
      {/* Header */}
      <header className="border-b border-burgundy/10 bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0 hover:bg-burgundy/10"
            >
              <ArrowLeft className="h-5 w-5 text-charcoal" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-playfair font-semibold text-charcoal">
                {editMode ? 'Edit Tour' : 'Create Tour'}
              </h1>
              {editMode && tourTitle && (
                <p className="text-sm text-charcoal/60 mt-0.5">
                  Editing: {tourTitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
