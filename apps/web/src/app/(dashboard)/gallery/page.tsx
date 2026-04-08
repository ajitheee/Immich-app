'use client';

import { useState } from 'react';
import { useAssets } from '@/hooks/use-assets';
import { useAssetStats } from '@/hooks/use-assets';

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function GalleryPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'IMAGE' | 'VIDEO'>('all');
  const { data, isLoading, error } = useAssets({
    page,
    pageSize: 50,
    type: filter === 'all' ? undefined : filter,
    isArchived: false,
    isTrashed: false,
  });
  const { data: stats } = useAssetStats();

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg px-4 py-3">
          Error loading gallery: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Photos</h1>
          <p className="text-dark-400">
            {stats?.total ?? 0} photos & videos • {formatBytes(stats?.storageUsed ?? 0)} used
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'IMAGE' | 'VIDEO')}
            className="input w-auto"
          >
            <option value="all">All</option>
            <option value="IMAGE">Photos</option>
            <option value="VIDEO">Videos</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-square skeleton rounded-lg"></div>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="w-16 h-16 text-dark-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No photos yet</h3>
          <p className="text-dark-400 mb-4">Upload your first photo to get started</p>
          <a href="/upload" className="btn-primary">
            Upload Photos
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {data?.items.map((asset) => (
              <div
                key={asset.id}
                className="group aspect-square relative overflow-hidden rounded-lg bg-dark-800 cursor-pointer"
              >
                {asset.type === 'VIDEO' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ) : asset.thumbnailPath ? (
                  <img
                    src={`/storage/${asset.thumbnailPath}`}
                    alt={asset.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-dark-500">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p className="text-white text-sm truncate">{asset.fileName}</p>
                  <p className="text-dark-300 text-xs">{formatDate(asset.capturedAt)}</p>
                </div>

                {/* Favorite badge */}
                {asset.isFavorite && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data && data.hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setPage(page + 1)}
                className="btn-secondary"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}