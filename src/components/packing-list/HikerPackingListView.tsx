import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Package, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { PackingListData } from '@/types/packingList';
import { getItemsForPreset } from '@/utils/packingListData';

interface HikerPackingListViewProps {
  packingList: PackingListData;
}

export default function HikerPackingListView({ packingList }: HikerPackingListViewProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['essentials']));

  // Get preset items based on selected preset
  const presetItems = packingList.preset 
    ? getItemsForPreset(packingList.preset)
    : [];
  
  // Filter out excluded items and merge with custom items
  const excludedIds = packingList.excludedItems || [];
  const includedPresetItems = presetItems.filter(item => !excludedIds.includes(item.id));
  
  const allItems = [
    ...includedPresetItems,
    ...(packingList.customItems || [])
  ];

  // Group items by category
  const itemsByCategory = allItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof allItems>);

  const totalItems = allItems.length;
  const checkedCount = checkedItems.size;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  if (!packingList.enabled) {
    return null;
  }

  return (
    <div className="space-y-4">
      {packingList.guideNotes && (
        <Alert className="border-burgundy/20 bg-cream">
          <Info className="h-4 w-4 text-burgundy" />
          <AlertDescription className="text-charcoal">
            <strong>Guide Notes:</strong> {packingList.guideNotes}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-charcoal">
            Packing Progress
          </p>
          <p className="text-sm text-charcoal/60">
            {checkedCount} / {totalItems} items
          </p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-3">
        {Object.entries(itemsByCategory).map(([category, items]) => {
          const isExpanded = expandedCategories.has(category);
          const categoryChecked = items.filter(item => checkedItems.has(item.id)).length;
          
          return (
            <Card key={category}>
              <CardHeader 
                className="cursor-pointer hover:bg-cream/50 transition-colors py-3"
                onClick={() => toggleCategory(category)}
              >
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-burgundy" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-burgundy" />
                    )}
                    <span className="capitalize">{category}</span>
                    <Badge variant="outline" className="ml-2">
                      {categoryChecked} / {items.length}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              {isExpanded && (
                <CardContent className="pt-0 space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-cream/50 transition-colors"
                    >
                      <Checkbox
                        id={item.id}
                        checked={checkedItems.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <label
                        htmlFor={item.id}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {item.name}
                      </label>
                      {!item.essential && (
                        <Badge variant="outline" className="text-xs border-charcoal/30 text-charcoal/60">
                          Optional
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
