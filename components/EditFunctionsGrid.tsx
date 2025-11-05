
import React from 'react';
import type { EditFunction } from '../types';
import { AddRemoveIcon, RetouchIcon, StyleIcon } from './Icons';

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

interface EditFunctionsGridProps {
  activeFunction: EditFunction;
  onSelect: (func: EditFunction) => void;
}

export const EditFunctionsGrid: React.FC<EditFunctionsGridProps> = ({ activeFunction, onSelect }) => (
  <div id="editFunctions" className="functions-section">
    <div className="functions-grid grid grid-cols-3 gap-3">
      <FunctionCard
        icon={<AddRemoveIcon />}
        name="Adicionar"
        isActive={activeFunction === 'add-remove'}
        onClick={() => onSelect('add-remove')}
      />
      <FunctionCard
        icon={<RetouchIcon />}
        name="Retoque"
        isActive={activeFunction === 'retouch'}
        onClick={() => onSelect('retouch')}
      />
      <FunctionCard
        icon={<StyleIcon />}
        name="Estilo"
        isActive={activeFunction === 'style'}
        onClick={() => onSelect('style')}
      />
    </div>
  </div>
);
