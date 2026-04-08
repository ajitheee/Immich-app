// Server configuration
export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: 'development' | 'production' | 'test';
  apiPrefix: string;
}

// Database configuration
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  poolSize: number;
}

// Redis configuration
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

// Storage configuration
export interface StorageConfig {
  type: 'local' | 's3';
  localPath: string;
  uploadDir: string;
  thumbnailDir: string;
  encodedDir: string;
  maxFileSize: number;
}

// Auth configuration
export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  bcryptSaltRounds: number;
  oauth: OAuthConfig;
}

export interface OAuthConfig {
  google?: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  github?: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
}

// ML Service configuration
export interface MLConfig {
  host: string;
  port: number;
  timeout: number;
  faceRecognitionModel: string;
  objectDetectionModel: string;
  embeddingModel: string;
}

// Logging configuration
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'simple';
}

// App configuration
export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  storage: StorageConfig;
  auth: AuthConfig;
  ml: MLConfig;
  logging: LoggingConfig;
}

// Default configuration values
export const defaultServerConfig: ServerConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: (process.env.NODE_ENV as ServerConfig['nodeEnv']) || 'development',
  apiPrefix: '/api',
};

export const defaultDatabaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'immich_clone',
  ssl: process.env.DB_SSL === 'true',
  poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
};

export const defaultRedisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
};

export const defaultStorageConfig: StorageConfig = {
  type: 'local',
  localPath: process.env.STORAGE_PATH || './data/storage',
  uploadDir: 'uploads',
  thumbnailDir: 'thumbnails',
  encodedDir: 'encoded',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '107374182400', 10), // 100GB
};

export const defaultAuthConfig: AuthConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  oauth: {
    google: process.env.GOOGLE_CLIENT_ID
      ? {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          callbackUrl: process.env.GOOGLE_CALLBACK_URL || '/api/auth/oauth/google/callback',
        }
      : undefined,
    github: process.env.GITHUB_CLIENT_ID
      ? {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
          callbackUrl: process.env.GITHUB_CALLBACK_URL || '/api/auth/oauth/github/callback',
        }
      : undefined,
  },
};

export const defaultMLConfig: MLConfig = {
  host: process.env.ML_HOST || 'localhost',
  port: parseInt(process.env.ML_PORT || '3003', 10),
  timeout: parseInt(process.env.ML_TIMEOUT || '30000', 10),
  faceRecognitionModel: process.env.FACE_MODEL || 'buffalo_l',
  objectDetectionModel: process.env.OBJECT_MODEL || 'yolov8n',
  embeddingModel: process.env.EMBEDDING_MODEL || 'clip-ViT-B-32',
};

export const defaultLoggingConfig: LoggingConfig = {
  level: (process.env.LOG_LEVEL as LoggingConfig['level']) || 'info',
  format: (process.env.LOG_FORMAT as LoggingConfig['format']) || 'simple',
};

// Configuration factory
export function createConfig(): AppConfig {
  return {
    server: defaultServerConfig,
    database: defaultDatabaseConfig,
    redis: defaultRedisConfig,
    storage: defaultStorageConfig,
    auth: defaultAuthConfig,
    ml: defaultMLConfig,
    logging: defaultLoggingConfig,
  };
}

// Environment-specific configurations
export function isDevelopment(): boolean {
  return defaultServerConfig.nodeEnv === 'development';
}

export function isProduction(): boolean {
  return defaultServerConfig.nodeEnv === 'production';
}

export function isTest(): boolean {
  return defaultServerConfig.nodeEnv === 'test';
}