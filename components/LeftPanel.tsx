
import React from 'react';
import type { Mode, CreateFunction, EditFunction, ImageFile } from '../types';
import type { AspectRatio } from '../services/geminiService';
import { CreateFunctionsGrid } from './CreateFunctionsGrid';
import { EditFunctionsGrid } from './EditFunctionsGrid';
import { UploadArea } from './UploadArea';

interface AspectRatioSelectorProps {
    currentRatio: AspectRatio;
    onSelect: (ratio: AspectRatio) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ currentRatio, onSelect }) => {
    const ratios: { value: AspectRatio; label: string }[] = [
        { value: '1:1', label: '1:1' },
        { value: '3:4', label: '3:4' },
        { value: '9:16', label: '9:16' },
        { value: '16:9', label: '16:9' },
    ];

    return (
        <div className="pt-4 fade-in">
             <div className="section-title text-sm font-medium text-zinc-300 mb-2">Proporção</div>
             <div className="grid grid-cols-4 gap-2">
                {ratios.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => onSelect(value)}
                        className={`aspect-ratio-btn text-sm font-semibold py-2 rounded-md transition-colors duration-200 border-2 ${
                            currentRatio === value
                                ? 'bg-lime-500/20 border-lime-500 text-lime-300'
                                : 'bg-zinc-700/50 border-transparent hover:border-lime-500/50'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};


interface LeftPanelProps {
  prompt: string;
  setPrompt: (value: string) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  createFunction: CreateFunction;
  setCreateFunction: (func: CreateFunction) => void;
  editFunction: EditFunction;
  setEditFunction: (func: EditFunction) => void;
  uploadedImage: ImageFile | null;
  handleImageUpload: (input: HTMLInputElement, setter: React.Dispatch<React.SetStateAction<ImageFile | null>>) => void;
  setUploadedImage: React.Dispatch<React.SetStateAction<ImageFile | null>>;
  generateImage: () => void;
  isLoading: boolean;
  uploadedImage1: ImageFile | null;
  setUploadedImage1: React.Dispatch<React.SetStateAction<ImageFile | null>>;
  uploadedImage2: ImageFile | null;
  setUploadedImage2: React.Dispatch<React.SetStateAction<ImageFile | null>>;
  thumbnailRefImage: ImageFile | null;
  setThumbnailRefImage: React.Dispatch<React.SetStateAction<ImageFile | null>>;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  adRefImage1: ImageFile | null;
  setAdRefImage1: React.Dispatch<React.SetStateAction<ImageFile | null>>;
  adRefImage2: ImageFile | null;
  setAdRefImage2: React.Dispatch<React.SetStateAction<ImageFile | null>>;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  prompt,
  setPrompt,
  mode,
  setMode,
  createFunction,
  setCreateFunction,
  editFunction,
  setEditFunction,
  uploadedImage,
  handleImageUpload,
  setUploadedImage,
  generateImage,
  isLoading,
  uploadedImage1,
  setUploadedImage1,
  uploadedImage2,
  setUploadedImage2,
  thumbnailRefImage,
  setThumbnailRefImage,
  aspectRatio,
  setAspectRatio,
  adRefImage1,
  setAdRefImage1,
  adRefImage2,
  setAdRefImage2,
}) => {
  const isComposeMode = mode === 'create' && createFunction === 'compose';
  const isAdMode = mode === 'create' && createFunction === 'ad';

  const promptLabel = isComposeMode ? "Instrução de mesclagem:" : "Qual a sua ideia:";
  
  let promptPlaceholder = "Ex: Um mestre da IA demitindo 30 empregados...";
  if (isComposeMode) {
    promptPlaceholder = "Ex: Use o estilo da segunda na primeira...";
  } else if (isAdMode) {
    promptPlaceholder = "Descreva o assunto principal do anúncio...";
  }

  return (
    <div className="left-panel w-full lg:w-[380px] lg:max-w-sm flex-shrink-0 bg-zinc-800/50 rounded-2xl p-6 flex flex-col space-y-6 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <header>
        <h1 className="panel-title text-2xl font-bold text-lime-400">Mestres AI Studio</h1>
        <p className="panel-subtitle text-zinc-400">Gerador profissional de imagens</p>
      </header>

      <div className="prompt-section">
        <div className="section-title text-sm font-medium text-zinc-300 mb-2">{promptLabel}</div>
        <textarea
          id="prompt"
          className="prompt-input w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-200 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition duration-200 h-24 resize-none"
          placeholder={promptPlaceholder}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div className="mode-toggle grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-lg">
        <button
          className={`mode-btn uppercase font-semibold py-2 rounded-md transition-colors duration-200 ${mode === 'create' ? 'bg-lime-500 text-zinc-900' : 'hover:bg-zinc-700/50'}`}
          data-mode="create"
          onClick={() => setMode('create')}
        >
          CRIAR
        </button>
        <button
          className={`mode-btn uppercase font-semibold py-2 rounded-md transition-colors duration-200 ${mode === 'edit' ? 'bg-lime-500 text-zinc-900' : 'hover:bg-zinc-700/50'}`}
          data-mode="edit"
          onClick={() => setMode('edit')}
        >
          EDITAR
        </button>
      </div>
      
      <div className="dynamic-content">
        {mode === 'create' ? (
          <>
            <CreateFunctionsGrid activeFunction={createFunction} onSelect={setCreateFunction} />
            
            {createFunction !== 'compose' && (
                <AspectRatioSelector currentRatio={aspectRatio} onSelect={setAspectRatio} />
            )}
            
            {createFunction === 'ad' && (
              <div className="mt-4 space-y-3 fade-in">
                <UploadArea
                  id="adRefUpload1"
                  imagePreview={adRefImage1?.previewUrl || null}
                  onImageUpload={(input) => handleImageUpload(input, setAdRefImage1)}
                  text="Referência 1 (Opcional)"
                />
                <UploadArea
                  id="adRefUpload2"
                  imagePreview={adRefImage2?.previewUrl || null}
                  onImageUpload={(input) => handleImageUpload(input, setAdRefImage2)}
                  text="Referência 2 (Opcional)"
                />
              </div>
            )}

            {createFunction === 'thumbnail' && (
              <div className="mt-4 fade-in">
                <UploadArea
                  id="thumbnailRefUpload"
                  imagePreview={thumbnailRefImage?.previewUrl || null}
                  onImageUpload={(input) => handleImageUpload(input, setThumbnailRefImage)}
                  text="Imagem de Referência (Opcional)"
                />
              </div>
            )}
            {isComposeMode && (
              <div className="mt-4 space-y-3 fade-in">
                 <UploadArea
                  id="imageUpload1"
                  imagePreview={uploadedImage1?.previewUrl || null}
                  onImageUpload={(input) => handleImageUpload(input, setUploadedImage1)}
                  text="Primeira Imagem"
                  subtext="Clique para selecionar"
                  isDual={true}
                />
                <UploadArea
                  id="imageUpload2"
                  imagePreview={uploadedImage2?.previewUrl || null}
                  onImageUpload={(input) => handleImageUpload(input, setUploadedImage2)}
                  text="Segunda Imagem"
                  subtext="Clique para selecionar"
                  isDual={true}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <EditFunctionsGrid activeFunction={editFunction} onSelect={setEditFunction} />
            <div className="mt-4">
              <UploadArea
                id="imageUpload"
                imagePreview={uploadedImage?.previewUrl || null}
                onImageUpload={(input) => handleImageUpload(input, setUploadedImage)}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-auto pt-6">
        <button
          id="generateBtn"
          className="generate-btn w-full bg-lime-500 text-zinc-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-lime-400 transition-all duration-200 disabled:bg-zinc-600 disabled:cursor-not-allowed"
          onClick={generateImage}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner w-6 h-6 border-4 border-zinc-800 border-t-zinc-200 rounded-full animate-spin"></div>
          ) : (
            <span className="btn-text">Gerar Imagem</span>
          )}
        </button>
      </div>
    </div>
  );
};
