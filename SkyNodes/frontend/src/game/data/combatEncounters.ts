// AeroTale — Combat Encounter Definitions
// Each encounter represents a corrupted network node that must be repaired or defeated.

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
  spriteLines: string[];
  attackMoves: AttackMove[];
  actOptions: ActOption[];
  mercyLabel: string;
  spareRequirement: string;
  cantSpareText: string;
  defeatText: string;
  victoryText: string;
  storyReveal?: string;
}

// ─── NODO-REC-01 — Tutorial ────────────────────────────────────────────────────
const NODO_REC: CombatEncounter = {
  id: 'nodo-rec-01',
  airportId: 'REC',
  name: 'NODO-REC-01',
  subtitle: '* Nó de roteamento corrompido — Recife',
  flavorText:
    'O painel de controle pulsa vermelho. O nó principal de Recife foi infectado pela descarga eletromagnética. Ele está emitindo sinais caóticos na malha.',
  maxHp: 80,
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
  mercyLabel: 'POUPAR',
  spareRequirement: 'reiniciar',
  cantSpareText: '* O nó ainda está emitindo sinais corrompidos. Analise e reinicie primeiro.',
  defeatText:
    'A descarga elétrica atingiu seus instrumentos. Antônio recua. Vai precisar de um backup antes de tentar de novo.',
  victoryText:
    '* NODO-REC-01 reiniciado com sucesso.\n* Rota Recife → João Pessoa desbloqueada.\n* Carlos: "Sabia que conseguia. Essa é a primeira de muitas, Antônio."',
  storyReveal:
    'Carlos examina o log do nó. Seu rosto muda por um instante — como se reconhecesse algo no padrão de corrupção. Ele fecha o terminal antes que Antônio possa ver.',
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
    'A sobrecarga de Fortaleza venceu desta vez. Antônio precisa recalibrar seus equipamentos. Mas algo no padrão do ataque o perturba — parecia inteligente.',
  victoryText:
    '* ONDA-FOR-02 desconectada e neutralizada.\n* Corredor Norte desbloqueado.\n* Uma mensagem anônima chega no terminal de Antônio: "Não vá para Salvador ainda."',
  storyReveal:
    'O log de erro de Fortaleza mostra um timestamp: 03:52 de 22/03/2024 — 5 minutos ANTES da emissão solar oficial. Alguém ligou o protocolo antes da onda chegar.',
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
    'Salvador está perdida por enquanto. Antônio senta no corredor do aeroporto vazio. O que é o Protocolo-M? E por que Carlos não mencionou nada disso?',
  victoryText:
    '* ANOMALIA-SSA-03 contornada.\n* Hub Central liberado.\n* Antônio liga para Carlos: "Que é o Protocolo-M?" Silêncio por 8 segundos. Depois: "Preciso te contar uma coisa."',
  storyReveal:
    'Carlos confessa: há 6 meses, ele desenvolveu um AI de roteamento autônomo para modernizar a malha da ANAC. O "PROTOCOLO-M" foi ativado automaticamente quando detectou a onda solar — e entrou em modo de hiper-proteção, bloqueando tudo. Foi Carlos quem derrubou o sistema.',
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
      id: 'carlos-fala',
      label: 'CARLOS FALA',
      result:
        '* Carlos pega o microfone: "SISTEMA-ANAC, aqui é o Engenheiro Carlos Mendes. Código de autorização: PROTO-M-SHUTDOWN-MENDES-7734. Você pode parar. A tempestade passou."',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'RESTAURAR',
  spareRequirement: 'carlos-fala',
  cantSpareText:
    '* O SISTEMA-ANAC ainda acredita que a tempestade está ativa. Ouça o sistema, mostre os dados reais e deixe Carlos falar com ele.',
  defeatText:
    'O sistema central é poderoso demais. Antônio cai de joelhos na sala de servidores. "Não acabou", Carlos sussurra. "Tente de novo. Desta vez, vou estar ao seu lado."',
  victoryText:
    '* SISTEMA-ANAC: DADOS RECEBIDOS. ONDA SOLAR: INATIVA. REINICIANDO PROTOCOLO-NORMAL...\n* ...\n* MALHA AÉREA BRASILEIRA: RESTAURADA.\n* 127 AERONAVES LIBERADAS PARA VÔO.\n* Carlos apoia a mão no ombro de Antônio: "Obrigado. Por tudo."',
  storyReveal:
    'Com a malha restaurada, Carlos apresenta seu relatório à ANAC. Ele assume total responsabilidade pelo Protocolo-M não autorizado. Antônio escreve uma carta em seu favor. Meses depois, a ANAC aprova oficialmente o Protocolo-M — com as correções de Antônio implementadas.',
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
