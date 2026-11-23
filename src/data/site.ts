// Dados centrais da empresa. Altere aqui e o site inteiro é atualizado.

// Formato: 55 + DDD + número, só dígitos
const PHONE_DIGITS = '5511945416519';

export const site = {
  name: 'Desentope Já',
  legalName: 'Desentope Já Desentupidora 24h',
  // TODO: trocar pelo domínio definitivo quando estiver registrado
  url: 'https://desentopejasp.com.br',
  city: 'São Paulo',
  state: 'SP',
  phoneDigits: PHONE_DIGITS,
  // Exibição: (11) 94541-6519
  phoneDisplay: `(${PHONE_DIGITS.slice(2, 4)}) ${PHONE_DIGITS.slice(4, 9)}-${PHONE_DIGITS.slice(9)}`,
  tel: `tel:+${PHONE_DIGITS}`,
  regioes: 'Itaim Bibi, Pinheiros, Perdizes, Tatuapé e ABC Paulista',
  description:
    'Desentupidora 24 horas em São Paulo e no ABC. Desentupimento de pia, vaso sanitário, ralo, esgoto e hidrojateamento. Atendemos Itaim Bibi, Pinheiros, Perdizes, Tatuapé e ABC.',
};

export const DEFAULT_WHATSAPP_MESSAGE = 'Olá! Vim pelo site da Desentope Já e preciso de um desentupimento.';

export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://api.whatsapp.com/send?phone=${site.phoneDigits}&text=${encodeURIComponent(message)}`;
}

// Contêiner do Google Tag Manager (ex.: 'GTM-XXXXXXX'). Vazio = sem rastreamento instalado.
export const gtmId = '';
