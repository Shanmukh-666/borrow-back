import { apiRequest } from './api';
import { Item, ItemListResponse, MyItemsResponse, ItemCategory, ItemCondition } from '../types/Item';

export interface ItemFilterParams {
  search?: string;
  category?: string;
  condition?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateItemPayload {
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  pickupNote?: string;
  imageUrl?: string;
}

export const itemService = {
  async getItems(filters: ItemFilterParams = {}): Promise<ItemListResponse> {
    return apiRequest<ItemListResponse>('/items', {
      method: 'GET',
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  },

  async getMyItems(): Promise<MyItemsResponse> {
    return apiRequest<MyItemsResponse>('/items/mine', {
      method: 'GET',
    });
  },

  async getItemById(id: string): Promise<Item> {
    const res = await apiRequest<{ item: Item }>(`/items/${id}`, {
      method: 'GET',
    });
    return res.item;
  },

  async createItem(payload: CreateItemPayload): Promise<Item> {
    const res = await apiRequest<{ item: Item }>('/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.item;
  },

  async updateItem(id: string, payload: Partial<CreateItemPayload> & { status?: 'active' | 'archived' }): Promise<Item> {
    const res = await apiRequest<{ item: Item }>(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.item;
  },

  async archiveItem(id: string): Promise<Item> {
    const res = await apiRequest<{ item: Item }>(`/items/${id}`, {
      method: 'DELETE',
    });
    return res.item;
  },

  async reactivateItem(id: string): Promise<Item> {
    const res = await apiRequest<{ item: Item }>(`/items/${id}/reactivate`, {
      method: 'PATCH',
    });
    return res.item;
  },
};
