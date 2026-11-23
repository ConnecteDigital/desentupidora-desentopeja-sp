import type { ImageMetadata } from 'astro';

// Fotos reais de serviços feitos, uma por serviço (src/assets/fotos/<slug>.jpg).
// Os originais ficam em fotos/<slug>/ na raiz do repositório.
const arquivos = import.meta.glob<{ default: ImageMetadata }>('../assets/fotos/*.jpg', { eager: true });

// Texto alternativo de cada foto (para o Google e acessibilidade). Ajustar quando as fotos reais chegarem.
const alts: Record<string, string> = {
  'desentupimento-de-pia': 'Técnico da Desentope Já desentupindo pia de cozinha',
  'desentupimento-de-vaso-sanitario': 'Desentupimento de vaso sanitário feito pela Desentope Já',
  'desentupimento-de-ralo': 'Limpeza de ralo e caixa sifonada entupidos',
  'desentupimento-de-esgoto': 'Máquina de desentupimento na caixa de inspeção de esgoto',
  'desentupimento-de-coluna': 'Desentupimento de coluna de esgoto em prédio',
  hidrojateamento: 'Hidrojateamento de tubulação de esgoto com água em alta pressão',
};

export interface Foto {
  src: ImageMetadata;
  alt: string;
}

export function fotoDoServico(slug: string): Foto | undefined {
  const mod = arquivos[`../assets/fotos/${slug}.jpg`];
  if (!mod) return undefined;
  return { src: mod.default, alt: alts[slug] ?? 'Serviço realizado pela Desentope Já' };
}

// Quantas fotos de serviço já existem (a galeria só aparece quando houver fotos)
export const totalFotos = Object.keys(arquivos).length;
