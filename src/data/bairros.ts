export type Zona = 'Zona Oeste' | 'Zona Leste' | 'ABC Paulista';

export interface Bairro {
  slug: string;
  nome: string;
  // "no Itaim Bibi", "em Pinheiros": usado nos títulos e textos
  em: string;
  zona: Zona;
  cidade: string;
  // Texto exclusivo da página para não repetir conteúdo entre bairros
  sobre: string;
  vizinhos: string[];
}

export const zonasPrioritarias: Zona[] = [];
export const ordemZonas: Zona[] = ['Zona Oeste', 'Zona Leste', 'ABC Paulista'];

export const bairros: Bairro[] = [
  {
    slug: 'itaim-bibi',
    nome: 'Itaim Bibi',
    em: 'no Itaim Bibi',
    zona: 'Zona Oeste',
    cidade: 'São Paulo',
    sobre:
      'O Itaim Bibi concentra prédios residenciais altos, escritórios, bares e restaurantes. Por isso, além de pia e vaso entupidos em apartamentos, são comuns chamados de esgoto em cozinhas comerciais e em condomínios.',
    vizinhos: ['Vila Olímpia', 'Jardim Paulistano', 'Vila Nova Conceição', 'Brooklin'],
  },
  {
    slug: 'pinheiros',
    nome: 'Pinheiros',
    em: 'em Pinheiros',
    zona: 'Zona Oeste',
    cidade: 'São Paulo',
    sobre:
      'Em Pinheiros convivem casas antigas, prédios novos e muitos bares e restaurantes. Nas casas antigas a rede de esgoto costuma ter mais gordura e sujeira acumulada; nos comércios, os chamados mais comuns são de esgoto e ralo entupidos.',
    vizinhos: ['Vila Madalena', 'Alto de Pinheiros', 'Jardim Paulistano', 'Butantã'],
  },
  {
    slug: 'perdizes',
    nome: 'Perdizes',
    em: 'em Perdizes',
    zona: 'Zona Oeste',
    cidade: 'São Paulo',
    sobre:
      'Perdizes tem muitos prédios residenciais em ruas de ladeira. Os chamados mais comuns são pia de cozinha e vaso sanitário entupidos, além de ralo empoçando em casas e sobrados.',
    vizinhos: ['Pompeia', 'Sumaré', 'Barra Funda', 'Água Branca'],
  },
  {
    slug: 'tatuape',
    nome: 'Tatuapé',
    em: 'no Tatuapé',
    zona: 'Zona Leste',
    cidade: 'São Paulo',
    sobre:
      'O Tatuapé cresceu com muitos prédios altos e mantém ruas de casas e sobrados e um comércio forte. Atendemos desde pia e ralo entupidos em apartamentos até rede de esgoto de casas e comércios.',
    vizinhos: ['Anália Franco', 'Carrão', 'Vila Formosa', 'Mooca'],
  },
  {
    slug: 'santo-andre',
    nome: 'Santo André',
    em: 'em Santo André',
    zona: 'ABC Paulista',
    cidade: 'Santo André',
    sobre:
      'Em Santo André atendemos casas, prédios, comércios e indústrias, do Centro à Vila Assunção, Jardim e Utinga. Desentupimos pia, vaso, ralo e esgoto 24 horas.',
    vizinhos: ['São Caetano do Sul', 'São Bernardo do Campo', 'Mauá', 'Utinga'],
  },
  {
    slug: 'sao-bernardo-do-campo',
    nome: 'São Bernardo do Campo',
    em: 'em São Bernardo do Campo',
    zona: 'ABC Paulista',
    cidade: 'São Bernardo do Campo',
    sobre:
      'São Bernardo do Campo é grande e variada: bairros residenciais como Rudge Ramos e Nova Petrópolis, muitos condomínios e áreas comerciais no Centro. Atendemos desentupimento residencial, de condomínio e de comércio a qualquer hora.',
    vizinhos: ['Rudge Ramos', 'Centro', 'Santo André', 'Diadema'],
  },
  {
    slug: 'sao-caetano-do-sul',
    nome: 'São Caetano do Sul',
    em: 'em São Caetano do Sul',
    zona: 'ABC Paulista',
    cidade: 'São Caetano do Sul',
    sobre:
      'São Caetano do Sul é compacta, com muitos prédios residenciais e casas antigas em bairros como Santa Paula, Barcelona e Santo Antônio. Vaso, ralo e rede de esgoto de casa antiga estão entre os chamados mais comuns.',
    vizinhos: ['Santa Paula', 'Barcelona', 'Santo André', 'São Bernardo do Campo'],
  },
  {
    slug: 'diadema',
    nome: 'Diadema',
    em: 'em Diadema',
    zona: 'ABC Paulista',
    cidade: 'Diadema',
    sobre:
      'Em Diadema atendemos casas, sobrados, comércios e indústrias, do Centro a Piraporinha, Eldorado e Serraria. Desentupimento de pia, vaso, ralo e esgoto, 24 horas.',
    vizinhos: ['Centro', 'Piraporinha', 'São Bernardo do Campo', 'Eldorado'],
  },
];

export function bairroPath(b: Bairro) {
  return `/desentupidora-em-${b.slug}/`;
}

export function bairrosPorZona() {
  return ordemZonas
    .map((zona) => ({ zona, bairros: bairros.filter((b) => b.zona === zona) }))
    .filter((g) => g.bairros.length > 0);
}
