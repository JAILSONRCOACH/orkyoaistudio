
import React from 'react';
import { UploadIcon } from './Icons';

interface UploadAreaProps {
  id: string;
  imagePreview: string | null;
  onImageUpload: (input: HTMLInputElement) => void;
  text?: string;
  subtext?: string;
  isDual?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ 
  id, 
  imagePreview, 
  onImageUpload, 
  text = "Clique ou arraste uma imagem",
  subtext = "PNG, JPG, WebP (máx. 10MB)",
  isDual = false
}) => {
  const handleAreaClick = () => {
    document.getElementById(id)?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-lime-500');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-lime-500');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-lime-500');
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
      input.files = e.dataTransfer.files;
      onImageUpload(input);
    }
  };

  return (
    <div 
      className={`upload-area relative bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-center p-4 cursor-pointer hover:border-lime-600 transition-all duration-200 ${isDual ? 'h-40' : 'h-32'}`}
      onClick={handleAreaClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id={id}
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => onImageUpload(e.target)}
        className="hidden"
      />
      {imagePreview ? (
        <img id={`${id}-preview`} src={imagePreview} alt="Preview" className="image-preview absolute inset-0 w-full h-full object-cover rounded-lg" />
      ) : (
        <div className="flex flex-col items-center text-zinc-500">
          <UploadIcon className="w-8 h-8 mb-2" />
          <span className="font-semibold text-zinc-400">{text}</span>
          <span className="upload-text text-xs">{subtext}</span>
        </div>
      )}
    </div>
  );
};
