import apiClient from '@/lib/axios';
import { LoginCredentials, LoginResponse } from '@/types/auth';

export const authService = {
  /**
   * Log in user with username and password
   * Uses POST /auth/login from DummyJSON
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      username: credentials.username.trim(),
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 120,
    });
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<LoginResponse> {
    const response = await apiClient.get<LoginResponse>('/auth/me');
    return response.data;
  },
};
