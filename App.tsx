
import React, { useState, useCallback } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { MobileModal } from './components/MobileModal';
import { generateImageFromPrompt, editImageWithPrompt, composeImagesWithPrompt, generateImageWithReferences } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import type { Mode, CreateFunction, EditFunction, ImageFile } from './types';
import type { AspectRatio } from './services/geminiService';

const AD_PROMPT_TEMPLATE = `[Contexto]
Marque o estilo: **foto realista** ou **cinematográfico**. Gere 4 variações com ângulos diferentes. Preserve identidade de pessoas se forem referências reais.

[Brief da peça]
Objetivo: {{captar_leads | vender_produto | agendar_serviço}}
Público-alvo: {{faixa_etária}}, {{local}}, {{interesses}}
Oferta: {{descrição da oferta e condição}}
Prova/Autoridade: {{número de clientes | nota | prêmio}}
CTA: {{Fale no WhatsApp | Reserve agora | Peça orçamento}}
Canais: {{Instagram Feed | Stories | Reels | Facebook Ads}}
Idioma/Tom: PT-BR, {{direto | confiante | premium}}
Restrições de marca: logo {{upload/posição}}, paleta {{códigos hex}}, tipografia {{nome}}, proibições {{frases banidas}}
Texto on-image (opcional, até 8 palavras): {{headline curta}}
Legenda curta: {{1–2 frases com CTA}} + hashtags {{#... #... #...}}

[Direção de Arte]
Cores: {{paleta}}
Cenário: {{descrição do ambiente}}
Figurino/props: {{roupas, objetos}}
Humor: {{elegante | acolhedor | energia alta | paz}}
Composição: {{regra dos terços | simetria | leading lines}}
Foco: {{produto | pessoa | resultado antes/depois}}

[MODO 1 — FOTO REALISTA PREMIUM]
Descreva uma fotografia editorial de alta qualidade do(a) {{assunto principal}} em {{local}}, luz {{suave | lateral | janela}}, temperatura {{quente | fria}}, fundo {{limpo | bokeh}}, nitidez alta, textura real da pele/objeto preservada, profundidade de campo realista.
Câmera: 50mm/85mm, f/1.8–f/2.8, ISO baixo, shutter adequado.
Ângulos a gerar: close-up, meio-corpo, plano americano, detalhe macro do produto.
Direção: expressões naturais, postura confiante, mãos em ação quando fizer sentido.
Evitar: pele plastificada, HDR agressivo, cores lavadas.

[MODO 2 — CINEMATOGRÁFICO REALISTA]
Descreva um still ou frame de vídeo com look filme. Iluminação “golden hour” ou “prática + recorte” conforme cena.
Câmera: 35mm/50mm, leve grão orgânico, contraste moderado, black point controlado.
Movimento sugerido (se vídeo): leve push-in ou pan suave; se imagem, simule motion cues.
Color grading: curva em S sutil, tons {{teal&orange | neutros premium | quentes suaves}}, preservando tons de pele.
Ângulos a gerar: plano aberto contextual, plano médio, contra-plongée leve para autoridade, detalhe do produto com reflexos controlados.

[Texto on-image — se usar]
Tipografia: {{família da marca}} peso {{semibold}}, kerning normal.
Colocar a headline em área de respiro, contraste AA/AAA, máx. 8 palavras, sem parágrafos.
Safe zone: 10% das bordas.
Logo: canto {{superior direito | inferior esquerdo}} 4–6% da largura.

[Saídas]

1. Imagem/Frame final em {{JPG/PNG}} na proporção escolhida.
2. Variações: 4 ângulos distintos + 2 variações de iluminação.
3. Versão com texto on-image e versão limpa.
4. Legenda pronta em PT-BR com CTA e 5 hashtags.
5. Paleta final usada (hex) e breve nota de iluminação.

[Negativos — não gerar]
desfoque artificial excessivo, pele de plástico, mãos deformadas, proporções irreais, logotipos alterados, textos ilegíveis, watermark, ruído digital pesado, artefatos, conteúdo sensível, violar direitos de imagem.`;

export default function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [mode, setMode] = useState<Mode>('create');
  const [createFunction, setCreateFunction] = useState<CreateFunction>('free');
  const [editFunction, setEditFunction] = useState<EditFunction>('add-remove');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  
  const [uploadedImage, setUploadedImage] = useState<ImageFile | null>(null);
  const [uploadedImage1, setUploadedImage1] = useState<ImageFile | null>(null);
  const [uploadedImage2, setUploadedImage2] = useState<ImageFile | null>(null);
  const [thumbnailRefImage, setThumbnailRefImage] = useState<ImageFile | null>(null);
  const [adRefImage1, setAdRefImage1] = useState<ImageFile | null>(null);
  const [adRefImage2, setAdRefImage2] = useState<ImageFile | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [sourceImageForComparison, setSourceImageForComparison] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSetCreateFunction = useCallback((func: CreateFunction) => {
    // Logic for leaving 'ad' mode
    if (createFunction === 'ad' && func !== 'ad') {
        setPrompt('');
    }

    // Set defaults for the new function
    switch (func) {
        case 'ad':
            setPrompt('');
            setAspectRatio('3:4');
            break;
        case 'thumbnail':
            setAspectRatio('16:9');
            break;
        case 'hq':
            setAspectRatio('3:4');
            break;
        case 'compose':
            // No aspect ratio change for compose
            break;
        default:
            // For 'free', 'sticker', 'text', 'comic'
            setAspectRatio('1:1');
            break;
    }
    
    setCreateFunction(func);
  }, [createFunction]);

  const handleImageUpload = useCallback(async (
    input: HTMLInputElement, 
    setter: React.Dispatch<React.SetStateAction<ImageFile | null>>
  ) => {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const { base64, mimeType } = await fileToBase64(file);
        setter({ data: base64, mimeType: mimeType, previewUrl: URL.createObjectURL(file) });
      } catch (error) {
        console.error("Error converting file to base64:", error);
        alert('Erro ao processar a imagem.');
      }
    }
  }, []);

  const generateImage = useCallback(async () => {
    if (mode === 'create' && createFunction === 'ad' && !prompt) {
      alert('Por favor, descreva a ideia principal para a sua publicidade.');
      return;
    }
    if (createFunction !== 'compose' && createFunction !== 'ad' && !prompt) {
      alert('Por favor, insira uma ideia para a imagem.');
      return;
    }
     if (createFunction === 'compose' && !prompt) {
      alert('Por favor, insira uma instrução de mesclagem.');
      return;
    }
    
    setIsLoading(true);
    setGeneratedImage(null);
    
    let sourceForComparison: string | null = null;
    if (mode === 'edit' && uploadedImage) {
      sourceForComparison = uploadedImage.previewUrl;
    } else if (createFunction === 'thumbnail' && thumbnailRefImage) {
      sourceForComparison = thumbnailRefImage.previewUrl;
    } else if (createFunction === 'ad' && adRefImage1) {
      sourceForComparison = adRefImage1.previewUrl;
    }
    setSourceImageForComparison(sourceForComparison);

    if(window.innerWidth < 1024) setIsModalOpen(true);

    try {
      let result: string | null = null;
      if (mode === 'create') {
        if (createFunction === 'ad') {
            const finalAdPrompt = AD_PROMPT_TEMPLATE.replace('{{assunto principal}}', prompt);
            const adRefImages = [adRefImage1, adRefImage2].filter((img): img is ImageFile => img !== null);
            if (adRefImages.length > 0) {
                result = await generateImageWithReferences(finalAdPrompt, adRefImages, aspectRatio);
            } else {
                result = await generateImageFromPrompt(finalAdPrompt, aspectRatio);
            }
        } else if (createFunction === 'thumbnail') {
          const thumbPrompt = `Stunning YouTube thumbnail for a video titled "${prompt}", professional design, eye-catching, high contrast, vibrant colors, clean typography, engaging visuals that represent the video's content.`;
          if (thumbnailRefImage) {
              result = await editImageWithPrompt(thumbPrompt, thumbnailRefImage, aspectRatio);
          } else {
              result = await generateImageFromPrompt(thumbPrompt, aspectRatio);
          }
        } else if (createFunction === 'compose') {
          if (!uploadedImage1 || !uploadedImage2) {
            alert('Por favor, carregue duas imagens para mesclar.');
            setIsLoading(false);
            if(window.innerWidth < 1024) setIsModalOpen(false);
            return;
          }
          result = await composeImagesWithPrompt(prompt, uploadedImage1, uploadedImage2);
        } else {
          let finalPrompt = prompt;

          if (createFunction === 'sticker') {
              finalPrompt = `design a sticker of ${prompt}, vector art, clean edges, white background, vibrant colors`;
          } else if (createFunction === 'text') {
              finalPrompt = `typographic logo design for "${prompt}", minimalist, vector, high-contrast, on a plain background`;
          } else if (createFunction === 'comic') {
              finalPrompt = `a single comic book panel depicting ${prompt}, dynamic action, bold lines, halfton dots, vibrant colors`;
          } else if (createFunction === 'hq') {
              finalPrompt = `Comic book page telling the story of "${prompt}". Create a sequence of 3-4 panels showing this narrative. Use a professional comic art style with dynamic composition, bold ink lines, vibrant colors, and clear panel layouts. Include speech bubbles and captions if they enhance the story. Focus on sequential visual storytelling.`;
          }
          result = await generateImageFromPrompt(finalPrompt, aspectRatio);
        }
      } else { // edit mode
          if (!uploadedImage) {
            alert('Por favor, carregue uma imagem para editar.');
            setIsLoading(false);
            if(window.innerWidth < 1024) setIsModalOpen(false);
            return;
          }
          result = await editImageWithPrompt(prompt, uploadedImage);
      }
      setGeneratedImage(result);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Ocorreu um erro ao gerar a imagem. Verifique o console para mais detalhes.');
      if(window.innerWidth < 1024) setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, mode, createFunction, editFunction, uploadedImage, uploadedImage1, uploadedImage2, thumbnailRefImage, adRefImage1, adRefImage2, aspectRatio]);

  const editCurrentImage = useCallback(() => {
    if (generatedImage) {
      setMode('edit');
      setUploadedImage({ data: generatedImage.split(',')[1], mimeType: 'image/png', previewUrl: generatedImage });
      setGeneratedImage(null);
      setSourceImageForComparison(null);
      if (window.innerWidth < 1024) setIsModalOpen(false);
    }
  }, [generatedImage]);

  const downloadImage = useCallback(() => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [generatedImage]);

  const discardImage = () => {
    setGeneratedImage(null);
    setSourceImageForComparison(null);
  };

  const newImage = () => {
    setGeneratedImage(null);
    setSourceImageForComparison(null);
    setPrompt('');
    setUploadedImage(null);
    setUploadedImage1(null);
    setUploadedImage2(null);
    setThumbnailRefImage(null);
    setAdRefImage1(null);
    setAdRefImage2(null);
    setIsModalOpen(false);
    setMode('create');
    setCreateFunction('free');
    setAspectRatio('1:1');
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 font-sans flex flex-col lg:flex-row p-4 gap-4">
      <LeftPanel
        prompt={prompt}
        setPrompt={setPrompt}
        mode={mode}
        setMode={setMode}
        createFunction={createFunction}
        setCreateFunction={handleSetCreateFunction}
        editFunction={editFunction}
        setEditFunction={setEditFunction}
        uploadedImage={uploadedImage}
        handleImageUpload={handleImageUpload}
        setUploadedImage={setUploadedImage}
        generateImage={generateImage}
        isLoading={isLoading}
        uploadedImage1={uploadedImage1}
        setUploadedImage1={setUploadedImage1}
        uploadedImage2={uploadedImage2}
        setUploadedImage2={setUploadedImage2}
        thumbnailRefImage={thumbnailRefImage}
        setThumbnailRefImage={setThumbnailRefImage}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        adRefImage1={adRefImage1}
        setAdRefImage1={setAdRefImage1}
        adRefImage2={adRefImage2}
        setAdRefImage2={setAdRefImage2}
      />
      <RightPanel
        isLoading={isLoading}
        generatedImage={generatedImage}
        editCurrentImage={editCurrentImage}
        downloadImage={downloadImage}
        discardImage={discardImage}
        sourceImageForComparison={sourceImageForComparison}
        mode={mode}
        uploadedImage={uploadedImage}
      />
      {isModalOpen && (
        <MobileModal
          isLoading={isLoading}
          generatedImage={generatedImage}
          editFromModal={editCurrentImage}
          downloadFromModal={downloadImage}
          newImageFromModal={newImage}
          discardFromModal={discardImage}
          sourceImageForComparison={sourceImageForComparison}
        />
      )}
    </div>
  );
}
