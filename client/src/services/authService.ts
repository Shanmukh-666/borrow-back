import { apiRequest } from './api';
import { User } from '../types/User';

export const authService = {
  async register(name: string, email: string, password: string): Promise<User> {
    const res = await apiRequest<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return res.user;
  },

  async login(email: string, password: string): Promise<User> {
    const res = await apiRequest<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res.user;
  },

  async logout(): Promise<void> {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<User> {
    const res = await apiRequest<{ user: User }>('/auth/me', {
      method: 'GET',
    });
    return res.user;
  },
};
