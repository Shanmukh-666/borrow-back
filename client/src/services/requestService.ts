import { apiRequest } from './api';
import { BorrowRequest, DashboardSummary, RecentActivityItem } from '../types/BorrowRequest';
import { Pagination } from '../types/ApiResponse';

export const requestService = {
  async submitRequest(payload: {
    itemId: string;
    startDate: string;
    endDate: string;
    message?: string;
  }): Promise<BorrowRequest> {
    const res = await apiRequest<{ request: BorrowRequest }>('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.request;
  },

  async getMyRequests(params: { status?: string; page?: number; limit?: number } = {}): Promise<{
    requests: BorrowRequest[];
    pagination: Pagination;
  }> {
    return apiRequest<{ requests: BorrowRequest[]; pagination: Pagination }>('/requests/mine', {
      method: 'GET',
      params,
    });
  },

  async getReceivedRequests(params: { status?: string; page?: number; limit?: number } = {}): Promise<{
    requests: BorrowRequest[];
    pagination: Pagination;
  }> {
    return apiRequest<{ requests: BorrowRequest[]; pagination: Pagination }>('/requests/received', {
      method: 'GET',
      params,
    });
  },

  async getRequestById(id: string): Promise<BorrowRequest> {
    const res = await apiRequest<{ request: BorrowRequest }>(`/requests/${id}`, {
      method: 'GET',
    });
    return res.request;
  },

  async decideRequest(id: string, action: 'approve' | 'reject'): Promise<BorrowRequest> {
    const res = await apiRequest<{ request: BorrowRequest }>(`/requests/${id}/decision`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
    return res.request;
  },

  async cancelRequest(id: string): Promise<BorrowRequest> {
    const res = await apiRequest<{ request: BorrowRequest }>(`/requests/${id}/cancel`, {
      method: 'PATCH',
    });
    return res.request;
  },

  async confirmPickup(id: string, conditionNote?: string): Promise<BorrowRequest> {
    const res = await apiRequest<{ request: BorrowRequest }>(`/requests/${id}/pickup`, {
      method: 'PATCH',
      body: JSON.stringify({ conditionNote }),
    });
    return res.request;
  },

  async confirmReturn(id: string, conditionNote?: string): Promise<BorrowRequest> {
    const res = await apiRequest<{ request: BorrowRequest }>(`/requests/${id}/return`, {
      method: 'PATCH',
      body: JSON.stringify({ conditionNote }),
    });
    return res.request;
  },

  async getDashboardSummary(): Promise<{
    summary: DashboardSummary;
    recentActivity: RecentActivityItem[];
  }> {
    return apiRequest<{ summary: DashboardSummary; recentActivity: RecentActivityItem[] }>('/dashboard/summary', {
      method: 'GET',
    });
  },

  async getBorrowingHistory(params: { status?: string; role?: string } = {}): Promise<{
    history: BorrowRequest[];
  }> {
    return apiRequest<{ history: BorrowRequest[] }>('/history', {
      method: 'GET',
      params,
    });
  },
};
