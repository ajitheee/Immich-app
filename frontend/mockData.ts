import { Photo, Album, Memory, ListItem } from './types';

const LOCATIONS = ['San Francisco', 'New York', 'London', 'Paris', 'Tokyo', 'Yosemite', 'Maui', 'Rome'];

// Generate a random date within the last 2 years
const getRandomDate = () => {
  const start = new Date(2022, 0, 1).getTime();
  const end = new Date().getTime();
  return new Date(start + Math.random() * (end - start)).toISOString();
};

export const generateMockPhotos = (count: number): Photo[] => {
  return Array.from({ length: count }).map((_, i) => {
    // Use specific picsum IDs to avoid random changes on re-render and ensure variety
    const imageId = (i * 13) % 1000 + 10; 
    const isLandscape = Math.random() > 0.4;
    const width = isLandscape ? 800 : 600;
    const height = isLandscape ? 600 : 800;

    return {
      id: `photo-${i}`,
      url: `https://picsum.photos/id/${imageId}/${width}/${height}`,
      thumbnailUrl: `https://picsum.photos/id/${imageId}/400/400`, // Square thumbnails for grid
      date: getRandomDate(),
      location: Math.random() > 0.3 ? LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)] : undefined,
      isFavorite: Math.random() > 0.8,
      width,
      height
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first
};

export const MOCK_PHOTOS = generateMockPhotos(150);

export const MOCK_ALBUMS: Album[] = [
  { id: 'a1', title: 'Favorites', coverPhotoUrl: MOCK_PHOTOS.find(p => p.isFavorite)?.thumbnailUrl || MOCK_PHOTOS[0].thumbnailUrl, photoCount: MOCK_PHOTOS.filter(p => p.isFavorite).length },
  { id: 'a2', title: 'Recents', coverPhotoUrl: MOCK_PHOTOS[0].thumbnailUrl, photoCount: MOCK_PHOTOS.length },
  { id: 'a3', title: 'Vacation 2023', coverPhotoUrl: MOCK_PHOTOS[15].thumbnailUrl, photoCount: 42 },
  { id: 'a4', title: 'Family', coverPhotoUrl: MOCK_PHOTOS[30].thumbnailUrl, photoCount: 18 },
  { id: 'a5', title: 'Pets', coverPhotoUrl: MOCK_PHOTOS[45].thumbnailUrl, photoCount: 7 },
  { id: 'a6', title: 'Landscapes', coverPhotoUrl: MOCK_PHOTOS[60].thumbnailUrl, photoCount: 24 },
  { id: 'a7', title: 'Food', coverPhotoUrl: MOCK_PHOTOS[75].thumbnailUrl, photoCount: 12 },
  { id: 'a8', title: 'Architecture', coverPhotoUrl: MOCK_PHOTOS[90].thumbnailUrl, photoCount: 31 },
];

export const MOCK_MEMORIES: Memory[] = [
  { id: 'm1', title: 'Together', subtitle: 'Over the years', coverPhotoUrl: MOCK_PHOTOS[5].url, dateRange: '2020 - 2023' },
  { id: 'm2', title: 'A Day in Paris', subtitle: 'July 14, 2022', coverPhotoUrl: MOCK_PHOTOS[22].url, dateRange: 'July 2022' },
  { id: 'm3', title: 'Winter Escapes', subtitle: 'Snowy adventures', coverPhotoUrl: MOCK_PHOTOS[44].url, dateRange: 'Jan 2023' },
  { id: 'm4', title: 'Furry Friends', subtitle: 'Best moments', coverPhotoUrl: MOCK_PHOTOS[66].url, dateRange: 'Recent' },
];

export const MOCK_MEDIA_TYPES: ListItem[] = [
  { id: 'mt1', title: 'Videos', count: 142, icon: 'Video' },
  { id: 'mt2', title: 'Selfies', count: 56, icon: 'User' },
  { id: 'mt3', title: 'Live Photos', count: 89, icon: 'Aperture' },
  { id: 'mt4', title: 'Portrait', count: 34, icon: 'UserSquare' },
  { id: 'mt5', title: 'Panoramas', count: 12, icon: 'RectangleHorizontal' },
  { id: 'mt6', title: 'Screenshots', count: 432, icon: 'Smartphone' },
];

export const MOCK_UTILITIES: ListItem[] = [
  { id: 'u1', title: 'Imports', count: 24, icon: 'ArrowDownToLine' },
  { id: 'u2', title: 'Duplicates', count: 3, icon: 'Copy' },
  { id: 'u3', title: 'Hidden', count: 0, icon: 'EyeOff', isLocked: true },
  { id: 'u4', title: 'Recently Deleted', count: 12, icon: 'Trash2', isLocked: true },
];
