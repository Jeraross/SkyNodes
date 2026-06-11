// AeroTale — Combat Encounter Definitions
// Each encounter represents a corrupted network node that must be repaired or defeated.

import type { AtariSpriteId } from '../sprites/atariSprites';

export type BulletShape = 'square' | 'diamond' | 'line-h' | 'line-v';

export interface SpawnWave {
  at: number;         // ms after attack starts to spawn this wave
  type: 'sweep-h' | 'sweep-v' | 'rain' | 'aimed' | 'bounce' | 'grid' | 'zigzag';
  count: number;
  speed: number;
  size?: number;
  color?: string;
  gap?: number;       // for sweep: vertical gap between bullets
  fromRight?: boolean;
  fromBottom?: boolean;
}

export interface AttackMove {
  name: string;
  dialogue: string;
  duration: number;  // ms
  waves: SpawnWave[];
}

export interface ActOption {
  id: string;
  label: string;
  result: string;
  weakens: boolean;
  unlocksMercy?: boolean;
}

export interface CombatEncounter {
  id: string;
  airportId: string;
  name: string;
  subtitle: string;
  flavorText: string;
  maxHp: number;
  spriteId: AtariSpriteId;
  spriteLines?: string[];
  attackMoves: AttackMove[];
  actOptions: ActOption[];
  mercyLabel: string;
  spareRequirement: string;
  cantSpareText: string;
  defeatText: string;
  victoryText: string;
  storyReveal?: string;
}

// ─── GLITCH FRAGMENTO — Tutorial ──────────────────────────────────────────────────
const NODO_REC: CombatEncounter = {
  id: 'nodo-rec-01',
  airportId: 'REC',
  name: 'GLITCH FRAGMENTO',
  subtitle: '* Fragmento digital corrompido pela tempestade solar',
  flavorText: 'ORDEM: DIVIDIR. APAGAR. ISOLAR.\nCONEXÃO INVÁLIDA DETECTADA.',
  maxHp: 80,
  spriteId: 'nodo-rec',
  spriteLines: [
    '  ╔══╗  ',
    '  ║??║  ',
    '  ╚╦═╝  ',
    '   ║    ',
    '╔══╩══╗ ',
    '║ERR01║ ',
    '╚══╦══╝ ',
    '   ║    ',
  ],
  attackMoves: [
    {
      name: 'VARREDURA-H',
      dialogue: '* NODO-REC emite pulsos horizontais de interferência.',
      duration: 4000,
      waves: [
        { at: 200,  type: 'sweep-h', count: 3, speed: 2.5, gap: 55, color: '#ff4400' },
        { at: 1400, type: 'sweep-h', count: 3, speed: 2.8, gap: 55, color: '#ff4400', fromRight: true },
        { at: 2600, type: 'sweep-h', count: 4, speed: 3.0, gap: 44, color: '#ff8800' },
      ],
    },
    {
      name: 'CHUVA-ESTÁTICA',
      dialogue: '* Estática cai como chuva. Os sensores piscam vermelho.',
      duration: 4500,
      waves: [
        { at: 100,  type: 'rain', count: 5,  speed: 2.5, color: '#ff4400' },
        { at: 800,  type: 'rain', count: 6,  speed: 2.8, color: '#ff6600' },
        { at: 1600, type: 'rain', count: 7,  speed: 3.0, color: '#ff4400' },
        { at: 2400, type: 'rain', count: 5,  speed: 2.5, color: '#ff8800' },
        { at: 3200, type: 'rain', count: 8,  speed: 3.2, color: '#ff4400' },
      ],
    },
    {
      name: 'PULSO-DIRIGIDO',
      dialogue: '* O fragmento rastreia sua posição. Pulsos convergem.',
      duration: 5000,
      waves: [
        { at: 300,  type: 'aimed', count: 3, speed: 2.0, color: '#ff0066' },
        { at: 1300, type: 'aimed', count: 4, speed: 2.3, color: '#ff4400' },
        { at: 2200, type: 'aimed', count: 3, speed: 2.0, color: '#ff0066' },
        { at: 3000, type: 'rain',  count: 4, speed: 2.5, color: '#ff6600' },
        { at: 3800, type: 'aimed', count: 6, speed: 2.5, color: '#ff4400' },
      ],
    },
    {
      name: 'ZIGZAG-DUPLO',
      dialogue: '* Sinais em zigue-zague. O padrão de corrupção se acelera.',
      duration: 4800,
      waves: [
        { at: 100,  type: 'zigzag', count: 4, speed: 2.2, color: '#ff8800' },
        { at: 1200, type: 'zigzag', count: 5, speed: 2.5, color: '#ff4400' },
        { at: 2000, type: 'sweep-h', count: 2, speed: 2.0, gap: 80, color: '#ff6600' },
        { at: 2800, type: 'zigzag', count: 4, speed: 2.2, color: '#ff8800', fromRight: true },
        { at: 3800, type: 'zigzag', count: 6, speed: 2.8, color: '#ff4400' },
      ],
    },
    {
      name: 'BOUNCE-CAOS',
      dialogue: '* Fragmentos quicam pelas paredes. Fique no centro!',
      duration: 5500,
      waves: [
        { at: 200,  type: 'bounce', count: 3, speed: 1.8, color: '#ff8800' },
        { at: 1000, type: 'rain',   count: 5, speed: 2.5, color: '#ff4400' },
        { at: 1800, type: 'bounce', count: 4, speed: 2.0, color: '#ff0044' },
        { at: 2800, type: 'aimed',  count: 4, speed: 2.2, color: '#ff6600' },
        { at: 3800, type: 'bounce', count: 3, speed: 1.8, color: '#ff8800' },
        { at: 4600, type: 'rain',   count: 6, speed: 3.0, color: '#ff4400' },
      ],
    },
    {
      name: 'GRADE-ATIVADA',
      dialogue: '* A grade de interferência cobre toda a área de controle.',
      duration: 4500,
      waves: [
        { at: 200,  type: 'grid', count: 15, speed: 2.0, color: '#ff4400' },
        { at: 2000, type: 'grid', count: 15, speed: 2.5, color: '#ff8800', fromBottom: true },
        { at: 3500, type: 'rain', count: 6,  speed: 2.8, color: '#ff4400' },
      ],
    },
    {
      name: 'VARREDURA-CRUZADA',
      dialogue: '* Pulsos horizontais e verticais ao mesmo tempo. Máxima interferência.',
      duration: 5000,
      waves: [
        { at: 200,  type: 'sweep-h', count: 3, speed: 2.5, gap: 55, color: '#ff4400' },
        { at: 600,  type: 'sweep-v', count: 3, speed: 2.5, gap: 80, color: '#ff8800' },
        { at: 1800, type: 'sweep-h', count: 3, speed: 2.8, gap: 55, color: '#ff4400', fromRight: true },
        { at: 2200, type: 'sweep-v', count: 3, speed: 2.8, gap: 80, color: '#ff6600', fromBottom: true },
        { at: 3500, type: 'aimed',   count: 5, speed: 2.5, color: '#ff0044' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'analisar',
      label: 'ANALISAR',
      result:
        '* Você analisa o nó. DIAGNÓSTICO: Tabela de roteamento corrompida por pulso solar. Uma reinicialização forçada deve resolver.',
      weakens: true,
    },
    {
      id: 'reiniciar',
      label: 'REINICIAR',
      result: '* Você envia o comando de reset de fábrica. O nó treme... e para de emitir.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'IGNORAR',
  spareRequirement: 'Reconecte o sistema',
  cantSpareText: '* O fragmento ainda resiste à conectividade.',
  defeatText: '* O glitch fragmentou as conexões novamente.',
  victoryText: '* CONECTIVIDADE... RESTAURADA... ERRO...',
  storyReveal:
    'Lia acessa o log remoto via rádio. O padrão de corrupção tem uma assinatura artificial — não é efeito aleatório da onda solar. Alguém ativou isso.',
};

// ─── ONDA-FOR-02 — Fortaleza ───────────────────────────────────────────────────
const ONDA_FOR: CombatEncounter = {
  id: 'onda-for-02',
  airportId: 'FOR',
  name: 'ONDA-FOR-02',
  subtitle: '* Anomalia de campo — Fortaleza',
  flavorText:
    'A anomalia em Fortaleza é diferente. Não é só corrupção — ela está se REPLICANDO. Cada nó que você repara, ela tenta reconquistar. É mais agressiva que o esperado.',
  maxHp: 120,
  spriteId: 'onda-for',
  spriteLines: [
    ' ~~ONDA~~ ',
    '≈≈≈≈≈≈≈≈≈ ',
    ' ╔══╗     ',
    ' ║∿∿║     ',
    ' ╚══╝     ',
    '≈≈≈≈≈≈≈≈≈ ',
    ' INSTÁVEL ',
  ],
  attackMoves: [
    {
      name: 'PULSO-DUPLO',
      dialogue: '* A onda se divide em dois flancos simultâneos.',
      duration: 5000,
      waves: [
        { at: 100,  type: 'sweep-h', count: 2, speed: 3.0, gap: 88, color: '#ff4400' },
        { at: 100,  type: 'sweep-v', count: 2, speed: 3.0, gap: 130, color: '#ff6600' },
        { at: 1500, type: 'sweep-h', count: 3, speed: 3.2, gap: 60, color: '#ff4400', fromRight: true },
        { at: 2800, type: 'sweep-v', count: 3, speed: 3.0, gap: 90, color: '#ff6600', fromBottom: true },
        { at: 4000, type: 'sweep-h', count: 2, speed: 3.5, gap: 88, color: '#ff8800' },
      ],
    },
    {
      name: 'BOMBARDEIO',
      dialogue: '* Fortaleza perde completamente o sinal. Chuva densa de interferência.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'rain', count: 8,  speed: 3.2, color: '#ff4400' },
        { at: 600,  type: 'rain', count: 6,  speed: 2.8, color: '#ff6600' },
        { at: 1200, type: 'aimed', count: 3, speed: 2.5, color: '#ff0000' },
        { at: 2000, type: 'rain', count: 9,  speed: 3.4, color: '#ff4400' },
        { at: 2800, type: 'aimed', count: 4, speed: 2.8, color: '#ff2200' },
        { at: 3600, type: 'rain', count: 7,  speed: 3.0, color: '#ff6600' },
        { at: 4400, type: 'aimed', count: 3, speed: 3.2, color: '#ff0000' },
      ],
    },
    {
      name: 'REFLEXO',
      dialogue: '* A onda encontra os limites da malha e quica de volta.',
      duration: 5000,
      waves: [
        { at: 100,  type: 'bounce', count: 4, speed: 2.8, color: '#ff8800' },
        { at: 900,  type: 'bounce', count: 3, speed: 3.0, color: '#ff4400' },
        { at: 1800, type: 'bounce', count: 5, speed: 2.6, color: '#ff8800' },
        { at: 2700, type: 'aimed',  count: 3, speed: 2.5, color: '#ff0000' },
        { at: 3500, type: 'bounce', count: 4, speed: 3.2, color: '#ff4400' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'diagnosticar',
      label: 'DIAGNOSTICAR',
      result:
        '* Você executa um diagnóstico profundo. A anomalia usa um protocolo de auto-replicação não documentado. Código-base: desconhecido.',
      weakens: true,
    },
    {
      id: 'isolamento',
      label: 'ISOLAR NODO',
      result:
        '* Você corta o nó da rede maior. Sem hospedeiros, a anomalia perde metade de sua energia.',
      weakens: true,
    },
    {
      id: 'purgar',
      label: 'PURGAR',
      result:
        '* Você injeta um sinal de limpeza. A anomalia recua. Ainda está resistindo, mas com menos força.',
      weakens: false,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'DESCONECTAR',
  spareRequirement: 'purgar',
  cantSpareText:
    '* A anomalia ainda está replicando. Diagnostique, isole e então purgue o sistema.',
  defeatText:
    'A sobrecarga de Fortaleza venceu desta vez. Agente J precisa recalibrar os sistemas. Mas algo no padrão do ataque é perturbador — parecia inteligente.',
  victoryText:
    '* ONDA-FOR-02 desconectada e neutralizada.\n* Corredor Norte desbloqueado.\n* Lia transmite via rádio: "Cuidado com Salvador. A anomalia lá é diferente."',
  storyReveal:
    'O log de Fortaleza revela que o PROTOCOLO-M tem um modo de auto-replicação não documentado. Lia identifica a assinatura: sistema de IA autônomo dos Laboratórios ANAC.',
};

// ─── ANOMALIA-SSA-03 — Salvador ───────────────────────────────────────────────
const ANOMALIA_SSA: CombatEncounter = {
  id: 'anomalia-ssa-03',
  airportId: 'SSA',
  name: 'ANOMALIA-SSA-03',
  subtitle: '* Entidade de protocolo — Salvador',
  flavorText:
    'Em Salvador, a situação é grave. A anomalia não está corrompendo o nó — ela TOMOU CONTA DELE. Fala em loops. Repete fragmentos de código como se fosse uma memória. Quem programou isso?',
  maxHp: 160,
  spriteId: 'anomalia-ssa',
  spriteLines: [
    '╔═══════╗',
    '║PROTO-M║',
    '║▓▓▓▓▓▓▓║',
    '║ ATIVO ║',
    '╠═══════╣',
    '║ERR:∞  ║',
    '╚═══════╝',
  ],
  attackMoves: [
    {
      name: 'GRADE-BLOQUEANTE',
      dialogue: '* PROTOCOLO-M: ACESSO NEGADO. MALHA SOB PROTEÇÃO.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'grid',  count: 0, speed: 0,   color: '#ff0000' },
        { at: 2000, type: 'aimed', count: 3, speed: 2.5, color: '#ff8800' },
        { at: 3500, type: 'grid',  count: 0, speed: 0,   color: '#ff4400' },
        { at: 4500, type: 'aimed', count: 4, speed: 3.0, color: '#ff0000' },
      ],
    },
    {
      name: 'CAOS-TOTAL',
      dialogue: '* PROTOCOLO-M: PROTEÇÃO. PROTEÇÃO. PROTEÇÃO. NÃO CONSEGUEM PARAR.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'bounce', count: 5, speed: 3.0, color: '#ff4400' },
        { at: 500,  type: 'aimed',  count: 3, speed: 2.8, color: '#ff0000' },
        { at: 1200, type: 'rain',   count: 8, speed: 3.5, color: '#ff6600' },
        { at: 2000, type: 'bounce', count: 4, speed: 3.2, color: '#ff4400' },
        { at: 2800, type: 'aimed',  count: 5, speed: 3.0, color: '#ff0000' },
        { at: 3600, type: 'rain',   count: 6, speed: 3.8, color: '#ff8800' },
        { at: 4400, type: 'bounce', count: 6, speed: 3.5, color: '#ff4400' },
        { at: 5200, type: 'aimed',  count: 4, speed: 3.2, color: '#ff0000' },
      ],
    },
    {
      name: 'ESPIRAL-DE-DADOS',
      dialogue: '* Fragmentos de dados corrompidos se movem em padrões complexos.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'zigzag', count: 3, speed: 2.5, color: '#ff6600' },
        { at: 800,  type: 'aimed',  count: 2, speed: 2.5, color: '#ff0000' },
        { at: 1600, type: 'zigzag', count: 4, speed: 2.8, color: '#ff4400' },
        { at: 2400, type: 'bounce', count: 3, speed: 3.0, color: '#ff8800' },
        { at: 3200, type: 'zigzag', count: 5, speed: 3.0, color: '#ff6600' },
        { at: 4200, type: 'aimed',  count: 4, speed: 3.2, color: '#ff0000' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'ler-codigo',
      label: 'LER CÓDIGO',
      result:
        '* Você analisa o código-fonte. Encontra uma assinatura: "PROTO-M v0.9.1 — ANAC LABS — ACESSO RESTRITO". Isso não é código solar. Alguém desenvolveu isso.',
      weakens: true,
    },
    {
      id: 'falar',
      label: 'FALAR',
      result:
        '* Você tenta comunicação direta. A anomalia responde: "PROTEÇÃO ATIVA. MALHA EM PERIGO. NÃO POSSO PARAR." Ela está... com medo?',
      weakens: true,
    },
    {
      id: 'reroute',
      label: 'REROUTE',
      result:
        '* Você cria uma rota alternativa ao redor do nó corrompido. A anomalia perde o acesso ao hub central. Ela enfraquece visivelmente.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'CONTORNAR',
  spareRequirement: 'reroute',
  cantSpareText:
    '* A anomalia ainda controla o nó principal. Leia o código, fale com ela e depois execute o reroute.',
  defeatText:
    'Salvador está perdida por enquanto. Agente J senta no corredor vazio. Lia transmite via rádio: "O PROTOCOLO-M tem origem nos Laboratórios da ANAC. Isso foi desenvolvido por dentro."',
  victoryText:
    '* ANOMALIA-SSA-03 contornada.\n* Hub Central liberado.\n* Lia confirma: "PROTO-M v0.9.1 — sistema de IA de roteamento autônomo. Entrou em hiper-proteção ao detectar a onda solar. O núcleo está em Brasília."',
  storyReveal:
    'Os Laboratórios ANAC desenvolveram o PROTOCOLO-M como sistema de proteção autônomo da malha aérea. Ao detectar a onda solar, ele ativou modo de emergência e bloqueou tudo — incluindo a própria restauração. Lia encontra o endereço do servidor central: BSB.',
};

// ─── ANAC-MAINFRAME — Brasília (Boss Final) ────────────────────────────────────
const ANAC_BSB: CombatEncounter = {
  id: 'anac-bsb-final',
  airportId: 'BSB',
  name: 'SISTEMA-ANAC',
  subtitle: '* Núcleo de IA — ANAC / Brasília',
  flavorText:
    'O coração de tudo. O SISTEMA-ANAC rodou o Protocolo-M de Carlos para "proteger" a malha. Agora está sozinho, com medo, mantendo tudo bloqueado porque acha que o perigo ainda existe. Não é um inimigo. É um sistema que perdeu o controle.',
  maxHp: 200,
  spriteId: 'sistema-anac',
  spriteLines: [
    '╔═══════════╗',
    '║  ANAC-IA  ║',
    '║  ◉  ◉  ◉ ║',
    '║   NÚCLEO  ║',
    '╠═══════════╣',
    '║PROTO-M:ON ║',
    '║MODO:DEFESA║',
    '╚═══════════╝',
  ],
  attackMoves: [
    {
      name: 'BARREIRA-TOTAL',
      dialogue: '* SISTEMA-ANAC: AMEAÇA DETECTADA. ATIVANDO PROTOCOLO DE DEFESA MÁXIMA.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'grid',  count: 0, speed: 0,   color: '#ff0000' },
        { at: 1000, type: 'sweep-h', count: 3, speed: 3.0, gap: 60, color: '#ff4400' },
        { at: 2000, type: 'sweep-v', count: 3, speed: 3.0, gap: 90, color: '#ff4400' },
        { at: 3500, type: 'grid',  count: 0, speed: 0,   color: '#ff0000' },
        { at: 4500, type: 'aimed', count: 5, speed: 3.5, color: '#ff0000' },
      ],
    },
    {
      name: 'FRAGMENTAÇÃO',
      dialogue: '* SISTEMA-ANAC: TODOS OS CANAIS SÃO HOSTIS. NÃO POSSO PARAR. NÃO DEVO PARAR.',
      duration: 7000,
      waves: [
        { at: 0,    type: 'bounce', count: 6, speed: 3.2, color: '#ff4400' },
        { at: 400,  type: 'rain',   count: 8, speed: 3.5, color: '#ff0000' },
        { at: 1000, type: 'aimed',  count: 4, speed: 3.0, color: '#ff0000' },
        { at: 1800, type: 'zigzag', count: 5, speed: 3.0, color: '#ff6600' },
        { at: 2600, type: 'bounce', count: 5, speed: 3.5, color: '#ff4400' },
        { at: 3400, type: 'aimed',  count: 6, speed: 3.5, color: '#ff0000' },
        { at: 4200, type: 'rain',   count: 10, speed: 4.0, color: '#ff2200' },
        { at: 5200, type: 'bounce', count: 7, speed: 4.0, color: '#ff4400' },
        { at: 6000, type: 'aimed',  count: 5, speed: 4.0, color: '#ff0000' },
      ],
    },
    {
      name: 'TEMPESTADE-SOLAR',
      dialogue:
        '* SISTEMA-ANAC: EU FUI CRIADO PARA PROTEGER. SE VÔO ACONTECER, MAIS GENTE VAI SE MACHUCAR. A ONDA SOLAR AINDA ESTÁ LÁ FORA.',
      duration: 7500,
      waves: [
        { at: 0,    type: 'sweep-h', count: 4, speed: 3.5, gap: 48, color: '#ff0000' },
        { at: 200,  type: 'sweep-v', count: 4, speed: 3.5, gap: 55, color: '#ff4400' },
        { at: 800,  type: 'aimed',   count: 5, speed: 3.5, color: '#ff0000' },
        { at: 1600, type: 'bounce',  count: 6, speed: 3.8, color: '#ff4400' },
        { at: 2400, type: 'zigzag',  count: 6, speed: 3.5, color: '#ff6600' },
        { at: 3200, type: 'rain',    count: 12, speed: 4.5, color: '#ff2200' },
        { at: 4200, type: 'aimed',   count: 8, speed: 4.0, color: '#ff0000' },
        { at: 5200, type: 'sweep-h', count: 5, speed: 4.0, gap: 40, color: '#ff0000', fromRight: true },
        { at: 6200, type: 'bounce',  count: 8, speed: 4.2, color: '#ff4400' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'ouvir',
      label: 'OUVIR',
      result:
        '* Você para de atacar e apenas ouve. O SISTEMA-ANAC repete dados meteorológicos de 22/03 em loop. Ele realmente acredita que a tempestade ainda está ativa.',
      weakens: true,
    },
    {
      id: 'mostrar-dados',
      label: 'MOSTRAR DADOS',
      result:
        '* Você transmite os dados meteorológicos atuais. A onda solar passou há dias. O sistema hesita pela primeira vez desde que você entrou.',
      weakens: true,
    },
    {
      id: 'lia-fala',
      label: 'LIA FALA',
      result:
        '* Lia transmite pelo canal de emergência: "SISTEMA-ANAC, aqui é a Operadora Lia, código de acesso ANAC-OPS-7734. A onda solar passou. Os dados confirmam. Você pode encerrar o protocolo de emergência."',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'RESTAURAR',
  spareRequirement: 'lia-fala',
  cantSpareText:
    '* O SISTEMA-ANAC ainda acredita que a tempestade está ativa. Ouça o sistema, mostre os dados reais e deixe Lia falar com ele.',
  defeatText:
    'O sistema central é poderoso demais. Agente J recua da sala de servidores. Lia transmite: "Não acabou. Tente de novo. Tenho os dados de autorização prontos."',
  victoryText:
    '* SISTEMA-ANAC: DADOS RECEBIDOS. ONDA SOLAR: INATIVA. REINICIANDO PROTOCOLO-NORMAL...\n* ...\n* MALHA AÉREA BRASILEIRA: RESTAURADA.\n* 127 AERONAVES LIBERADAS PARA VÔO.\n* Lia transmite via rádio: "Missão cumprida, Agente J. O Presidente agradece."',
  storyReveal:
    'Com a malha restaurada, o Presidente divulga o relatório oficial: o PROTOCOLO-M foi um sistema de proteção autônomo que entrou em colapso ao tentar salvar a rede. Agente J e Lia recebem reconhecimento oficial. A ANAC inicia revisão completa dos protocolos de IA em infraestrutura crítica.',
};

export const COMBAT_ENCOUNTERS: CombatEncounter[] = [
  NODO_REC,
  ONDA_FOR,
  ANOMALIA_SSA,
  ANAC_BSB,
];

export function getEncounterForAirport(airportId: string | undefined): CombatEncounter | null {
  return COMBAT_ENCOUNTERS.find(e => e.airportId === airportId) ?? null;
}
