// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarPath: string | null;
  storageQuota: number;
  storageUsed: number;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserData {
  name?: string;
  avatarPath?: string;
}

// Asset types
export type AssetType = 'IMAGE' | 'VIDEO';

export interface Asset {
  id: string;
  userId: string;
  deviceId: string | null;
  fileName: string;
  originalPath: string;
  thumbnailPath: string | null;
  fileSize: number;
  mimeType: string;
  type: AssetType;
  isArchived: boolean;
  isFavorite: boolean;
  isTrashed: boolean;
  capturedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetMetadata {
  id: string;
  assetId: string;
  exifData: Record<string, unknown> | null;
  width: number | null;
  height: number | null;
  latitude: number | null;
  longitude: number | null;
  cameraMake: string | null;
  cameraModel: string | null;
  lensModel: string | null;
  iso: number | null;
  aperture: number | null;
  shutterSpeed: string | null;
  focalLength: number | null;
}

export interface CreateAssetData {
  userId: string;
  deviceId?: string;
  fileName: string;
  originalPath: string;
  fileSize: number;
  mimeType: string;
  type: AssetType;
  capturedAt?: Date;
}

// Album types
export interface Album {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  coverAssetId: string | null;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAlbumData {
  userId: string;
  name: string;
  description?: string;
}

export interface UpdateAlbumData {
  name?: string;
  description?: string;
  coverAssetId?: string;
  isShared?: boolean;
}

// People types
export interface Person {
  id: string;
  userId: string;
  name: string | null;
  thumbnailPath: string | null;
  faceCount: number;
  isHidden: boolean;
  createdAt: Date;
}

export interface Face {
  id: string;
  assetId: string;
  personId: string | null;
  embedding: number[];
  boundingBox: BoundingBox;
  confidence: number;
  createdAt: Date;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Search types
export interface SearchFilters {
  query?: string;
  type?: AssetType;
  userId?: string;
  albumId?: string;
  personId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  isFavorite?: boolean;
  isArchived?: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OAuthProvider {
  name: string;
  displayName: string;
  icon: string;
}

// Job types
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  id: string;
  name: string;
  data: Record<string, unknown>;
  status: JobStatus;
  error: string | null;
  attempts: number;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Upload types
export interface UploadProgress {
  fileName: string;
  uploaded: number;
  total: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
}

export interface PresignedUpload {
  uploadUrl: string;
  assetId: string;
  key: string;
}