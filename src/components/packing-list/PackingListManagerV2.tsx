import { useState } from "react";
import { 
  Package, Plus, X, Check, Sparkles, MessageSquare, Eye,
  Mountain, Snowflake, Anchor, Sun, Backpack, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PackingItem {
  id: string;
  name: string;
  category: string;
  essential: boolean;
  removedInPresets?: string[]; // Which presets remove this item
  addedInPresets?: string[]; // Which presets add this item
}

interface CustomItem {
  id: string;
  name: string;
  category: string;
  essential: boolean;
}

interface PackingListManagerV2Props {
  tourType?: string;
  onSave?: (list: any) => void;
  existingList?: any;
}

export default function PackingListManagerV2({ 
  tourType = "summer-hut-trek", 
  onSave,
  existingList 
}: PackingListManagerV2Props) {
  const [selectedPreset, setSelectedPreset] = useState(existingList?.preset || tourType);
  const [customItems, setCustomItems] = useState<CustomItem[]>(existingList?.customItems || []);
  const [excludedItems, setExcludedItems] = useState<string[]>(existingList?.excludedItems || []);
  const [guideNotes, setGuideNotes] = useState(existingList?.guideNotes || "");
  const [newItemName, setNewItemName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newItemEssential, setNewItemEssential] = useState(false);

  // Save data whenever preset, customItems, excludedItems, or guideNotes change
  const saveData = (preset: string, items: CustomItem[], excluded: string[], notes: string) => {
    if (onSave) {
      onSave({
        preset,
        customItems: items,
        excludedItems: excluded,
        guideNotes: notes
      });
    }
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    setExcludedItems([]); // Reset exclusions when changing preset
    saveData(presetId, customItems, [], guideNotes);
  };

  const handleGuideNotesChange = (notes: string) => {
    setGuideNotes(notes);
    saveData(selectedPreset, customItems, excludedItems, notes);
  };

  const toggleItemExclusion = (itemId: string) => {
    const newExcluded = excludedItems.includes(itemId)
      ? excludedItems.filter(id => id !== itemId)
      : [...excludedItems, itemId];
    setExcludedItems(newExcluded);
    saveData(selectedPreset, customItems, newExcluded, guideNotes);
  };

  // Preset configurations
  const presets = [
    { 
      id: "summer-hut-trek",
      name: "Summer Hut Trek",
      icon: Mountain,
      color: "sage",
      packSize: "30-40L",
      weightTarget: "8-12kg",
      description: "Standard multi-day hut-based tour"
    },
    { 
      id: "luggage-transfer",
      name: "Luggage Transfer",
      icon: Backpack,
      color: "blue",
      packSize: "20-30L",
      weightTarget: "3-6kg",
      description: "Light daypack, bags transferred"
    },
    { 
      id: "day-hike",
      name: "Day Hike",
      icon: Sun,
      color: "gold",
      packSize: "20-28L",
      weightTarget: "3-5kg",
      description: "Single base, day trips only"
    },
    { 
      id: "winter-alpine",
      name: "Winter/Snow",
      icon: Snowflake,
      color: "burgundy",
      packSize: "35-45L",
      weightTarget: "12-15kg",
      description: "Winter mountaineering gear"
    },
    { 
      id: "via-ferrata",
      name: "Via Ferrata",
      icon: Anchor,
      color: "purple",
      packSize: "30-40L",
      weightTarget: "10-13kg",
      description: "Includes climbing equipment"
    }
  ];

  // Complete packing list with preset rules
  const packingItems: PackingItem[] = [
    // BACKPACK & CARRYING
    { id: "bp1", name: "30-40L backpack with hip belt and rain cover", category: "Backpack", essential: true, removedInPresets: ["luggage-transfer", "day-hike"] },
    { id: "bp1a", name: "20-30L daypack with rain cover", category: "Backpack", essential: true, addedInPresets: ["luggage-transfer", "day-hike"] },
    { id: "bp2", name: "Trekking poles (collapsible, wide baskets)", category: "Backpack", essential: true },
    
    // FOOTWEAR
    { id: "fw1", name: "Hiking boots with ankle support, waterproof (Vibram sole)", category: "Footwear", essential: true },
    { id: "fw1w", name: "B2-rated mountaineering boots (crampon compatible)", category: "Footwear", essential: true, addedInPresets: ["winter-alpine"] },
    { id: "fw2", name: "Merino wool hiking socks (3-4 pairs)", category: "Footwear", essential: true },
    { id: "fw3", name: "Hut shoes or sandals", category: "Footwear", essential: true, removedInPresets: ["day-hike"] },
    
    // CLOTHING - BASE LAYERS
    { id: "cl1", name: "Base layer top, long-sleeve (merino/synthetic)", category: "Base Layers", essential: true },
    { id: "cl2", name: "Base layer bottom", category: "Base Layers", essential: true },
    { id: "cl3", name: "Technical t-shirts (2-3 mix long/short)", category: "Base Layers", essential: true, removedInPresets: ["day-hike"] },
    { id: "cl3d", name: "Technical t-shirt (1)", category: "Base Layers", essential: true, addedInPresets: ["day-hike"] },
    { id: "cl4", name: "Hiking pants (synthetic, quick-dry)", category: "Base Layers", essential: true },
    { id: "cl5", name: "Hiking shorts", category: "Base Layers", essential: false },
    { id: "cl6", name: "Underwear (3-4 sets)", category: "Base Layers", essential: true, removedInPresets: ["day-hike"] },
    { id: "cl6d", name: "Underwear (1 extra set)", category: "Base Layers", essential: false, addedInPresets: ["day-hike"] },
    
    // INSULATION
    { id: "in1", name: "Mid-layer fleece or lightweight insulated jacket", category: "Insulation", essential: true },
    { id: "in2", name: "Insulated down/synthetic jacket (evenings)", category: "Insulation", essential: true },
    { id: "in2w", name: "Down jacket rated to -15°C minimum", category: "Insulation", essential: true, addedInPresets: ["winter-alpine"] },
    { id: "in3", name: "Waterproof shell jacket with hood (Gore-Tex)", category: "Insulation", essential: true },
    { id: "in4", name: "Waterproof pants", category: "Insulation", essential: true },
    
    // HEAD & HANDS
    { id: "hh1", name: "Sun hat or cap", category: "Head & Hands", essential: true },
    { id: "hh2", name: "Warm hat or beanie", category: "Head & Hands", essential: true },
    { id: "hh3", name: "Lightweight gloves", category: "Head & Hands", essential: true },
    { id: "hh4", name: "Warmer insulated gloves or mittens", category: "Head & Hands", essential: true },
    { id: "hh4w", name: "Winter-specific gloves AND mittens", category: "Head & Hands", essential: true, addedInPresets: ["winter-alpine"] },
    { id: "hh5", name: "Sunglasses (UV Category 3)", category: "Head & Hands", essential: true, removedInPresets: ["winter-alpine"] },
    { id: "hh5w", name: "Glacier sunglasses (UV Category 4)", category: "Head & Hands", essential: true, addedInPresets: ["winter-alpine"] },
    { id: "hh6", name: "Buff or neck gaiter", category: "Head & Hands", essential: true },
    { id: "hh7", name: "Balaclava or face mask", category: "Head & Hands", essential: true, addedInPresets: ["winter-alpine"] },
    
    // PROTECTION & FIRST AID
    { id: "pc1", name: "Sunscreen (SPF 30+)", category: "Protection", essential: true, removedInPresets: ["winter-alpine"] },
    { id: "pc1w", name: "Sunscreen (SPF 50+)", category: "Protection", essential: true, addedInPresets: ["winter-alpine"] },
    { id: "pc2", name: "Lip balm with SPF", category: "Protection", essential: true },
    { id: "pc3", name: "Blister treatment (Compeed/moleskin)", category: "Protection", essential: true },
    { id: "pc4", name: "Bandages and pain relievers", category: "Protection", essential: true },
    { id: "pc5", name: "Personal prescription medications", category: "Protection", essential: true },
    
    // TOILETRIES
    { id: "tl1", name: "Toothbrush and toothpaste", category: "Toiletries", essential: true, removedInPresets: ["day-hike"] },
    { id: "tl2", name: "Biodegradable soap", category: "Toiletries", essential: true, removedInPresets: ["day-hike"] },
    { id: "tl3", name: "Microfiber towel (small, quick-dry)", category: "Toiletries", essential: true, removedInPresets: ["day-hike"] },
    { id: "tl4", name: "Hand sanitizer", category: "Toiletries", essential: false },
    
    // NAVIGATION & SAFETY
    { id: "nv1", name: "Topographic map (region-appropriate)", category: "Navigation", essential: true },
    { id: "nv2", name: "Compass", category: "Navigation", essential: true },
    { id: "nv3", name: "GPS device or smartphone with offline maps", category: "Navigation", essential: true },
    { id: "nv4", name: "Headlamp with spare batteries", category: "Navigation", essential: true },
    { id: "nv5", name: "Mobile phone with emergency contacts", category: "Navigation", essential: true },
    { id: "nv6", name: "Portable power bank (10,000mAh)", category: "Navigation", essential: true, removedInPresets: ["day-hike"] },
    { id: "nv7", name: "Emergency whistle", category: "Navigation", essential: true },
    { id: "nv8", name: "Emergency blanket or bivy sack", category: "Navigation", essential: true },
    
    // HYDRATION & NUTRITION
    { id: "hy1", name: "Water bottles (1.5-2L capacity, wide-mouth)", category: "Hydration", essential: true },
    { id: "hy2", name: "Snacks and energy food (bars, nuts, chocolate)", category: "Hydration", essential: true },
    { id: "hy3", name: "Small plastic bags for trash", category: "Hydration", essential: true },
    
    // HUT ESSENTIALS
    { id: "ht1", name: "Sleeping bag liner (silk or cotton - MANDATORY)", category: "Hut Essentials", essential: true, removedInPresets: ["day-hike", "luggage-transfer"] },
    { id: "ht1t", name: "Sleeping bag liner (in transferred luggage)", category: "Hut Essentials", essential: true, addedInPresets: ["luggage-transfer"] },
    { id: "ht2", name: "Ear plugs (for dormitory sleeping)", category: "Hut Essentials", essential: true, removedInPresets: ["day-hike"] },
    { id: "ht3", name: "Cash (€200-300 in small bills)", category: "Hut Essentials", essential: true },
    { id: "ht4", name: "Small laundry detergent", category: "Hut Essentials", essential: true, removedInPresets: ["day-hike"] },
    
    // DOCUMENTS
    { id: "dc1", name: "Passport or national ID", category: "Documents", essential: true },
    { id: "dc2", name: "Travel insurance documents", category: "Documents", essential: true },
    { id: "dc3", name: "Mobile phone charger with European adapter", category: "Documents", essential: true },
    { id: "dc4", name: "Credit card plus cash", category: "Documents", essential: true },
    
    // WINTER ADDITIONS
    { id: "wt1", name: "Steel 12-point crampons with bag", category: "Winter Equipment", essential: true, addedInPresets: ["winter-alpine"] },
    { id: "wt2", name: "60cm mountaineering ice axe", category: "Winter Equipment", essential: true, addedInPresets: ["winter-alpine"] },
    { id: "wt3", name: "Avalanche beacon, probe, and shovel", category: "Winter Equipment", essential: true, addedInPresets: ["winter-alpine"] },
    { id: "wt4", name: "Glacier gaiters", category: "Winter Equipment", essential: true, addedInPresets: ["winter-alpine"] },
    
    // VIA FERRATA ADDITIONS
    { id: "vf1", name: "Climbing helmet", category: "Via Ferrata Equipment", essential: true, addedInPresets: ["via-ferrata"] },
    { id: "vf2", name: "Climbing harness", category: "Via Ferrata Equipment", essential: true, addedInPresets: ["via-ferrata"] },
    { id: "vf3", name: "Via ferrata set (energy-absorbing lanyards)", category: "Via Ferrata Equipment", essential: true, addedInPresets: ["via-ferrata"] },
    { id: "vf4", name: "Via ferrata gloves (light leather)", category: "Via Ferrata Equipment", essential: false, addedInPresets: ["via-ferrata"] },
  ];

  // Filter items based on selected preset
  const getItemsForPreset = () => {
    return packingItems.filter(item => {
      // Remove items that should be removed for this preset
      if (item.removedInPresets?.includes(selectedPreset)) {
        return false;
      }
      // Only show items added for this specific preset, or items with no preset restrictions
      if (item.addedInPresets) {
        return item.addedInPresets.includes(selectedPreset);
      }
      return true;
    });
  };

  // Group items by category (don't filter out excluded items)
  const groupedItems = getItemsForPreset().reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  const currentPreset = presets.find(p => p.id === selectedPreset);
  const allItems = getItemsForPreset();
  const includedItems = allItems.filter(i => !excludedItems.includes(i.id));
  const essentialCount = includedItems.filter(i => i.essential).length;
  const optionalCount = includedItems.filter(i => !i.essential).length;

  const addCustomItem = () => {
    if (newItemName.trim() && selectedCategory) {
      const newItem = {
        id: `custom-${Date.now()}`,
        name: newItemName,
        category: selectedCategory,
        essential: newItemEssential
      };
      const updatedItems = [...customItems, newItem];
      setCustomItems(updatedItems);
      
      // Reset and close dialog
      setNewItemName("");
      setNewItemEssential(false);
      setAddItemDialogOpen(false);
      
      // Auto-save
      saveData(selectedPreset, updatedItems, excludedItems, guideNotes);
    }
  };

  const openAddItemDialog = (category: string) => {
    setSelectedCategory(category);
    setNewItemName("");
    setNewItemEssential(false);
    setAddItemDialogOpen(true);
  };

  const removeCustomItem = (id: string) => {
    const updatedItems = customItems.filter(item => item.id !== id);
    setCustomItems(updatedItems);
    saveData(selectedPreset, updatedItems, excludedItems, guideNotes);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl text-charcoal mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
            Packing List Configuration
          </h2>
          <p className="text-charcoal/70">
            Choose your tour type to generate the right packing list
          </p>
        </div>
        {!showPreview && (
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="border-burgundy/30 text-burgundy"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Hiker View
          </Button>
        )}
        {showPreview && (
          <Button
            onClick={() => setShowPreview(false)}
            className="bg-burgundy hover:bg-burgundy-dark text-white"
          >
            Back to Editing
          </Button>
        )}
      </div>

      {!showPreview ? (
        <>
          {/* Preset Selection - Improved Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {presets.map(preset => {
              const Icon = preset.icon;
              const isSelected = selectedPreset === preset.id;
              
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-burgundy bg-burgundy/5 shadow-lg scale-105'
                      : 'border-burgundy/10 hover:border-burgundy/30 bg-white'
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-burgundy' : 'bg-charcoal/5'
                    }`}>
                      <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-charcoal/40'}`} />
                    </div>
                    <div>
                      <h3 className={`font-medium mb-1 ${isSelected ? 'text-burgundy' : 'text-charcoal'}`}>
                        {preset.name}
                      </h3>
                      <p className="text-xs text-charcoal/60 mb-2">{preset.description}</p>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-xs">
                          {preset.packSize}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {preset.weightTarget}
                        </Badge>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full bg-burgundy flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Summary Stats */}
          <Card className="p-6 bg-white border-burgundy/10">
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl text-burgundy mb-1" style={{fontFamily: 'Playfair Display, serif'}}>
                  {currentPreset?.packSize}
                </div>
                <div className="text-sm text-charcoal/70">Pack Size</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-burgundy mb-1" style={{fontFamily: 'Playfair Display, serif'}}>
                  {currentPreset?.weightTarget}
                </div>
                <div className="text-sm text-charcoal/70">Target Weight</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-burgundy mb-1" style={{fontFamily: 'Playfair Display, serif'}}>
                  {essentialCount}
                </div>
                <div className="text-sm text-charcoal/70">Essential Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-charcoal/40 mb-1" style={{fontFamily: 'Playfair Display, serif'}}>
                  {optionalCount}
                </div>
                <div className="text-sm text-charcoal/70">Optional Items</div>
              </div>
            </div>
          </Card>

          {/* Packing List - Simplified Layout */}
          <Card className="p-6 bg-white border-burgundy/10">
            <h3 className="text-2xl mb-6 text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
              Standard Items for {currentPreset?.name}
            </h3>

            <div className="space-y-8">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-charcoal flex items-center gap-2 text-lg">
                      <Package className="w-5 h-5 text-burgundy" />
                      {category}
                      <Badge variant="outline" className="text-xs">
                        {items.length} items
                      </Badge>
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAddItemDialog(category)}
                      className="h-8 gap-1 text-burgundy hover:text-burgundy hover:bg-burgundy/10"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map(item => (
                      <div 
                        key={item.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border border-charcoal/10 bg-white ${
                          item.essential ? 'border-l-4 border-l-burgundy' : ''
                        }`}
                      >
                        <Checkbox 
                          checked={!excludedItems.includes(item.id)}
                          onCheckedChange={() => toggleItemExclusion(item.id)}
                          className="mt-0.5 flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                          <p className="text-sm text-charcoal leading-snug break-words">{item.name}</p>
                          {!item.essential && (
                            <Badge variant="outline" className="text-xs flex-shrink-0 border-charcoal/30 text-charcoal/60">
                              Optional
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-8" />
                </div>
              ))}
            </div>
          </Card>

          {/* Custom Items Summary */}
          {customItems.length > 0 && (
            <Card className="p-6 bg-sage/5 border-sage/20">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-sage" />
                <h3 className="text-xl text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
                  Custom Items Added
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {customItems.map(item => (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
                      item.essential ? 'border-burgundy/40' : 'border-sage/30'
                    }`}
                  >
                    <Check className="w-4 h-4 text-sage" />
                    <div className="flex-1">
                      <p className="text-sm text-charcoal">{item.name}</p>
                      <p className="text-xs text-charcoal/50">{item.category}</p>
                    </div>
                    {item.essential && (
                      <Badge variant="destructive" className="text-xs">Essential</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCustomItem(item.id)}
                      className="text-charcoal/40 hover:text-burgundy h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Info Banner */}
          <div className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-sm">
            <p className="text-sm text-charcoal/70">
              <Check className="w-4 h-4 inline-block mr-2 text-sage" />
              Changes are saved automatically. This list will be sent with booking confirmations.
            </p>
          </div>
        </>
      ) : (
        // PREVIEW MODE - Hiker View
        <Card className="p-8 bg-white border-burgundy/10 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="bg-sage text-white mb-4">Preview: What Hikers Will See</Badge>
            <h2 className="text-3xl text-charcoal mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
              Your Packing Checklist
            </h2>
            <p className="text-charcoal/70 mb-4">
              {currentPreset?.name} • Target: {currentPreset?.weightTarget}
            </p>
            <Separator />
          </div>

          {/* Simplified checklist for hikers */}
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <h4 className="font-medium text-charcoal mb-3">{category}</h4>
                <div className="space-y-1.5">
                  {items.map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-2 justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 border-2 border-charcoal/30 rounded mt-0.5 flex-shrink-0" />
                        <span className="text-charcoal/80 text-sm">{item.name}</span>
                      </div>
                      {!item.essential && (
                        <Badge variant="outline" className="text-xs border-charcoal/30 text-charcoal/60 flex-shrink-0">
                          Optional
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Custom Items in Preview */}
            {customItems.length > 0 && (
              <div className="pt-4 border-t-2 border-sage/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-sage" />
                  <h4 className="font-medium text-charcoal">Special Items for This Tour</h4>
                </div>
                <div className="space-y-1.5">
                  {customItems.map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-2 bg-sage/5 rounded justify-between">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-sage mt-0.5" />
                        <span className="text-charcoal/80 text-sm">{item.name}</span>
                      </div>
                      {!item.essential && (
                        <Badge variant="outline" className="text-xs border-charcoal/30 text-charcoal/60 flex-shrink-0">
                          Optional
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="my-8" />
          
          <div className="text-center text-sm text-charcoal/60">
            <p>Total: {includedItems.length + customItems.length} items • Pack size: {currentPreset?.packSize}</p>
          </div>
        </Card>
      )}

      {/* Add Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-playfair text-charcoal">
              <Plus className="w-5 h-5 text-burgundy" />
              Add Custom Item
            </DialogTitle>
            <DialogDescription>
              Add a custom item to <span className="font-medium text-charcoal">{selectedCategory}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-charcoal font-medium">
                Item Name
              </Label>
              <Input
                id="item-name"
                placeholder="e.g., Swimsuit for alpine lake"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                className="bg-white"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="essential-toggle" className="text-charcoal font-medium">
                  Mark as Essential
                </Label>
                <p className="text-sm text-charcoal/60">
                  Essential items are highlighted for hikers
                </p>
              </div>
              <Switch
                id="essential-toggle"
                checked={newItemEssential}
                onCheckedChange={setNewItemEssential}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setAddItemDialogOpen(false)}
              className="border-charcoal/20"
            >
              Cancel
            </Button>
            <Button
              onClick={addCustomItem}
              disabled={!newItemName.trim()}
              className="bg-burgundy hover:bg-burgundy/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}