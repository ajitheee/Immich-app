import React from 'react';
import { Memory } from '../types';
import { Play } from 'lucide-react';

interface ForYouProps {
  memories: Memory[];
}

const ForYou: React.FC<ForYouProps> = ({ memories }) => {
  return (
    <div className="h-full overflow-y-auto bg-white p-8 pb-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">For You</h1>
      
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Memories</h2>
          <button className="text-apple-blue text-sm hover:underline">See All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <div 
              key={memory.id} 
              className="relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
            >
              <img 
                src={memory.coverPhotoUrl} 
                alt={memory.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                <div className="text-sm font-medium text-white/80 mb-1 uppercase tracking-wider">{memory.dateRange}</div>
                <h3 className="text-2xl font-bold mb-1">{memory.title}</h3>
                <p className="text-white/90">{memory.subtitle}</p>
              </div>

              <div className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={20} className="text-white ml-1" fill="currentColor" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Photos</h2>
        <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-500">
          More curated content would appear here.
        </div>
      </div>
    </div>
  );
};

export default ForYou;
