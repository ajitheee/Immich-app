'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Album {
  id: string;
  name: string;
  description: string | null;
  coverAssetId: string | null;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  assets?: any[];
}

export default function AlbumsPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  const { data: albums, isLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const response = await api.get<{ items: Album[] }>('/albums');
      return response.data.items;
    },
  });

  const createAlbumMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/albums', { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      setShowCreateModal(false);
      setNewAlbumName('');
    },
  });

  const handleCreateAlbum = () => {
    if (newAlbumName.trim()) {
      createAlbumMutation.mutate(newAlbumName.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Albums</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          Create Album
        </button>
      </div>

      {albums?.length === 0 ? (
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
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No albums yet</h3>
          <p className="text-dark-400 mb-4">Create your first album to organize your photos</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            Create Album
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {albums?.map((album) => (
            <div
              key={album.id}
              className="group cursor-pointer"
            >
              <div className="aspect-square bg-dark-800 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                {album.coverAssetId ? (
                  <div className="w-full h-full bg-dark-700" />
                ) : (
                  <svg
                    className="w-12 h-12 text-dark-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                )}
              </div>
              <h3 className="text-white font-medium truncate">{album.name}</h3>
              <p className="text-dark-400 text-sm">
                {album.assets?.length ?? 0} items
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Create Album</h2>
            <input
              type="text"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              className="input mb-4"
              placeholder="Album name"
              autoFocus
            />
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlbum}
                disabled={!newAlbumName.trim() || createAlbumMutation.isPending}
                className="btn-primary flex-1"
              >
                {createAlbumMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}