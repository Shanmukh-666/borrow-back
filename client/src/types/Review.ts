export interface Review {
  id: string;
  request: string;
  reviewer: {
    id: string;
    name: string;
  };
  reviewee: {
    id: string;
    name: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface UserReviewSummary {
  totalReviews: number;
  averageRating: number | null;
}
