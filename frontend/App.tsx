import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import PhotoViewer from './components/PhotoViewer';
import ForYou from './components/ForYou';
import Albums from './components/Albums';
import PlaceholderView from './components/PlaceholderView';
import { MOCK_PHOTOS, MOCK_ALBUMS, MOCK_MEMORIES, MOCK_MEDIA_TYPES, MOCK_UTILITIES } from './mockData';
import { Photo, ViewState } from './types';
import { Users, Map, EyeOff, Trash2, ArrowDownToLine, MonitorPlay, Search, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('albums');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  
  // Lift photos state to App level to allow modifications (favorite, delete)
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);

  const handlePhotoClick = useCallback((photo: Photo) => {
    const index = photos.findIndex(p => p.id === photo.id);
    if (index !== -1) {
      setSelectedPhotoIndex(index);
    }
  }, [photos]);

  const closeViewer = useCallback(() => {
    setSelectedPhotoIndex(null);
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setPhotos(prevPhotos => 
      prevPhotos.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
    );
  }, []);

  const handleDeletePhoto = useCallback((id: string) => {
    setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== id));
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'photos':
        return <Gallery photos={photos} onPhotoClick={handlePhotoClick} title="Library" />;
      case 'recents':
        return <Gallery photos={photos} onPhotoClick={handlePhotoClick} title="Recents" />;
      case 'favorites':
        return <Gallery photos={photos.filter(p => p.isFavorite)} onPhotoClick={handlePhotoClick} title="Favorites" />;
      case 'foryou':
        return <ForYou memories={MOCK_MEMORIES} />;
      case 'albums':
        return (
          <Albums 
            albums={MOCK_ALBUMS} 
            mediaTypes={MOCK_MEDIA_TYPES} 
            utilities={MOCK_UTILITIES} 
            onNavigate={setCurrentView} 
            onSelectAlbum={setSelectedAlbumId}
          />
        );
      case 'album-detail': {
        const albumIndex = MOCK_ALBUMS.findIndex(a => a.id === selectedAlbumId);
        const album = MOCK_ALBUMS[albumIndex];
        let albumPhotos: Photo[] = [];

        if (album?.title === 'Favorites') {
          albumPhotos = photos.filter(p => p.isFavorite);
        } else if (album?.title === 'Recents') {
          albumPhotos = photos;
        } else if (album) {
          // Create a unique but consistent subset of photos for other albums based on their index
          const startIndex = (albumIndex * 17) % photos.length;
          // Double the array to easily wrap around if the slice exceeds the length
          const doubledPhotos = [...photos, ...photos];
          albumPhotos = doubledPhotos.slice(startIndex, startIndex + album.photoCount);
        }

        return <Gallery photos={albumPhotos} onPhotoClick={handlePhotoClick} title={album?.title || 'Album'} />;
      }
      
      // Placeholders for specific views
      case 'people':
        return <PlaceholderView title="People" description="People identified in your photos will appear here." icon={Users} />;
      case 'places':
        return <PlaceholderView title="Places" description="Photos with location data will be plotted on a map here." icon={Map} />;
      case 'shared':
        return <PlaceholderView title="Shared Albums" description="Albums you share with others will appear here." icon={MonitorPlay} />;
      case 'imports':
        return <PlaceholderView title="Imports" description="Recently imported photos will appear here." icon={ArrowDownToLine} />;
      case 'hidden':
        return <PlaceholderView title="Hidden" description="These photos are hidden from your library." icon={EyeOff} isLocked={true} />;
      case 'deleted':
        return <PlaceholderView title="Recently Deleted" description="Photos and videos show the days remaining before deletion." icon={Trash2} isLocked={true} />;
      case 'generic-media':
        return <PlaceholderView title="Media Type" description="Filtered media will appear here." icon={ImageIcon} />;
      case 'search':
        return <PlaceholderView title="Search" description="Search by people, places, or categories." icon={Search} />;
      
      default:
        return <Gallery photos={photos} onPhotoClick={handlePhotoClick} title="Library" />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
      {/* Sidebar - hidden on very small screens */}
      <div className="hidden md:block h-full flex-shrink-0">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onSelectAlbum={setSelectedAlbumId}
          activeAlbumId={selectedAlbumId}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full relative">
        {renderContent()}
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhotoIndex !== null && photos.length > 0 && (
        <PhotoViewer
          photos={photos}
          initialIndex={selectedPhotoIndex}
          onClose={closeViewer}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDeletePhoto}
        />
      )}
    </div>
  );
};

export default App;
