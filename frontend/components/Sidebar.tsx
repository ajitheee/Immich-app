import React from 'react';
import { 
  Image as ImageIcon, 
  Users, 
  Map, 
  Clock, 
  Heart, 
  Search, 
  LayoutGrid, 
  Sparkles, 
  FolderHeart,
  ArrowDownToLine,
  EyeOff,
  Trash2,
  MonitorPlay
} from 'lucide-react';
import { ViewState } from '../types';
import { MOCK_ALBUMS } from '../mockData';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onSelectAlbum: (id: string) => void;
  activeAlbumId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onSelectAlbum, activeAlbumId }) => {
  const NavItem = ({ icon: Icon, label, view, active }: { icon: any, label: string, view: ViewState, active?: boolean }) => (
    <button
      onClick={() => {
        onViewChange(view);
        if (view !== 'album-detail') onSelectAlbum(''); // Clear album selection if navigating away
      }}
      className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-[14px] transition-colors ${
        (active || currentView === view) && currentView !== 'album-detail'
          ? 'bg-gray-200/80 text-black font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} className={(active || currentView === view) && currentView !== 'album-detail' ? 'text-apple-blue' : 'text-apple-blue'} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-3 mt-6 mb-1">
      <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
    </div>
  );

  return (
    <div className="w-64 h-full bg-[#F5F5F7] border-r border-gray-200 flex flex-col overflow-y-auto pt-4 pb-8 select-none">
      <div className="px-3 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1.5 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-200/60 border border-transparent rounded-md pl-8 pr-3 py-1 text-[13px] focus:outline-none focus:bg-white focus:border-apple-blue/50 focus:ring-1 focus:ring-apple-blue/50 placeholder-gray-500 transition-all"
            onClick={() => onViewChange('search')}
          />
        </div>
      </div>

      <SectionHeader title="Library" />
      <div className="px-2 space-y-0.5">
        <NavItem icon={ImageIcon} label="Photos" view="photos" />
        <NavItem icon={Sparkles} label="Memories" view="foryou" />
        <NavItem icon={Users} label="People" view="people" />
        <NavItem icon={Map} label="Places" view="places" />
      </div>

      <SectionHeader title="Albums" />
      <div className="px-2 space-y-0.5">
        <NavItem icon={LayoutGrid} label="All Photos" view="albums" />
        <NavItem icon={Clock} label="Recents" view="recents" />
        <NavItem icon={Heart} label="Favorites" view="favorites" />
      </div>

      <SectionHeader title="Shared" />
      <div className="px-2 space-y-0.5">
        <NavItem icon={MonitorPlay} label="Shared Albums" view="shared" />
      </div>

      <SectionHeader title="Utilities" />
      <div className="px-2 space-y-0.5">
        <NavItem icon={ArrowDownToLine} label="Imports" view="imports" />
        <NavItem icon={EyeOff} label="Hidden" view="hidden" />
        <NavItem icon={Trash2} label="Recently Deleted" view="deleted" />
      </div>

      <SectionHeader title="My Albums" />
      <div className="px-2 space-y-0.5">
        {MOCK_ALBUMS.map(album => (
          <button
            key={album.id}
            onClick={() => { 
              onSelectAlbum(album.id);
              onViewChange('album-detail'); 
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-[14px] transition-colors ${
              currentView === 'album-detail' && activeAlbumId === album.id
                ? 'bg-gray-200/80 text-black font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FolderHeart size={16} className="text-apple-blue flex-shrink-0" strokeWidth={2} />
            <span className="truncate">{album.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
