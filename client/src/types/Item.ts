export const ITEM_CATEGORIES = [
  'Books & Study',
  'Electronics',
  'Tools & DIY',
  'Sports & Outdoors',
  'Home & Kitchen',
  'Event & Presentation',
  'Other',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const ITEM_CONDITIONS = ['New', 'Like New', 'Good', 'Fair'] as const;
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const ITEM_STATUSES = ['active', 'archived'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export interface ItemOwnerSummary {
  id: string;
  name: string;
  rating?: number | null;
  reviewCount?: number;
}

export interface Item {
  id: string;
  owner: {
    id: string;
    name: string;
    createdAt?: string;
  };
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  pickupNote?: string;
  imageUrl?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  ownerSummary?: ItemOwnerSummary;
}

export interface ItemListResponse {
  items: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MyItemsResponse {
  items: Item[];
  counts: {
    total: number;
    active: number;
    archived: number;
  };
}
