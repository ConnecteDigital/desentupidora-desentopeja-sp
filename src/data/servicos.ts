import type { IconName } from './icons';

export interface Faq {
  q: string;
  a: string;
}

export interface Servico {
  slug: string;
  nome: string;
  // Palavra-chave principal da página (usada no H1 e no title)
  keyword: string;
  resumo: string;
  metaDescription: string;
  icon: IconName;
  intro: string[];
  sinais: string[];
  comoFazemos: string[];
  faq: Faq[];
  destaque?: boolean;
}

// ATENÇÃO: lista sugerida para desentupidora. Confirmar com o cliente o que ele NÃO faz
// e tirar daqui antes de subir campanha.
export const servicos: Servico[] = [
  {
    slug: 'desentupimento-de-pia',
    nome: 'Desentupimento de Pia',
    keyword: 'Desentupimento de pia 24 horas',
    resumo: 'Pia da cozinha ou do banheiro parada? Desentupimos com máquina, sem quebrar nada.',
    metaDescription:
      'Desentupimento de pia de cozinha e banheiro 24h em São Paulo e no ABC. Gordura, resto de comida, sifão entupido. Chame a Desentope Já no WhatsApp.',
    icon: 'sink',
    destaque: true,
    intro: [
      'Pia da cozinha é campeã de entupimento: gordura, borra de café e restos de comida vão grudando no cano até a água parar de descer. No banheiro, o vilão costuma ser cabelo, creme dental e sabonete.',
      'A Desentope Já atende 24 horas e usa máquina de cabo rotativo e desentupidor de pressão para limpar o sifão e o cano por dentro, sem quebrar a parede nem o piso sempre que possível.',
    ],
    sinais: [
      'Água descendo devagar ou parada na cuba',
      'Cheiro ruim saindo do ralo da pia',
      'Barulho de borbulha quando a água escoa',
      'Água voltando pelo ralo do tanque ou da área de serviço',
    ],
    comoFazemos: [
      'Verificamos se o entupimento está no sifão ou mais para dentro do cano',
      'Limpamos o sifão e passamos a máquina na tubulação',
      'Testamos com água corrente até escoar normalmente',
      'Damos dicas para a pia não entupir de novo',
    ],
    faq: [
      {
        q: 'Soda cáustica resolve pia entupida?',
        a: 'Às vezes alivia, mas pode danificar o cano e queimar a pele. Se a gordura já endureceu, a soda não resolve e o problema volta. O ideal é desentupir com máquina.',
      },
      {
        q: 'Precisa quebrar a parede para desentupir a pia?',
        a: 'Na grande maioria dos casos, não. A máquina entra pelo próprio cano até alcançar a obstrução.',
      },
    ],
  },
  {
    slug: 'desentupimento-de-vaso-sanitario',
    nome: 'Desentupimento de Vaso Sanitário',
    keyword: 'Desentupimento de vaso sanitário 24h',
    resumo: 'Vaso transbordando ou que não desce? Atendemos na hora, dia e noite.',
    metaDescription:
      'Desentupimento de vaso sanitário 24 horas em São Paulo e no ABC. Vaso transbordando, descarga que não desce. Desentope Já: chame no WhatsApp.',
    icon: 'toilet',
    destaque: true,
    intro: [
      'Vaso entupido é daquelas emergências que não dá para esperar o dia seguinte. Papel em excesso, absorvente, fio dental, lenço umedecido e objetos que caem no vaso são as causas mais comuns.',
      'Atendemos 24 horas, inclusive fins de semana e feriados. Desentupimos o vaso e o ramal de esgoto com equipamento próprio, sem precisar tirar a louça na maioria dos casos.',
    ],
    sinais: [
      'Água subindo e quase transbordando ao dar descarga',
      'Descarga que desce devagar ou em redemoinho fraco',
      'Cheiro forte de esgoto no banheiro',
      'Água voltando pelo ralo do box ao dar descarga',
    ],
    comoFazemos: [
      'Avaliamos se a obstrução está no vaso ou no cano de esgoto',
      'Desentupimos com equipamento adequado, sem retirar a louça sempre que possível',
      'Testamos várias descargas seguidas',
      'Deixamos o banheiro limpo ao terminar',
    ],
    faq: [
      {
        q: 'Posso usar produto químico no vaso entupido?',
        a: 'Não recomendamos. Os produtos raramente resolvem entupimento de vaso e podem danificar a louça e a tubulação.',
      },
      {
        q: 'Vocês atendem vaso entupido de madrugada?',
        a: 'Sim. O atendimento da Desentope Já é 24 horas, todos os dias.',
      },
    ],
  },
  {
    slug: 'desentupimento-de-ralo',
    nome: 'Desentupimento de Ralo',
    keyword: 'Desentupimento de ralo de banheiro e área',
    resumo: 'Ralo do box, da área de serviço ou do quintal empoçando? A gente resolve.',
    metaDescription:
      'Desentupimento de ralo de banheiro, box, área de serviço e quintal 24h em São Paulo e no ABC. Água empoçando e mau cheiro? Chame a Desentope Já.',
    icon: 'drain',
    intro: [
      'Ralo entupido deixa o box alagado no banho, a área de serviço empoçada e o quintal cheio de água quando chove. Cabelo, sabão, areia e folhas vão se acumulando na caixa sifonada e no cano.',
      'Limpamos a caixa sifonada e desobstruímos a tubulação do ralo com máquina, devolvendo o escoamento normal e acabando com o mau cheiro.',
    ],
    sinais: [
      'Água acumulando no box durante o banho',
      'Mau cheiro saindo do ralo',
      'Ralo da área de serviço transbordando quando a máquina de lavar esvazia',
      'Quintal alagando com chuva',
    ],
    comoFazemos: [
      'Abrimos e limpamos a caixa sifonada',
      'Desobstruímos o cano com máquina de cabo rotativo',
      'Testamos o escoamento com bastante água',
      'Fechamos e deixamos tudo limpo',
    ],
    faq: [
      {
        q: 'Ralo com cheiro de esgoto é entupimento?',
        a: 'Pode ser. Sujeira acumulada na caixa sifonada impede o fecho de água que segura o cheiro. A limpeza geralmente resolve.',
      },
    ],
  },
  {
    slug: 'desentupimento-de-esgoto',
    nome: 'Desentupimento de Esgoto',
    keyword: 'Desentupimento de esgoto e rede de esgoto',
    resumo: 'Esgoto voltando ou transbordando na caixa de inspeção? Desobstruímos a rede.',
    metaDescription:
      'Desentupimento de esgoto 24h em São Paulo e no ABC: rede, caixa de inspeção e tubulação. Casas, prédios e comércios. Chame a Desentope Já no WhatsApp.',
    icon: 'pipe',
    destaque: true,
    intro: [
      'Quando o entupimento está na rede de esgoto, o problema aparece em vários pontos ao mesmo tempo: ralos voltando água, vaso que não desce e caixa de inspeção transbordando no quintal ou na garagem.',
      'Usamos máquinas de desentupimento de maior porte e, quando necessário, hidrojateamento para limpar a tubulação de ponta a ponta, em casas, prédios e comércios.',
    ],
    sinais: [
      'Vários ralos e o vaso entupidos ao mesmo tempo',
      'Caixa de inspeção transbordando',
      'Esgoto voltando no ponto mais baixo da casa',
      'Mau cheiro forte no quintal ou na garagem',
    ],
    comoFazemos: [
      'Localizamos o trecho entupido pelas caixas de inspeção',
      'Desobstruímos com máquina ou hidrojateamento',
      'Testamos o fluxo em toda a linha',
      'Indicamos se há cano quebrado ou raiz na tubulação',
    ],
    faq: [
      {
        q: 'Atendem esgoto de comércio e restaurante?',
        a: 'Sim. Atendemos residências, prédios, condomínios e comércios, inclusive fora do horário comercial para não atrapalhar o funcionamento.',
      },
    ],
  },
  {
    slug: 'desentupimento-de-coluna',
    nome: 'Desentupimento de Coluna de Prédio',
    keyword: 'Desentupimento de coluna de prédio e condomínio',
    resumo: 'Coluna de esgoto ou de cozinha entupida no prédio? Atendemos condomínios 24h.',
    metaDescription:
      'Desentupimento de coluna de esgoto e de cozinha em prédios e condomínios, 24h, em São Paulo e no ABC. Chame a Desentope Já no WhatsApp.',
    icon: 'building',
    intro: [
      'Em prédio, quando a coluna entope, a água volta nos apartamentos dos andares de baixo. É uma emergência que afeta vários moradores ao mesmo tempo e precisa ser resolvida rápido.',
      'Atendemos síndicos, zeladores e administradoras com desentupimento de colunas de esgoto, de cozinha e de águas pluviais, a qualquer hora.',
    ],
    sinais: [
      'Água ou espuma voltando na pia ou no ralo dos andares baixos',
      'Vários apartamentos reclamando ao mesmo tempo',
      'Barulho e cheiro na coluna',
    ],
    comoFazemos: [
      'Identificamos a coluna e o andar onde está a obstrução',
      'Desobstruímos pela visita ou pelo topo da coluna',
      'Testamos com água em mais de um andar',
      'Orientamos o condomínio sobre manutenção preventiva',
    ],
    faq: [
      {
        q: 'Atendem condomínio fora do horário comercial?',
        a: 'Sim. Atendemos 24 horas, inclusive à noite, fins de semana e feriados.',
      },
    ],
  },
  {
    slug: 'hidrojateamento',
    nome: 'Hidrojateamento',
    keyword: 'Hidrojateamento de tubulação e esgoto',
    resumo: 'Jato de água em alta pressão para limpar tubulações com gordura e sujeira pesada.',
    metaDescription:
      'Hidrojateamento de tubulação, esgoto e galerias em São Paulo e no ABC. Limpeza pesada com água em alta pressão. Chame a Desentope Já no WhatsApp.',
    icon: 'jet',
    intro: [
      'O hidrojateamento usa água em alta pressão para limpar a parede interna do cano, removendo gordura endurecida, lodo e incrustações que a máquina comum não tira por completo.',
      'É indicado para redes de esgoto de prédios, comércios, restaurantes e para casos de entupimento que voltam com frequência.',
    ],
    sinais: [
      'Entupimento que volta pouco tempo depois de desentupido',
      'Tubulação com muita gordura, como em restaurantes',
      'Rede de esgoto longa ou de diâmetro maior',
    ],
    comoFazemos: [
      'Avaliamos a tubulação e o acesso pelas caixas de inspeção',
      'Fazemos a limpeza com jato de alta pressão',
      'Testamos o fluxo ao final',
      'Indicamos manutenção preventiva quando necessário',
    ],
    faq: [
      {
        q: 'Hidrojateamento danifica o cano?',
        a: 'Não, quando feito com a pressão e o bico corretos para cada tipo de tubulação.',
      },
    ],
  },
];

export function getServico(slug: string) {
  return servicos.find((s) => s.slug === slug);
}
