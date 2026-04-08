import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Asset {
  id: string;
  userId: string;
  deviceId: string | null;
  fileName: string;
  originalPath: string;
  thumbnailPath: string | null;
  fileSize: number;
  mimeType: string;
  type: 'IMAGE' | 'VIDEO';
  isArchived: boolean;
  isFavorite: boolean;
  isTrashed: boolean;
  capturedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: AssetMetadata | null;
}

interface AssetMetadata {
  id: string;
  assetId: string;
  width: number | null;
  height: number | null;
  latitude: number | null;
  longitude: number | null;
  cameraMake: string | null;
  cameraModel: string | null;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface AssetFilters {
  page?: number;
  pageSize?: number;
  type?: 'IMAGE' | 'VIDEO';
  isFavorite?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'capturedAt' | 'fileSize';
  sortOrder?: 'ASC' | 'DESC';
}

export function useAssets(filters: AssetFilters = {}) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['assets', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.pageSize) params.set('pageSize', filters.pageSize.toString());
      if (filters.type) params.set('type', filters.type);
      if (filters.isFavorite !== undefined) params.set('isFavorite', filters.isFavorite.toString());
      if (filters.isArchived !== undefined) params.set('isArchived', filters.isArchived.toString());
      if (filters.isTrashed !== undefined) params.set('isTrashed', filters.isTrashed.toString());
      if (filters.search) params.set('search', filters.search);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

      const response = await api.get<PaginatedResponse<Asset>>(`/assets?${params.toString()}`);
      return response.data;
    },
    enabled: isAuthenticated,
  });
}

export function useAsset(id: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const response = await api.get<Asset>(`/assets/${id}`);
      return response.data;
    },
    enabled: isAuthenticated && !!id,
  });
}

export function useAssetStats() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['assetStats'],
    queryFn: async () => {
      const response = await api.get('/assets/stats');
      return response.data;
    },
    enabled: isAuthenticated,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assetIds, isFavorite }: { assetIds: string[]; isFavorite: boolean }) => {
      await api.post('/assets/bulk/favorite', { assetIds, isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useToggleArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assetIds, isArchived }: { assetIds: string[]; isArchived: boolean }) => {
      await api.post('/assets/bulk/archive', { assetIds, isArchived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useDeleteAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetIds: string[]) => {
      await api.post('/assets/bulk/trash', { assetIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function usePermanentlyDeleteAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetIds: string[]) => {
      await api.delete('/assets/bulk', { data: { assetIds } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

// Need to import useAuthStore
import { useAuthStore } from '@/stores/auth-store';