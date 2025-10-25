import { useState, useCallback } from 'react';
import { Search, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHelpSearch } from '@/hooks/useHelpSearch';
import { useToast } from '@/hooks/use-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  user_type: string;
}

interface HelpSearchBarProps {
  onNoResults?: () => void;
}

export function HelpSearchBar({ onNoResults }: HelpSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FAQ[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  
  const { search, recordFeedback, isLoading } = useHelpSearch();
  const { toast } = useToast();

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    try {
      const data = await search(query);
      setResults(data.results);
      setSuggestions(data.suggestions);
      setShowResults(true);

      if (data.results.length === 0 && onNoResults) {
        onNoResults();
      }
    } catch (err) {
      toast({
        title: 'Search Failed',
        description: 'Unable to search help articles. Please try again.',
        variant: 'destructive',
      });
    }
  }, [query, search, toast, onNoResults]);

  const handleFeedback = async (faqId: string, wasHelpful: boolean) => {
    setFeedbackGiven(prev => ({ ...prev, [faqId]: true }));
    await recordFeedback(faqId, wasHelpful);
    
    toast({
      title: 'Thank you!',
      description: wasHelpful 
        ? 'Glad we could help!' 
        : 'We\'ll work on improving this answer.',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for help... (e.g., 'How do I book a tour?')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-12 h-14 text-base text-foreground"
          aria-label="Search help articles"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
        )}
        {!isLoading && query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            Search
          </Button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="space-y-3 animate-in fade-in-50 duration-300">
          <p className="text-sm text-muted-foreground">
            Found {results.length} relevant {results.length === 1 ? 'article' : 'articles'}
          </p>
          {results.map((faq) => (
            <Card key={faq.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <div 
                    className="text-sm text-muted-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: faq.answer
                        .replace(/\\n/g, '\n')
                        .replace(/\n\n/g, '<br><br>')
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/- /g, '• ')
                    }}
                  />
                </div>
                
                {!feedbackGiven[faq.id] && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Was this helpful?</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(faq.id, true)}
                      className="hover:text-green-600"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Yes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(faq.id, false)}
                      className="hover:text-red-600"
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      No
                    </Button>
                  </div>
                )}
                
                {feedbackGiven[faq.id] && (
                  <p className="text-sm text-muted-foreground pt-2 border-t">
                    Thanks for your feedback!
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-2">No results found for "{query}"</p>
            <p className="text-sm text-muted-foreground">
              Try different keywords or contact support below
            </p>
          </CardContent>
        </Card>
      )}

      {suggestions.length > 0 && (
        <div className="pt-2">
          <p className="text-sm font-medium mb-2">Related searches:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery(suggestion);
                  setTimeout(handleSearch, 100);
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
