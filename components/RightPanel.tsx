
import React from 'react';
import { EditIcon, DownloadIcon, ImageIcon, TrashIcon } from './Icons';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import type { Mode, ImageFile } from '../types';

interface RightPanelProps {
  isLoading: boolean;
  generatedImage: string | null;
  editCurrentImage: () => void;
  downloadImage: () => void;
  discardImage: () => void;
  sourceImageForComparison: string | null;
  mode: Mode;
  uploadedImage: ImageFile | null;
}

export const RightPanel: React.FC<RightPanelProps> = ({ isLoading, generatedImage, editCurrentImage, downloadImage, discardImage, sourceImageForComparison, mode, uploadedImage }) => {
  const imageToEditPreview = mode === 'edit' && uploadedImage ? uploadedImage.previewUrl : null;

  return (
    <div className="right-panel hidden lg:flex flex-1 bg-zinc-800/50 rounded-2xl items-center justify-center p-6 relative overflow-hidden">
      {isLoading ? (
        <div id="loadingContainer" className="loading-container text-center fade-in">
          <div className="loading-spinner w-16 h-16 border-8 border-zinc-700 border-t-lime-500 rounded-full animate-spin mx-auto"></div>
          <div className="loading-text mt-6 text-xl font-medium text-zinc-300">Gerando sua imagem...</div>
        </div>
      ) : generatedImage ? (
        <div id="imageContainer" className="image-container relative w-full h-full flex items-center justify-center fade-in">
          {sourceImageForComparison ? (
            <BeforeAfterSlider beforeImage={sourceImageForComparison} afterImage={generatedImage} />
          ) : (
            <img id="generatedImage" src={generatedImage} alt="Generated Art" className="generated-image max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/50" />
          )}
          <div className="image-actions absolute top-4 right-4 flex space-x-2">
            <button 
              className="action-btn bg-black/50 text-white p-3 rounded-full hover:bg-red-500/80 transition-all duration-200 backdrop-blur-sm" 
              onClick={discardImage} 
              title="Descartar">
                <TrashIcon className="w-5 h-5" />
            </button>
            <button 
              className="action-btn bg-black/50 text-white p-3 rounded-full hover:bg-lime-500/80 transition-all duration-200 backdrop-blur-sm" 
              onClick={editCurrentImage} 
              title="Editar">
                <EditIcon className="w-5 h-5" />
            </button>
            <button 
              className="action-btn bg-black/50 text-white p-3 rounded-full hover:bg-lime-500/80 transition-all duration-200 backdrop-blur-sm" 
              onClick={downloadImage} 
              title="Download">
                <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : imageToEditPreview ? (
        <div id="imageContainer" className="image-container relative w-full h-full flex items-center justify-center fade-in">
          <img id="editingImage" src={imageToEditPreview} alt="Image for editing" className="generated-image max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/50" />
          <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm">
            Modo de Edição
          </div>
        </div>
      ) : (
        <div id="resultPlaceholder" className="result-placeholder text-center text-zinc-500 fade-in">
          <div className="result-placeholder-icon mx-auto mb-4">
             <ImageIcon className="w-24 h-24 text-zinc-600" />
          </div>
          <div className="text-xl">Sua obra de arte aparecerá aqui</div>
        </div>
      )}
    </div>
  );
};
