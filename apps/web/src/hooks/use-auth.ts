import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarPath: string | null;
    storageQuota: number;
    storageUsed: number;
    isAdmin: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function useLogin() {
  const { setUser, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    },
  });
}

export function useRegister() {
  const { setUser, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    },
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      logout();
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
    enabled: isAuthenticated,
  });
}

export function useStorageInfo() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['storageInfo'],
    queryFn: async () => {
      const response = await api.get('/users/me/storage');
      return response.data;
    },
    enabled: isAuthenticated,
  });
}