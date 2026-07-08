export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  date: string;
  location?: string;
  isFavorite: boolean;
  width: number;
  height: number;
}

export interface Album {
  id: string;
  title: string;
  coverPhotoUrl: string;
  photoCount: number;
}

export interface Memory {
  id: string;
  title: string;
  subtitle: string;
  coverPhotoUrl: string;
  dateRange: string;
}

export interface ListItem {
  id: string;
  title: string;
  count: number;
  icon: string;
  isLocked?: boolean;
}

export type ViewState = 
  | 'photos' 
  | 'foryou' 
  | 'albums' 
  | 'search' 
  | 'people' 
  | 'places' 
  | 'favorites' 
  | 'recents' 
  | 'shared' 
  | 'imports' 
  | 'hidden' 
  | 'deleted'
  | 'generic-media'
  | 'album-detail';
