import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Package } from 'lucide-react';
import PackingListManagerV2 from '@/components/packing-list/PackingListManagerV2';
import type { PackingListData } from '@/types/packingList';
import { Button } from '@/components/ui/button';

interface PackingListSectionProps {
  onSave?: () => Promise<void>;
  onNext?: () => Promise<void>;
  onPrev?: () => void;
  isSaving: boolean;
}

export default function PackingListSection({ 
  onSave, 
  onNext, 
  onPrev, 
  isSaving 
}: PackingListSectionProps) {
  const { setValue, watch, trigger } = useFormContext();
  
  const packingList = watch('packing_list') as PackingListData | undefined;
  const enabled = packingList?.enabled ?? false;

  const handleToggle = (checked: boolean) => {
    setValue('packing_list', {
      ...packingList,
      enabled: checked,
      lastUpdated: new Date().toISOString()
    });
  };

  const handlePackingListSave = async (listData: any) => {
    setValue('packing_list', {
      enabled: true,
      preset: listData.preset,
      customItems: listData.customItems || [],
      excludedItems: listData.excludedItems || [],
      guideNotes: listData.guideNotes || '',
      lastUpdated: new Date().toISOString()
    });
    
    // Auto-save changes
    if (onSave) {
      await onSave();
    }
  };

  const handleNext = async () => {
    const isValid = await trigger(['packing_list']);
    if (isValid && onNext) await onNext();
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-burgundy shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-playfair text-charcoal">
            <Package className="h-5 w-5 text-burgundy" />
            Packing List
          </CardTitle>
          <CardDescription className="text-charcoal/60">
            Provide hikers with a comprehensive packing list for your tour
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="packing-list-enabled" className="text-base font-medium">
              Include Packing List for this tour
            </Label>
            <Switch
              id="packing-list-enabled"
              checked={enabled}
              onCheckedChange={handleToggle}
            />
          </div>

          {enabled && (
            <div className="mt-6">
              <PackingListManagerV2
                tourType={packingList?.preset}
                existingList={packingList}
                onSave={handlePackingListSave}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {onPrev && (
          <Button type="button" variant="outline" onClick={onPrev}>
            Previous
          </Button>
        )}
        <div className="flex-1" />
        {onNext && (
          <Button onClick={handleNext} size="lg" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Next'}
          </Button>
        )}
      </div>
    </div>
  );
}
