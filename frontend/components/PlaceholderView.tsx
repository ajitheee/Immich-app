import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isLocked?: boolean;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, description, icon: Icon, isLocked }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white text-center px-6">
      <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <Icon size={48} className="text-gray-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md">{description}</p>
      
      {isLocked && (
        <button className="mt-8 px-6 py-2 bg-apple-blue text-white rounded-full font-medium hover:bg-blue-600 transition-colors">
          Unlock with Face ID
        </button>
      )}
    </div>
  );
};

export default PlaceholderView;
