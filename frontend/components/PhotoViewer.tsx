import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Heart, Share, Info, Trash2,
  SlidersHorizontal, Wand2, Crop as CropIcon, 
  Sun, Contrast, Droplet, Thermometer, RotateCcw,
  MoreHorizontal, MapPin, Smartphone, Calendar,
  Copy, CopyPlus, EyeOff
} from 'lucide-react';
import { Photo } from '../types';

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

const ADJUSTMENTS = [
  { id: 'exposure', label: 'Exposure', icon: Sun, min: 50, max: 150, default: 100 },
  { id: 'contrast', label: 'Contrast', icon: Contrast, min: 50, max: 150, default: 100 },
  { id: 'saturation', label: 'Saturation', icon: Droplet, min: 0, max: 200, default: 100 },
  { id: 'warmth', label: 'Warmth', icon: Thermometer, min: -50, max: 50, default: 0 },
];

const FILTERS = [
  { id: 'original', label: 'Original' },
  { id: 'vivid', label: 'Vivid' },
  { id: 'vivid-warm', label: 'Vivid Warm' },
  { id: 'vivid-cool', label: 'Vivid Cool' },
  { id: 'dramatic', label: 'Dramatic' },
  { id: 'mono', label: 'Mono' },
  { id: 'silvertone', label: 'Silvertone' },
  { id: 'noir', label: 'Noir' },
];

const PhotoViewer: React.FC<PhotoViewerProps> = ({ 
  photos, initialIndex, onClose, onToggleFavorite, onDelete 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showUI, setShowUI] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Animation & Gesture states
  const [isClosing, setIsClosing] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const dragAxisRef = useRef<'x' | 'y' | null>(null);
  const lastTapRef = useRef<number>(0);
  const singleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const photo = photos[currentIndex];

  // Clamp index if photos array changes
  useEffect(() => {
    if (currentIndex >= photos.length) {
      setCurrentIndex(Math.max(0, photos.length - 1));
    }
    if (photos.length === 0) {
      triggerClose();
    }
  }, [photos.length, currentIndex]);

  // Reset states when navigating to a new photo
  useEffect(() => {
    setZoomScale(1);
    setPan({x: 0, y: 0});
    setDragX(0);
    setDragY(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setShowUI(true);
  }, [currentIndex]);

  const triggerClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing || showDeleteConfirm || isClosing) return;
      if (e.key === 'Escape') {
        if (showMoreMenu) setShowMoreMenu(false);
        else triggerClose();
      }
      if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) setCurrentIndex(c => c + 1);
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(c => c - 1);
      if (e.key === 'ArrowDown') {
        if (scrollRef.current && scrollRef.current.scrollTop > 0) {
          scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          triggerClose();
        }
      }
      if (e.key === 'ArrowUp') {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos.length, isEditing, showMoreMenu, showDeleteConfirm, isClosing, triggerClose]);

  // Native Touch Event Listener for precise gesture control (Swipe vs Scroll)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (zoomScale > 1 || isEditing) return;
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dragAxisRef.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || zoomScale > 1 || isEditing) return;
      
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;

      if (!dragAxisRef.current) {
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
          dragAxisRef.current = 'x';
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
          dragAxisRef.current = 'y';
        }
      }

      if (dragAxisRef.current === 'x') {
        if (e.cancelable) e.preventDefault(); // Prevent vertical scroll while swiping horizontally
        setDragX(deltaX);
      } else if (dragAxisRef.current === 'y') {
        const scrollTop = scrollRef.current?.scrollTop || 0;
        // Only intercept pull-down if we are at the very top
        if (deltaY > 0 && scrollTop <= 0) {
          if (e.cancelable) e.preventDefault();
          setDragY(deltaY);
        }
      }
    };

    const handleTouchEnd = () => {
      if (dragAxisRef.current === 'x') {
        if (dragX > 100 && currentIndex > 0) setCurrentIndex(c => c - 1);
        else if (dragX < -100 && currentIndex < photos.length - 1) setCurrentIndex(c => c + 1);
      } else if (dragAxisRef.current === 'y') {
        if (dragY > 100) triggerClose();
      }
      
      setDragX(0);
      setDragY(0);
      touchStartRef.current = null;
      dragAxisRef.current = null;
    };

    track.addEventListener('touchstart', handleTouchStart, { passive: false });
    track.addEventListener('touchmove', handleTouchMove, { passive: false });
    track.addEventListener('touchend', handleTouchEnd);
    track.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      track.removeEventListener('touchstart', handleTouchStart);
      track.removeEventListener('touchmove', handleTouchMove);
      track.removeEventListener('touchend', handleTouchEnd);
      track.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [currentIndex, photos.length, zoomScale, isEditing, dragX, dragY, triggerClose]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    if (scrollTop > 50 && showUI) {
      setShowUI(false);
    } else if (scrollTop < 10 && !showUI && zoomScale === 1) {
      setShowUI(true);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing || showDeleteConfirm) return;
    if (Math.abs(dragX) > 5 || Math.abs(dragY) > 5) return; // Was a drag
    
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
      setZoomScale(z => {
        if (z === 1) return 2;
        setPan({x: 0, y: 0});
        return 1;
      });
      setShowUI(false);
    } else {
      // Single tap
      singleTapTimeoutRef.current = setTimeout(() => {
        if (zoomScale === 1) setShowUI(prev => !prev);
      }, 250);
    }
    lastTapRef.current = now;
  };

  // Panning logic for zoomed image (Mouse/Desktop)
  const handlePanMove = (e: React.MouseEvent) => {
    if (zoomScale === 1 || !touchStartRef.current) return;
    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const copyToClipboard = () => {
    if (!photo) return;
    navigator.clipboard.writeText(photo.url).then(() => showToast('Link copied to clipboard!'))
      .catch(() => showToast('Failed to copy link'));
  };

  const handleShare = async () => {
    if (!photo) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'Photo', url: photo.url }); } 
      catch (err) { copyToClipboard(); }
    } else {
      copyToClipboard();
    }
  };

  // Edit State
  const [editTab, setEditTab] = useState<'adjust' | 'filters' | 'crop'>('adjust');
  const [activeAdjust, setActiveAdjust] = useState('exposure');
  const [adjustments, setAdjustments] = useState<Record<string, number>>({
    exposure: 100, contrast: 100, saturation: 100, warmth: 0,
  });
  const [activeFilter, setActiveFilter] = useState('original');
  const [cropRotation, setCropRotation] = useState(0);

  if (!photo) return null;

  const formattedDate = new Date(photo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = new Date(photo.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const getFilterStyle = () => {
    let b = adjustments.exposure;
    let c = adjustments.contrast;
    let s = adjustments.saturation;
    let hr = adjustments.warmth;
    let filterStr = `brightness(${b}%) contrast(${c}%) saturate(${s}%) hue-rotate(${hr}deg)`;

    switch(activeFilter) {
      case 'vivid': filterStr += ' saturate(1.3) contrast(1.1)'; break;
      case 'vivid-warm': filterStr += ' saturate(1.3) contrast(1.1) sepia(0.3)'; break;
      case 'vivid-cool': filterStr += ' saturate(1.3) contrast(1.1) hue-rotate(-15deg)'; break;
      case 'dramatic': filterStr += ' contrast(1.3) brightness(0.9) saturate(0.7)'; break;
      case 'mono': filterStr += ' grayscale(1)'; break;
      case 'silvertone': filterStr += ' grayscale(1) sepia(0.2) contrast(1.2)'; break;
      case 'noir': filterStr += ' grayscale(1) contrast(1.5) brightness(0.8)'; break;
    }
    return filterStr;
  };

  const bgOpacity = isClosing ? 0 : Math.max(0, 1 - Math.max(0, dragY) / 400);
  
  const getCurrentImageStyle = () => {
    let scale = zoomScale;
    let translateX = zoomScale > 1 ? pan.x : 0;
    let translateY = zoomScale > 1 ? pan.y : dragY;

    if (isClosing) {
      scale = 0.8;
    } else if (dragY > 0 && zoomScale === 1) {
      scale = Math.max(0.5, 1 - dragY / 1000);
    }

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${cropRotation}deg)`,
      transition: (dragX !== 0 || dragY !== 0 || touchStartRef.current) ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      filter: getFilterStyle()
    };
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black select-none ${zoomScale > 1 ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}
      ref={scrollRef}
      onScroll={handleScroll}
      style={{ backgroundColor: `rgba(0,0,0,${bgOpacity})` }}
    >
      {/* Top Toolbar (Fixed to viewport) */}
      <div className={`fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-gradient-to-b from-black/60 to-transparent z-40 transition-opacity duration-300 ${showUI && !isEditing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={triggerClose} className="flex items-center text-white/90 hover:text-white transition-colors pointer-events-auto">
          <ChevronLeft size={32} strokeWidth={1.5} />
          <span className="text-[17px] ml-[-4px]">Back</span>
        </button>
        
        <div className="text-center text-white flex flex-col items-center pointer-events-auto">
          <div className="text-[13px] font-semibold tracking-wide">{formattedDate}</div>
          <div className="text-[11px] text-white/70 font-medium">{formattedTime}</div>
        </div>

        <div className="flex items-center space-x-4 relative pointer-events-auto">
          <button onClick={() => setIsEditing(true)} className="text-[17px] text-white font-medium hover:text-gray-300 transition-colors">
            Edit
          </button>
          <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-1 text-white/90 hover:text-white transition-colors">
            <MoreHorizontal size={24} />
          </button>

          {showMoreMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)} />
              <div className="absolute top-12 right-0 w-56 bg-[#2C2C2E]/95 backdrop-blur-xl rounded-xl shadow-2xl z-40 overflow-hidden border border-white/10 py-1">
                <button onClick={() => { copyToClipboard(); setShowMoreMenu(false); }} className="w-full px-4 py-2.5 flex items-center justify-between text-white hover:bg-white/10 transition-colors">
                  <span className="text-[15px]">Copy Photo</span><Copy size={18} />
                </button>
                <div className="h-[1px] bg-white/10 mx-4" />
                <button onClick={() => { showToast('Photo duplicated'); setShowMoreMenu(false); }} className="w-full px-4 py-2.5 flex items-center justify-between text-white hover:bg-white/10 transition-colors">
                  <span className="text-[15px]">Duplicate</span><CopyPlus size={18} />
                </button>
                <div className="h-[1px] bg-white/10 mx-4" />
                <button onClick={() => { showToast('Photo hidden'); setShowMoreMenu(false); }} className="w-full px-4 py-2.5 flex items-center justify-between text-white hover:bg-white/10 transition-colors">
                  <span className="text-[15px]">Hide</span><EyeOff size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Toolbar (Fixed to viewport) */}
      <div className={`fixed bottom-0 left-0 right-0 h-20 flex items-center justify-between px-8 bg-gradient-to-t from-black/80 to-transparent z-40 pb-4 transition-opacity duration-300 ${showUI && !isEditing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={handleShare} className="p-2 text-white/90 hover:text-white transition-colors pointer-events-auto">
          <Share size={24} strokeWidth={1.5} />
        </button>
        <button onClick={() => onToggleFavorite(photo.id)} className="p-2 text-white/90 hover:text-white transition-colors pointer-events-auto">
          <Heart size={24} strokeWidth={1.5} className={photo.isFavorite ? 'fill-white text-white' : ''} />
        </button>
        <button onClick={() => {
          if (scrollRef.current) scrollRef.current.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' });
        }} className="p-2 text-white/90 hover:text-white transition-colors pointer-events-auto">
          <Info size={24} strokeWidth={1.5} />
        </button>
        <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-white/90 hover:text-red-500 transition-colors pointer-events-auto">
          <Trash2 size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* Photo Track (Scrolls naturally) */}
      <div 
        className="relative h-screen w-full flex items-center"
        ref={trackRef}
        onMouseDown={(e) => {
          if (zoomScale > 1) {
            touchStartRef.current = { x: e.clientX, y: e.clientY };
          }
        }}
        onMouseMove={handlePanMove}
        onMouseUp={() => { touchStartRef.current = null; }}
        onMouseLeave={() => { touchStartRef.current = null; }}
      >
        <div 
          className="absolute inset-0 flex items-center"
          style={{
            transform: `translateX(calc(${-currentIndex * 100}vw + ${dragX}px))`,
            transition: dragX !== 0 ? 'none' : 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
          }}
        >
          {photos.map((p, i) => {
            if (Math.abs(i - currentIndex) > 1) return null;
            const isCurrent = i === currentIndex;
            return (
              <div 
                key={p.id}
                className="absolute top-0 h-screen w-screen flex items-center justify-center"
                style={{ left: `${i * 100}vw` }}
                onClick={isCurrent ? handleImageClick : undefined}
              >
                <img 
                  src={p.url} 
                  alt="Viewed" 
                  className="max-w-full max-h-full object-contain shadow-2xl pointer-events-none"
                  style={isCurrent ? getCurrentImageStyle() : { filter: getFilterStyle() }}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Panel (Flows naturally below the photo) */}
      {!isEditing && (
        <div className="relative w-full min-h-[80vh] bg-[#1C1C1E] rounded-t-3xl -mt-12 pt-8 px-6 pb-24 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-2xl mx-auto">
            {/* Drag handle indicator */}
            <div className="w-10 h-1.5 bg-white/30 rounded-full mx-auto mb-8" />
            
            {/* Caption */}
            <div className="bg-white/10 rounded-xl p-3 mb-4">
              <input type="text" placeholder="Add a caption..." className="bg-transparent w-full text-white placeholder-white/50 focus:outline-none text-[15px]" />
            </div>

            {/* Date & Time */}
            <div className="bg-white/10 rounded-xl p-4 mb-4 flex items-center space-x-4">
              <Calendar className="text-white/70" size={24} />
              <div>
                <div className="text-[15px] font-medium">{formattedDate}</div>
                <div className="text-[13px] text-white/60">{formattedTime}</div>
              </div>
            </div>

            {/* Camera Info */}
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-4 mb-3">
                <Smartphone className="text-white/70" size={24} />
                <div>
                  <div className="text-[15px] font-medium">Apple iPhone 14 Pro</div>
                  <div className="text-[13px] text-white/60">Main Camera — 24 mm f/1.5</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[12px] text-white/70 border-t border-white/10 pt-3">
                <div>12 MP</div>
                <div>{photo.width} x {photo.height}</div>
                <div>2.4 MB</div>
                <div>ISO 50</div>
              </div>
            </div>

            {/* Location Map (Beautiful CSS Placeholder) */}
            <div className="bg-white/10 rounded-xl p-4 mb-8">
              <div className="flex items-center space-x-4 mb-3">
                <MapPin className="text-white/70" size={24} />
                <div className="text-[15px] font-medium">{photo.location || 'Unknown Location'}</div>
              </div>
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#2C2C2E] border border-white/5">
                {/* Roads SVG */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-50,50 Q100,60 200,10 T400,80 T600,40" stroke="#A0A0A5" strokeWidth="6" fill="none" />
                  <path d="M50,-50 L80,200 L150,300" stroke="#A0A0A5" strokeWidth="8" fill="none" />
                  <path d="M250,-50 L220,150 L350,300" stroke="#ffffff" strokeWidth="10" fill="none" />
                  <path d="M400,300 L450,100 L600,50" stroke="#A0A0A5" strokeWidth="6" fill="none" />
                </svg>
                {/* Apple Maps Style Pin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Shadow */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-black/50 rounded-[100%] blur-[2px]"></div>
                    {/* Pin Body */}
                    <div className="w-8 h-8 bg-[#FF3B30] rounded-full border-2 border-white shadow-md flex items-center justify-center z-10 relative">
                      <div className="w-2.5 h-2.5 bg-black/20 rounded-full"></div>
                    </div>
                    {/* Pin Point */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#FF3B30]"></div>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 text-[11px] text-white/50 font-semibold tracking-wide bg-black/50 px-2 py-0.5 rounded backdrop-blur-md">Maps</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit View */}
      {isEditing && (
        <>
          <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-black z-50">
            <button onClick={() => setIsEditing(false)} className="text-[17px] text-white hover:text-gray-300 transition-colors">
              Cancel
            </button>
            <button onClick={() => setIsEditing(false)} className="text-[17px] text-[#FFD60A] font-semibold hover:text-yellow-300 transition-colors">
              Done
            </button>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-black z-50 flex flex-col pb-6">
            <div className="h-32 flex flex-col items-center justify-center px-4 w-full">
              {editTab === 'adjust' && (
                <div className="w-full max-w-md flex flex-col items-center">
                  <div className="w-full flex items-center space-x-4 mb-6 px-4">
                    <span className="text-xs text-gray-500 w-8 text-right">{ADJUSTMENTS.find(a => a.id === activeAdjust)!.min}</span>
                    <input 
                      type="range" min={ADJUSTMENTS.find(a => a.id === activeAdjust)!.min} max={ADJUSTMENTS.find(a => a.id === activeAdjust)!.max} 
                      value={adjustments[activeAdjust]} 
                      onChange={(e) => setAdjustments({...adjustments, [activeAdjust]: parseInt(e.target.value)})}
                      className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FFD60A]"
                    />
                    <span className="text-xs text-gray-500 w-8">{ADJUSTMENTS.find(a => a.id === activeAdjust)!.max}</span>
                  </div>
                  <div className="flex space-x-6 overflow-x-auto w-full px-4 pb-2 hide-scrollbar justify-center">
                    {ADJUSTMENTS.map(adj => {
                      const Icon = adj.icon;
                      const isActive = activeAdjust === adj.id;
                      const isModified = adjustments[adj.id] !== adj.default;
                      return (
                        <button key={adj.id} onClick={() => setActiveAdjust(adj.id)} className="flex flex-col items-center space-y-2 min-w-[48px]">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-gray-800' : ''}`}>
                            <Icon size={20} className={isActive || isModified ? 'text-[#FFD60A]' : 'text-white'} strokeWidth={isActive ? 2 : 1.5} />
                          </div>
                          <span className={`text-[10px] ${isActive ? 'text-[#FFD60A]' : 'text-gray-400'}`}>{adj.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {editTab === 'filters' && (
                <div className="flex space-x-4 overflow-x-auto w-full max-w-2xl px-4 hide-scrollbar items-center h-full">
                  {FILTERS.map(filter => (
                    <button key={filter.id} onClick={() => setActiveFilter(filter.id)} className="flex flex-col items-center space-y-2 min-w-[72px]">
                      <div className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${activeFilter === filter.id ? 'border-[#FFD60A]' : 'border-transparent'}`}>
                        <img src={photo.thumbnailUrl} alt={filter.label} className="w-full h-full object-cover" style={{
                          filter: filter.id === 'original' ? 'none' : 
                                  filter.id === 'vivid' ? 'saturate(1.5) contrast(1.1)' :
                                  filter.id === 'mono' ? 'grayscale(1)' :
                                  filter.id === 'noir' ? 'grayscale(1) contrast(1.5)' : 'sepia(0.5)'
                        }} />
                      </div>
                      <span className={`text-[11px] ${activeFilter === filter.id ? 'text-[#FFD60A] font-medium' : 'text-white'}`}>{filter.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {editTab === 'crop' && (
                <div className="w-full max-w-md flex flex-col items-center justify-center h-full space-y-6">
                  <div className="flex items-center space-x-8">
                    <button onClick={() => setCropRotation(r => r - 90)} className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                      <RotateCcw size={20} />
                    </button>
                    <button onClick={() => {
                      setAdjustments({ exposure: 100, contrast: 100, saturation: 100, warmth: 0 });
                      setActiveFilter('original');
                      setCropRotation(0);
                    }} className="px-4 py-2 rounded-full bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors">
                      Reset
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Use rotation to adjust framing</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-16 pt-4 border-t border-gray-800/50">
              <button onClick={() => setEditTab('adjust')} className={`flex flex-col items-center transition-colors ${editTab === 'adjust' ? 'text-white' : 'text-gray-500'}`}>
                <SlidersHorizontal size={22} strokeWidth={editTab === 'adjust' ? 2 : 1.5} />
              </button>
              <button onClick={() => setEditTab('filters')} className={`flex flex-col items-center transition-colors ${editTab === 'filters' ? 'text-white' : 'text-gray-500'}`}>
                <Wand2 size={22} strokeWidth={editTab === 'filters' ? 2 : 1.5} />
              </button>
              <button onClick={() => setEditTab('crop')} className={`flex flex-col items-center transition-colors ${editTab === 'crop' ? 'text-white' : 'text-gray-500'}`}>
                <CropIcon size={22} strokeWidth={editTab === 'crop' ? 2 : 1.5} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Action Sheet */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-8 px-4" 
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="w-full max-w-sm flex flex-col space-y-2 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="bg-[#2C2C2E]/95 backdrop-blur-xl rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 text-center text-[13px] text-white/50 border-b border-white/10">
                This photo will be deleted from iCloud Photos on all your devices.
              </div>
              <button onClick={() => {
                onDelete(photo.id);
                setShowDeleteConfirm(false);
              }} className="w-full py-4 text-red-500 text-[17px] font-normal hover:bg-white/10 transition-colors">
                Delete Photo
              </button>
            </div>
            <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-4 bg-[#2C2C2E] text-white text-[17px] font-semibold rounded-xl hover:bg-white/10 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#2C2C2E]/90 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-[15px] shadow-lg z-50 transition-opacity duration-300">
          {toastMessage}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default PhotoViewer;
