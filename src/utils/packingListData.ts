import type { PackingItem } from '@/types/packingList';

// Complete packing list with preset rules
export const PACKING_ITEMS: PackingItem[] = [
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

/**
 * Filter items based on selected preset
 * @param preset - The preset ID (e.g., 'summer-hut-trek')
 * @returns Filtered array of packing items for the preset
 */
export function getItemsForPreset(preset: string): PackingItem[] {
  return PACKING_ITEMS.filter(item => {
    // Remove items that should be removed for this preset
    if (item.removedInPresets?.includes(preset)) {
      return false;
    }
    // Only show items added for this specific preset, or items with no preset restrictions
    if (item.addedInPresets) {
      return item.addedInPresets.includes(preset);
    }
    return true;
  });
}
