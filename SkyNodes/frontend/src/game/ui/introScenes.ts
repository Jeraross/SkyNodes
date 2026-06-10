import type { AtariSpriteId } from '../sprites/atariSprites';

export interface AeroTaleIntroScene {
  lines: string[];
  color: string;
  accent?: string;
  pauseMs: number;
  typeSpeed?: number;
  ascii?: string[];
  spriteId?: AtariSpriteId;
  flash?: boolean;
  bigTitle?: boolean;
}

export const AEROTALE_INTRO_SCENES: AeroTaleIntroScene[] = [
  {
    lines: ['O ANO É 2082.'],
    accent: 'A HUMANIDADE DEPENDE DE REDES DIGITAIS PARA MANTER CIDADES E AEROPORTOS FUNCIONANDO.',
    color: '#ff8800',
    pauseMs: 2200,
    typeSpeed: 24,
  },
  {
    lines: ['UMA TEMPESTADE SOLAR DE INTENSIDADE JAMAIS REGISTRADA', 'ESTÁ PRESTES A ATINGIR A TERRA.'],
    color: '#ff4400',
    pauseMs: 2800,
    flash: true,
    typeSpeed: 20,
  },
  {
    lines: ['O IMPACTO DERRUBOU OS SISTEMAS DE NAVEGAÇÃO AÉREA.'],
    color: '#ff0000',
    pauseMs: 2000,
    flash: true,
    typeSpeed: 20,
  },
  {
    lines: ['AS CONEXÕES ENTRE OS AEROPORTOS DESAPARECERAM.', '', 'SEM ROTAS SEGURAS, NENHUM AVIÃO PODE ATRAVESSAR O PAÍS.'],
    color: '#ff4444',
    pauseMs: 3000,
    typeSpeed: 20,
  },
  {
    lines: ['A MALHA AÉREA BRASILEIRA FOI FRAGMENTADA.'],
    color: '#ff0000',
    pauseMs: 2400,
    flash: true,
    typeSpeed: 18,
  },
  {
    lines: ['AS TECNOLOGIAS MAIS AVANÇADAS FORAM AS PRIMEIRAS A FALHAR.'],
    accent: 'ENTRETANTO, AS ANTIGAS LINHAS TELEFÔNICAS HAVIAM SIDO PROTEGIDAS.',
    color: '#00ffff',
    pauseMs: 2600,
    typeSpeed: 22,
  },
  {
    lines: ['ELAS AGORA SÃO O ÚNICO MEIO DE COMUNICAÇÃO AINDA DISPONÍVEL.'],
    color: '#00ffff',
    pauseMs: 2000,
    typeSpeed: 22,
  },
  {
    lines: ['AGENTE J: Alô! Com quem eu falo?'],
    color: '#ffd700',
    pauseMs: 1800,
    typeSpeed: 26,
  },
  {
    lines: ['PRESIDENTE: Companheiro J, sou eu, o presidente.', 'Preciso da sua ajuda.', 'Toda a malha aérea do Brasil caiu.'],
    color: '#ff8800',
    pauseMs: 2600,
    typeSpeed: 26,
  },
  {
    lines: ['AGENTE J: Senhor presidente, você já sabe que estou aposentado.'],
    color: '#ffd700',
    pauseMs: 2000,
    typeSpeed: 26,
  },
  {
    lines: ['PRESIDENTE: O governo vai pagar dez anos de pizza para você.'],
    color: '#ff8800',
    pauseMs: 2200,
    typeSpeed: 26,
  },
  {
    lines: ['AGENTE J: Estou dentro.'],
    color: '#ffd700',
    pauseMs: 1800,
    typeSpeed: 26,
  },
  {
    lines: ['', 'AEROTALE', ''],
    accent: 'RECONSTRUA A MALHA AÉREA BRASILEIRA.',
    color: '#ffd700',
    pauseMs: 4000,
    bigTitle: true,
    typeSpeed: 48,
  },
];
