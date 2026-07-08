import React, { useMemo, useState } from 'react';
import { Photo } from '../types';

interface GalleryProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  title?: string;
}

type GroupedPhotos = {
  [key: string]: Photo[];
};

type ViewMode = 'years' | 'months' | 'days' | 'all';

const Gallery: React.FC<GalleryProps> = ({ photos, onPhotoClick, title = 'Library' }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('days');

  // Group photos based on the selected view mode
  const groupedPhotos = useMemo(() => {
    if (viewMode === 'all') return { 'All Photos': photos };

    const groups: GroupedPhotos = {};
    photos.forEach(photo => {
      const date = new Date(photo.date);
      let key = '';
      
      if (viewMode === 'years') {
        key = date.getFullYear().toString();
      } else if (viewMode === 'months') {
        key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } else if (viewMode === 'days') {
        key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(photo);
    });
    return groups;
  }, [photos, viewMode]);

  // Adjust grid density based on view mode
  const gridColsClass = {
    years: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4',
    months: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2',
    days: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1',
    all: 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-0.5'
  }[viewMode];

  if (photos.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Photos</h2>
        <p className="text-gray-500">Photos you add will appear here.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white flex flex-col relative">
      {/* Sticky Header / Toolbar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        
        {/* View Mode Controls */}
        <div className="flex bg-gray-200/80 rounded-lg p-1 backdrop-blur-sm">
          {(['days', 'months', 'years', 'all'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-[13px] font-medium rounded-md transition-all duration-200 ${
                viewMode === mode 
                  ? 'bg-white shadow-sm text-black' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {mode === 'all' ? 'All Photos' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 pb-24 flex-1">
        {viewMode === 'all' ? (
          /* All Photos View - Flat Grid, No Headers */
          <div className={`grid ${gridColsClass}`}>
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="relative aspect-square cursor-pointer group overflow-hidden bg-gray-100"
                onClick={() => onPhotoClick(photo)}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
            ))}
          </div>
        ) : (
          /* Grouped Views (Years, Months, Days) */
          Object.entries(groupedPhotos).map(([groupKey, groupPhotos]) => (
            <div key={groupKey} className="mb-8">
              {/* Sticky Group Header */}
              <h2 className="text-lg font-bold text-gray-900 mb-3 px-1 sticky top-[52px] bg-white/95 backdrop-blur-md py-2 z-20">
                {groupKey}
              </h2>
              <div className={`grid ${gridColsClass}`}>
                {groupPhotos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className={`relative aspect-square cursor-pointer group overflow-hidden bg-gray-100 ${viewMode !== 'days' ? 'rounded-md' : ''}`}
                    onClick={() => onPhotoClick(photo)}
                  >
                    <img
                      src={photo.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Gallery;
