
import React from 'react';
import type { CreateFunction } from '../types';
import { PromptIcon, StickerIcon, TextIcon, ComicIcon, ThumbnailIcon, ComposeIcon, AdIcon, HQIcon } from './Icons';

interface FunctionCardProps {
  icon: React.ReactNode;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const FunctionCard: React.FC<FunctionCardProps> = ({ icon, name, isActive, onClick }) => (
  <button
    className={`function-card flex flex-col items-center justify-center text-center p-3 rounded-lg border-2 transition-all duration-200 ${
      isActive ? 'bg-lime-500/20 border-lime-500 text-lime-300' : 'bg-zinc-700/50 border-transparent hover:border-lime-500/50'
    }`}
    onClick={onClick}
  >
    <div className="icon flex items-center justify-center mb-1.5 opacity-90 w-6 h-6">
      {icon}
    </div>
    <div className="name text-xs font-semibold">{name}</div>
  </button>
);

interface CreateFunctionsGridProps {
  activeFunction: CreateFunction;
  onSelect: (func: CreateFunction) => void;
}

export const CreateFunctionsGrid: React.FC<CreateFunctionsGridProps> = ({ activeFunction, onSelect }) => (
  <div id="createFunctions" className="functions-section">
    <div className="functions-grid grid grid-cols-4 gap-2">
      <FunctionCard
        icon={<PromptIcon />}
        name="Prompt"
        isActive={activeFunction === 'free'}
        onClick={() => onSelect('free')}
      />
      <FunctionCard
        icon={<StickerIcon />}
        name="Figura"
        isActive={activeFunction === 'sticker'}
        onClick={() => onSelect('sticker')}
      />
      <FunctionCard
        icon={<TextIcon />}
        name="Logo"
        isActive={activeFunction === 'text'}
        onClick={() => onSelect('text')}
      />
      <FunctionCard
        icon={<ComicIcon />}
        name="Desenho"
        isActive={activeFunction === 'comic'}
        onClick={() => onSelect('comic')}
      />
      <FunctionCard
        icon={<ThumbnailIcon />}
        name="Thumbnail"
        isActive={activeFunction === 'thumbnail'}
        onClick={() => onSelect('thumbnail')}
      />
       <FunctionCard
        icon={<ComposeIcon />}
        name="Mesclar"
        isActive={activeFunction === 'compose'}
        onClick={() => onSelect('compose')}
      />
      <FunctionCard
        icon={<AdIcon />}
        name="Publicidade"
        isActive={activeFunction === 'ad'}
        onClick={() => onSelect('ad')}
      />
      <FunctionCard
        icon={<HQIcon />}
        name="HQ"
        isActive={activeFunction === 'hq'}
        onClick={() => onSelect('hq')}
      />
    </div>
  </div>
);
