import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Backpack, FileText, User, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TripDetails, TripChecklistItem } from '@/hooks/useTripDetails';
import { useQueryClient } from '@tanstack/react-query';

interface TripChecklistTabProps {
  tripDetails: TripDetails;
}

export function TripChecklistTab({ tripDetails }: TripChecklistTabProps) {
  const { checklist, booking } = tripDetails;
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCheckItem = async (itemId: string, currentlyChecked: boolean) => {
    setLoading(itemId);
    try {
      const { error } = await supabase
        .from('trip_checklist_items')
        .update({
          is_checked: !currentlyChecked,
          checked_at: !currentlyChecked ? new Date().toISOString() : null
        })
        .eq('id', itemId);

      if (error) throw error;

      // Refresh trip details
      queryClient.invalidateQueries({ queryKey: ['trip-details', booking.id] });

      toast({
        title: !currentlyChecked ? 'Item checked' : 'Item unchecked',
        description: 'Your checklist has been updated.',
      });
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update checklist item.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'essential_gear':
        return <Backpack className="w-5 h-5 text-primary" />;
      case 'documents':
        return <FileText className="w-5 h-5 text-primary" />;
      case 'personal_items':
        return <User className="w-5 h-5 text-primary" />;
      case 'preparation':
        return <Wrench className="w-5 h-5 text-primary" />;
      default:
        return <Backpack className="w-5 h-5 text-primary" />;
    }
  };

  const getCategoryTitle = (type: string) => {
    switch (type) {
      case 'essential_gear':
        return 'Essential Gear';
      case 'documents':
        return 'Documents';
      case 'personal_items':
        return 'Personal Items';
      case 'preparation':
        return 'Preparation';
      default:
        return type;
    }
  };

  // Group checklist by category
  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.item_type]) {
      acc[item.item_type] = [];
    }
    acc[item.item_type].push(item);
    return acc;
  }, {} as Record<string, TripChecklistItem[]>);

  const categories = Object.keys(groupedChecklist);
  const completedItems = checklist.filter(item => item.is_checked).length;
  const totalItems = checklist.length;

  if (checklist.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Backpack className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Checklist Coming Soon</h3>
          <p className="text-muted-foreground">
            Your guide will provide a packing checklist shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-semibold mb-2">Pre-Trip Checklist</h2>
          <p className="text-muted-foreground">
            Make sure you have everything you need
          </p>
        </div>
        <Badge variant={completedItems === totalItems ? 'default' : 'secondary'} className="text-lg px-4 py-2">
          {completedItems} / {totalItems}
        </Badge>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {getCategoryIcon(category)}
                <h3 className="text-lg font-semibold">{getCategoryTitle(category)}</h3>
                <Badge variant="outline" className="ml-auto">
                  {groupedChecklist[category].filter(item => item.is_checked).length} / {groupedChecklist[category].length}
                </Badge>
              </div>

              <div className="space-y-3">
                {groupedChecklist[category].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.is_checked}
                      onCheckedChange={() => handleCheckItem(item.id, item.is_checked)}
                      disabled={loading === item.id}
                    />
                    <label
                      htmlFor={item.id}
                      className={`flex-1 cursor-pointer text-sm ${
                        item.is_checked ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {item.item_name}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
