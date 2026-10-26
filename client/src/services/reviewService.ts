import { apiRequest } from './api';
import { Review, UserReviewSummary } from '../types/Review';
import { Pagination } from '../types/ApiResponse';

export const reviewService = {
  async submitReview(
    requestId: string,
    rating: number,
    comment?: string
  ): Promise<Review> {
    const res = await apiRequest<{ review: Review }>(`/requests/${requestId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
    return res.review;
  },

  async getUserReviews(
    userId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{
    reviews: Review[];
    summary: UserReviewSummary;
    pagination: Pagination;
  }> {
    return apiRequest<{
      reviews: Review[];
      summary: UserReviewSummary;
      pagination: Pagination;
    }>(`/users/${userId}/reviews`, {
      method: 'GET',
      params,
    });
  },
};
