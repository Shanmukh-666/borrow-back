import { Item } from './Item';
import { User } from './User';

export const REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'borrowed',
  'return_pending',
  'completed',
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface BorrowRequest {
  id: string;
  item: Item | string;
  owner: User | { id: string; name: string };
  borrower: User | { id: string; name: string };
  startDate: string;
  endDate: string;
  message?: string;
  status: RequestStatus;
  pickupConfirmations: {
    owner: boolean;
    borrower: boolean;
  };
  returnConfirmations: {
    owner: boolean;
    borrower: boolean;
  };
  pickupConditionNotes?: {
    owner?: string;
    borrower?: string;
  };
  returnConditionNotes?: {
    owner?: string;
    borrower?: string;
  };
  borrowedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
  hasReviewed?: boolean;
}

export interface DashboardSummary {
  activeListings: number;
  incomingPendingRequests: number;
  requestsSent: number;
  activeBorrowings: number;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  itemTitle: string;
  itemCategory: string;
  role: 'owner' | 'borrower';
  counterpartName: string;
  status: RequestStatus;
  startDate: string;
  endDate: string;
  updatedAt: string;
}
