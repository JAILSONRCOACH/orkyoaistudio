
export type Mode = 'create' | 'edit';
export type CreateFunction = 'free' | 'sticker' | 'text' | 'comic' | 'thumbnail' | 'compose' | 'ad' | 'hq';
export type EditFunction = 'add-remove' | 'retouch' | 'style';

export interface ImageFile {
  data: string;
  mimeType: string;
  previewUrl: string;
}
