
import React from 'react';
import { EditIcon, DownloadIcon, NewImageIcon, ImageIcon, TrashIcon } from './Icons';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface MobileModalProps {
  isLoading: boolean;
  generatedImage: string | null;
  editFromModal: () => void;
  downloadFromModal: () => void;
  newImageFromModal: () => void;
  discardFromModal: () => void;
  sourceImageForComparison: string | null;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isLoading,
  generatedImage,
  editFromModal,
  downloadFromModal,
  newImageFromModal,
  discardFromModal,
  sourceImageForComparison,
}) => {
  return (
    <div id="mobileModal" className="mobile-modal lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col p-4 z-50 fade-in">
      <div className="modal-content flex-1 flex items-center justify-center overflow-hidden">
        {isLoading && (
          <div className="text-center">
            <div className="loading-spinner w-12 h-12 border-4 border-zinc-600 border-t-lime-400 rounded-full animate-spin mx-auto"></div>
            <div className="mt-4 text-zinc-300">Gerando sua imagem...</div>
          </div>
        )}
        {!isLoading && !generatedImage && (
           <div className="text-center text-zinc-600">
             <ImageIcon className="w-20 h-20 mx-auto" />
             <p className="mt-2">Algo deu errado.</p>
           </div>
        )}
        {!isLoading && generatedImage && (
          sourceImageForComparison ? (
            <BeforeAfterSlider beforeImage={sourceImageForComparison} afterImage={generatedImage} />
          ) : (
            <img id="modalImage" src={generatedImage} alt="Generated Art" className="modal-image max-w-full max-h-full object-contain rounded-lg" />
          )
        )}
      </div>
      <div className="modal-actions flex-shrink-0 grid grid-cols-4 gap-3 pt-4">
        <button className="modal-btn discard bg-zinc-700/80 p-3 rounded-lg flex flex-col items-center" onClick={discardFromModal} disabled={!generatedImage}>
            <TrashIcon className="w-6 h-6 mb-1"/>
            <span className="text-xs font-semibold">Descartar</span>
        </button>
        <button className="modal-btn edit bg-zinc-700/80 p-3 rounded-lg flex flex-col items-center" onClick={editFromModal} disabled={!generatedImage}>
            <EditIcon className="w-6 h-6 mb-1"/>
            <span className="text-xs font-semibold">Editar</span>
        </button>
        <button className="modal-btn download bg-zinc-700/80 p-3 rounded-lg flex flex-col items-center" onClick={downloadFromModal} disabled={!generatedImage}>
            <DownloadIcon className="w-6 h-6 mb-1"/>
            <span className="text-xs font-semibold">Salvar</span>
        </button>
        <button className="modal-btn new bg-lime-500/80 p-3 rounded-lg flex flex-col items-center text-zinc-900" onClick={newImageFromModal}>
            <NewImageIcon className="w-6 h-6 mb-1"/>
            <span className="text-xs font-semibold">Nova Imagem</span>
        </button>
      </div>
    </div>
  );
};
