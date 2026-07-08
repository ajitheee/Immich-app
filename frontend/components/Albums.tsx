import React from 'react';
import { Album, ListItem, ViewState } from '../types';
import { 
  Plus, 
  ChevronRight, 
  Video, 
  User, 
  Aperture, 
  UserSquare, 
  RectangleHorizontal, 
  Smartphone, 
  ArrowDownToLine, 
  Copy, 
  EyeOff, 
  Trash2,
  Lock
} from 'lucide-react';

interface AlbumsProps {
  albums: Album[];
  mediaTypes: ListItem[];
  utilities: ListItem[];
  onNavigate: (view: ViewState) => void;
  onSelectAlbum: (id: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Video, User, Aperture, UserSquare, RectangleHorizontal, Smartphone,
  ArrowDownToLine, Copy, EyeOff, Trash2
};

const Albums: React.FC<AlbumsProps> = ({ albums, mediaTypes, utilities, onNavigate, onSelectAlbum }) => {
  
  const handleListClick = (title: string) => {
    switch (title) {
      case 'Hidden': return onNavigate('hidden');
      case 'Recently Deleted': return onNavigate('deleted');
      case 'Imports': return onNavigate('imports');
      default: return onNavigate('generic-media');
    }
  };

  const ListGroup = ({ items, title }: { items: ListItem[], title: string }) => (
    <div className="mb-10">
      <h2 className="text-[22px] font-bold text-black mb-3 px-1">{title}</h2>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        {items.map((item, index) => {
          const IconComponent = iconMap[item.icon];
          const isLast = index === items.length - 1;
          
          return (
            <div 
              key={item.id} 
              onClick={() => handleListClick(item.title)}
              className="flex items-center pl-4 bg-white hover:bg-gray-50 active:bg-gray-200 transition-colors cursor-pointer group"
            >
              {IconComponent && <IconComponent className="text-apple-blue w-6 h-6 mr-4" strokeWidth={1.5} />}
              <div className={`flex-1 flex items-center justify-between py-3 pr-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
                <span className="text-[17px] text-black">{item.title}</span>
                <div className="flex items-center text-gray-400">
                  {item.isLocked ? (
                    <Lock className="w-4 h-4 mr-1" strokeWidth={2} />
                  ) : (
                    <span className="text-[17px] mr-1">{item.count}</span>
                  )}
                  <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-[#F2F2F7] px-4 md:px-8 pt-6 pb-24">
      <div className="flex justify-between items-center mb-6 px-1">
        <h1 className="text-3xl font-bold text-black tracking-tight">Albums</h1>
        <button className="p-1.5 text-apple-blue hover:bg-gray-200/50 rounded-full transition-colors">
          <Plus size={28} strokeWidth={1.5} />
        </button>
      </div>

      {/* My Albums Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3 px-1">
          <h2 className="text-[22px] font-bold text-black">My Albums</h2>
          <button className="text-[17px] text-apple-blue hover:text-blue-700 transition-colors">See All</button>
        </div>
        
        {/* Horizontal scroll container for iOS feel, wrapping to grid on larger screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
          {albums.map((album) => (
            <div 
              key={album.id} 
              className="group cursor-pointer flex flex-col" 
              onClick={() => {
                onSelectAlbum(album.id);
                onNavigate('album-detail');
              }}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-2 shadow-sm group-hover:shadow-md transition-all duration-300 bg-gray-200">
                <img 
                  src={album.coverPhotoUrl} 
                  alt={album.title} 
                  className="w-full h-full object-cover"
                />
                {/* Subtle inner shadow for depth */}
                <div className="absolute inset-0 border border-black/5 rounded-lg pointer-events-none"></div>
              </div>
              <h3 className="text-[15px] font-medium text-black truncate leading-tight">{album.title}</h3>
              <p className="text-[13px] text-gray-500 leading-tight">{album.photoCount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* People & Places Section */}
      <div className="mb-10">
        <h2 className="text-[22px] font-bold text-black mb-3 px-1">People & Places</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="cursor-pointer group" onClick={() => onNavigate('people')}>
            <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-white shadow-sm border border-gray-100 grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5">
               {/* Mocking the people grid */}
               <div className="bg-gray-200 rounded-tl-md overflow-hidden"><img src="https://picsum.photos/id/1011/200/200" className="w-full h-full object-cover" /></div>
               <div className="bg-gray-200 rounded-tr-md overflow-hidden"><img src="https://picsum.photos/id/1012/200/200" className="w-full h-full object-cover" /></div>
               <div className="bg-gray-200 rounded-bl-md overflow-hidden"><img src="https://picsum.photos/id/1025/200/200" className="w-full h-full object-cover" /></div>
               <div className="bg-gray-200 rounded-br-md overflow-hidden"><img src="https://picsum.photos/id/1027/200/200" className="w-full h-full object-cover" /></div>
            </div>
            <h3 className="text-[15px] font-medium text-black leading-tight">People</h3>
            <p className="text-[13px] text-gray-500 leading-tight">14</p>
          </div>
          <div className="cursor-pointer group" onClick={() => onNavigate('places')}>
            <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-white shadow-sm border border-gray-100 relative">
               <img src="https://picsum.photos/id/1015/400/400" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
            <h3 className="text-[15px] font-medium text-black leading-tight">Places</h3>
            <p className="text-[13px] text-gray-500 leading-tight">2,043</p>
          </div>
        </div>
      </div>

      {/* Media Types List */}
      <ListGroup title="Media Types" items={mediaTypes} />

      {/* Utilities List */}
      <ListGroup title="Utilities" items={utilities} />

    </div>
  );
};

export default Albums;
