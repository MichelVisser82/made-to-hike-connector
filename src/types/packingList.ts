export interface PackingItem {
  id: string;
  name: string;
  category: string;
  essential: boolean;
  removedInPresets?: string[];
  addedInPresets?: string[];
}

export interface CustomPackingItem {
  id: string;
  name: string;
  category: string;
  essential: boolean;
}

export type PackingListPreset = 
  | 'summer-hut-trek'
  | 'luggage-transfer'
  | 'day-hike'
  | 'winter-alpine'
  | 'via-ferrata'
  | 'high-altitude';

export interface PackingListData {
  enabled: boolean;
  preset?: PackingListPreset;
  customItems?: CustomPackingItem[];
  excludedItems?: string[]; // IDs of preset items that guide has deselected
  guideNotes?: string;
  lastUpdated?: string;
}
