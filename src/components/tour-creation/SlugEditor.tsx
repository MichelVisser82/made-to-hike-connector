import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Check, X, Loader2, Edit2, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { isTourSlugAvailable, generateUniqueSlugSuggestions, sanitizeTourSlug } from '@/utils/tourSlugValidation';
import { generateSlug } from '@/lib/seoUtils';

interface SlugEditorProps {
  tourId?: string;
  titleFieldName?: string;
}

export function SlugEditor({ tourId, titleFieldName = 'title' }: SlugEditorProps) {
  const { watch, setValue, formState: { errors } } = useFormContext();
  
  const title = watch(titleFieldName);
  const slug = watch('slug');
  
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Auto-generate slug from title when not customizing
  useEffect(() => {
    if (!isCustomizing && title) {
      const autoSlug = generateSlug(title);
      setValue('slug', autoSlug, { shouldValidate: true });
    }
  }, [title, isCustomizing, setValue]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }

    // Clear previous timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // Set new timeout for debounced check
    const timeout = setTimeout(async () => {
      setIsChecking(true);
      const available = await isTourSlugAvailable(slug, tourId);
      setIsAvailable(available);
      setIsChecking(false);

      // Generate suggestions if not available
      if (!available) {
        setSuggestions(generateUniqueSlugSuggestions(slug));
      } else {
        setSuggestions([]);
      }
    }, 500);

    setCheckTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [slug, tourId]);

  const handleSlugChange = (value: string) => {
    const sanitized = sanitizeTourSlug(value);
    setValue('slug', sanitized, { shouldValidate: true });
    
    // Mark as customizing if user manually edits
    if (!isCustomizing) {
      setIsCustomizing(true);
    }
  };

  const toggleCustomizing = () => {
    if (isCustomizing) {
      // Reset to auto-generated slug
      const autoSlug = generateSlug(title || '');
      setValue('slug', autoSlug, { shouldValidate: true });
      setIsCustomizing(false);
    } else {
      setIsCustomizing(true);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setValue('slug', suggestion, { shouldValidate: true });
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (isAvailable === true) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (isAvailable === false) {
      return <X className="h-4 w-4 text-destructive" />;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="slug" className="font-display text-sm font-medium">
          Tour URL
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleCustomizing}
          className="h-7 text-xs"
        >
          {isCustomizing ? (
            <>
              <Lock className="h-3 w-3 mr-1" />
              Auto-generate
            </>
          ) : (
            <>
              <Edit2 className="h-3 w-3 mr-1" />
              Customize
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <span className="px-3 text-sm text-muted-foreground whitespace-nowrap">
            madetohike.com/tours/
          </span>
          <Input
            id="slug"
            value={slug || ''}
            onChange={(e) => handleSlugChange(e.target.value)}
            disabled={!isCustomizing}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            placeholder="your-tour-slug"
          />
        </div>
        <div className="w-6 flex items-center justify-center">
          {getStatusIcon()}
        </div>
      </div>

      {isCustomizing && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Edit2 className="h-3 w-3" />
          Customizing URL (will not auto-update from title)
        </p>
      )}

      {errors.slug && (
        <p className="text-sm text-destructive">
          {errors.slug.message as string}
        </p>
      )}

      {isAvailable === false && suggestions.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
            ⚠️ This URL is already taken. Try:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <HoverCard key={suggestion}>
                <HoverCardTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applySuggestion(suggestion)}
                    className="h-7 text-xs border-amber-300 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900"
                  >
                    {suggestion}
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-xs text-muted-foreground">
                    Click to use: madetohike.com/tours/<span className="font-medium">{suggestion}</span>
                  </p>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      )}

      {isAvailable === true && slug && (
        <p className="text-xs text-green-600 dark:text-green-400">
          ✓ URL is available: <span className="font-medium">madetohike.com/tours/{slug}</span>
        </p>
      )}
    </div>
  );
}
