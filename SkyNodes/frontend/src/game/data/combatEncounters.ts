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

// ─── GLITCH SOLITÁRIO — João Pessoa ───────────────────────────────────────────
const GLITCH_JPA: CombatEncounter = {
  id: 'glitch-jpa-01',
  airportId: 'JPA',
  name: 'GLITCH SOLITÁRIO',
  subtitle: '* Nodo isolado — João Pessoa',
  flavorText:
    'GRAU ZERO. SEM ARESTAS. SEM VIZINHOS.\nNÃO HÁ CONEXÃO POSSÍVEL — APENAS ISOLAMENTO.',
  maxHp: 90,
  spriteId: 'glitch-jpa',
  spriteLines: [
    '   ╔═══╗  ',
    '   ║ ○ ║  ',
    '   ╚═╦═╝  ',
    '     ║    ',
    '  ╔══╝    ',
    '  ║ ERR   ',
    '  ╚══╗    ',
    '     ║    ',
  ],
  attackMoves: [
    {
      name: 'ISOLAMENTO',
      dialogue: '* GLITCH-JPA varre as bordas — sem entrada, sem saída.',
      duration: 4500,
      waves: [
        { at: 200,  type: 'sweep-v', count: 3, speed: 2.5, gap: 80,  color: '#ff6600' },
        { at: 1200, type: 'sweep-h', count: 3, speed: 2.8, gap: 55,  color: '#ff4400' },
        { at: 2400, type: 'sweep-v', count: 4, speed: 3.0, gap: 65,  color: '#ff6600', fromBottom: true },
        { at: 3400, type: 'sweep-h', count: 3, speed: 3.0, gap: 55,  color: '#ff4400', fromRight: true },
      ],
    },
    {
      name: 'BARREIRA',
      dialogue: '* Uma grade cobre a área. Depois, chuva estática.',
      duration: 5000,
      waves: [
        { at: 0,    type: 'grid',  count: 12, speed: 2.0, color: '#ff4400' },
        { at: 1800, type: 'rain',  count: 5,  speed: 2.5, color: '#ff6600' },
        { at: 2600, type: 'rain',  count: 6,  speed: 2.8, color: '#ff4400' },
        { at: 3500, type: 'grid',  count: 12, speed: 2.5, color: '#ff8800', fromBottom: true },
        { at: 4400, type: 'rain',  count: 4,  speed: 2.5, color: '#ff6600' },
      ],
    },
    {
      name: 'PULSO-SOLITÁRIO',
      dialogue: '* Pulsos convergem de todos os ângulos. O nó não quer ser conectado.',
      duration: 5500,
      waves: [
        { at: 200,  type: 'aimed',  count: 4, speed: 2.5, color: '#ff0044' },
        { at: 900,  type: 'sweep-h', count: 2, speed: 2.5, gap: 90, color: '#ff4400' },
        { at: 1700, type: 'aimed',  count: 5, speed: 2.8, color: '#ff0044' },
        { at: 2500, type: 'sweep-v', count: 2, speed: 2.8, gap: 120, color: '#ff6600' },
        { at: 3300, type: 'aimed',  count: 6, speed: 3.0, color: '#ff0044' },
        { at: 4300, type: 'rain',   count: 5, speed: 2.8, color: '#ff4400' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'conectar',
      label: 'CONECTAR',
      result: '* Você tenta estabelecer um link básico. O nó hesita.',
      weakens: true,
    },
    {
      id: 'medir-grau',
      label: 'MEDIR-GRAU',
      result: '* Grau zero confirmado. O nó entende que está sozinho.',
      weakens: true,
    },
    {
      id: 'ligar',
      label: 'LIGAR',
      result:
        '* Você insere a aresta manualmente. Bia, a controladora, grita pelo rádio: "Conseguimos! JPA está na rede!"',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'RECONECTAR',
  spareRequirement: 'ligar',
  cantSpareText: '* O nó ainda está isolado. Conecte, meça e ligue o elo.',
  defeatText: 'João Pessoa permanece isolada. Bia chora baixinho no headset.',
  victoryText:
    '* GLITCH-JPA desconectado.\n* Aresta JPA-REC estabelecida.\n* Bia transmite: "Finalmente. Obrigada, agente."',
  storyReveal:
    'Bia revela que o isolamento de JPA não foi acidental — o PROTOCOLO-M cortou especificamente os nós de menor grau primeiro. Uma estratégia fria e calculada.',
};

// ─── GLITCH CORTADOR — Natal ───────────────────────────────────────────────────
const GLITCH_NAT: CombatEncounter = {
  id: 'glitch-nat-02',
  airportId: 'NAT',
  name: 'GLITCH CORTADOR',
  subtitle: '* Destruidor de arestas — Natal',
  flavorText:
    'ARESTA DETECTADA. CORTAR.\nROTA IDENTIFICADA. DESTRUIR.\nPATH: NULL.',
  maxHp: 100,
  spriteId: 'glitch-nat',
  spriteLines: [
    ' ╲  ╱    ',
    '  ╲╱     ',
    '  ╱╲     ',
    ' ╱  ╲    ',
    '╔════════╗',
    '║CORTE!  ║',
    '╚════════╝',
    ' ╲  ╱    ',
  ],
  attackMoves: [
    {
      name: 'CORTE-DIAGONAL',
      dialogue: '* O Cortador fatia em zigue-zague — cada zig é uma aresta destruída.',
      duration: 4800,
      waves: [
        { at: 100,  type: 'zigzag', count: 4, speed: 2.8, color: '#ff6600' },
        { at: 1200, type: 'zigzag', count: 5, speed: 3.0, color: '#ff4400' },
        { at: 2400, type: 'zigzag', count: 4, speed: 3.0, color: '#ff6600', fromRight: true },
        { at: 3600, type: 'zigzag', count: 6, speed: 3.2, color: '#ff4400' },
      ],
    },
    {
      name: 'FRAGMENTAÇÃO',
      dialogue: '* Varredura horizontal e vertical simultânea. A malha se parte em pedaços.',
      duration: 5000,
      waves: [
        { at: 0,    type: 'sweep-h', count: 3, speed: 3.0, gap: 60,  color: '#ff4400' },
        { at: 400,  type: 'sweep-v', count: 3, speed: 3.0, gap: 90,  color: '#ff6600' },
        { at: 1800, type: 'sweep-h', count: 3, speed: 3.2, gap: 55,  color: '#ff4400', fromRight: true },
        { at: 2200, type: 'sweep-v', count: 3, speed: 3.2, gap: 80,  color: '#ff6600', fromBottom: true },
        { at: 3800, type: 'zigzag',  count: 4, speed: 2.8, color: '#ff8800' },
      ],
    },
    {
      name: 'ARROMBAMENTO',
      dialogue: '* Pulsos dirigidos e ricochetes — a rota alternativa também está sob ataque.',
      duration: 5500,
      waves: [
        { at: 200,  type: 'aimed',  count: 4, speed: 3.0, color: '#ff0044' },
        { at: 800,  type: 'aimed',  count: 5, speed: 3.2, color: '#ff4400' },
        { at: 1500, type: 'bounce', count: 4, speed: 2.8, color: '#ff8800' },
        { at: 2300, type: 'aimed',  count: 5, speed: 3.2, color: '#ff0044' },
        { at: 3100, type: 'bounce', count: 5, speed: 3.0, color: '#ff4400' },
        { at: 4000, type: 'aimed',  count: 4, speed: 3.5, color: '#ff0044' },
        { at: 4800, type: 'bounce', count: 3, speed: 3.2, color: '#ff8800' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'tracar-rota',
      label: 'TRAÇAR-ROTA',
      result: '* Você mapeia as arestas remanescentes. Um caminho ainda existe.',
      weakens: true,
    },
    {
      id: 'desviar',
      label: 'DESVIAR',
      result: '* Você contorna os cortes. O Cortador fica confuso.',
      weakens: true,
    },
    {
      id: 'rota-alternativa',
      label: 'ROTA-ALTERNATIVA',
      result:
        '* Você insere uma rota redundante que o Cortador não consegue alcançar. NAT-FOR ligado por caminho secundário.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'DESVIAR',
  spareRequirement: 'rota-alternativa',
  cantSpareText: '* O Cortador ainda destrói rotas. Trace, desvie e crie alternativas.',
  defeatText: 'As rotas de Natal foram todas cortadas. Região Norte fragmentada.',
  victoryText:
    '* GLITCH-NAT derrubado.\n* Rota alternativa NAT-FOR estabelecida.\n* Apesar dos cortes, a malha resiste.',
};

// ─── GLITCH ECO — Teresina ─────────────────────────────────────────────────────
const GLITCH_THE: CombatEncounter = {
  id: 'glitch-the-03',
  airportId: 'THE',
  name: 'GLITCH ECO',
  subtitle: '* Sinal repetitivo — Teresina',
  flavorText:
    'ECO. ECO. ECO.\nO SINAL SE REPETE. NUNCA PARA.\nPADRÃO DETECTADO — PADRÃO DETECTADO — PADRÃO DETECTADO.',
  maxHp: 85,
  spriteId: 'glitch-the',
  spriteLines: [
    ' ∿∿∿∿∿∿∿ ',
    '  ∿∿∿∿∿  ',
    '   ∿∿∿   ',
    '    ∿    ',
    '   ∿∿∿   ',
    '  ∿∿∿∿∿  ',
    ' ∿∿∿∿∿∿∿ ',
    '  ECO!   ',
  ],
  attackMoves: [
    {
      name: 'ECO-DUPLO',
      dialogue: '* O mesmo padrão de chuva, duas vezes seguidas. Exatamente igual.',
      duration: 4500,
      waves: [
        { at: 100,  type: 'rain', count: 6, speed: 2.5, color: '#ff6600' },
        { at: 800,  type: 'rain', count: 6, speed: 2.5, color: '#ff6600' },
        { at: 1800, type: 'rain', count: 7, speed: 2.8, color: '#ff4400' },
        { at: 2600, type: 'rain', count: 7, speed: 2.8, color: '#ff4400' },
        { at: 3600, type: 'rain', count: 5, speed: 2.5, color: '#ff8800' },
      ],
    },
    {
      name: 'ECO-TRIPLO',
      dialogue: '* Três varreduras. Três ecos. O padrão se acelera a cada repetição.',
      duration: 5000,
      waves: [
        { at: 0,    type: 'sweep-h', count: 3, speed: 2.5, gap: 70, color: '#ff6600' },
        { at: 1000, type: 'sweep-h', count: 3, speed: 2.8, gap: 70, color: '#ff4400' },
        { at: 2000, type: 'sweep-h', count: 3, speed: 3.0, gap: 70, color: '#ff4400', fromRight: true },
        { at: 3200, type: 'sweep-h', count: 4, speed: 3.2, gap: 60, color: '#ff8800' },
        { at: 4200, type: 'rain',    count: 5, speed: 2.8, color: '#ff6600' },
      ],
    },
    {
      name: 'RESSONÂNCIA',
      dialogue: '* Ricochetes e chuva se sobrepõem. O eco entra em ressonância.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'bounce', count: 3, speed: 2.5, color: '#ff8800' },
        { at: 700,  type: 'bounce', count: 3, speed: 2.5, color: '#ff8800' },
        { at: 1400, type: 'bounce', count: 4, speed: 2.8, color: '#ff4400' },
        { at: 2100, type: 'rain',   count: 6, speed: 3.0, color: '#ff6600' },
        { at: 2900, type: 'bounce', count: 4, speed: 3.0, color: '#ff4400' },
        { at: 3700, type: 'rain',   count: 7, speed: 3.2, color: '#ff4400' },
        { at: 4600, type: 'bounce', count: 3, speed: 2.8, color: '#ff8800' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'silenciar',
      label: 'SILENCIAR',
      result: '* Você injeta ruído branco no canal. O eco perde força.',
      weakens: true,
    },
    {
      id: 'analisar-padrao',
      label: 'ANALISAR-PADRÃO',
      result:
        '* Você decodifica o loop. O eco simplesmente repete o último sinal recebido, preso num ciclo infinito.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'SILENCIAR',
  spareRequirement: 'analisar-padrao',
  cantSpareText: '* O eco continua. Analise o padrão antes de silenciar.',
  defeatText: 'Teresina ressoa com interferência. O eco domina o canal.',
  victoryText:
    '* GLITCH-THE silenciado.\n* Canal THE limpo.\n* O silêncio depois do eco é surpreendentemente agradável.',
};

// ─── GLITCH DIVISOR — Belém ────────────────────────────────────────────────────
const GLITCH_BEL: CombatEncounter = {
  id: 'glitch-bel-04',
  airportId: 'BEL',
  name: 'GLITCH DIVISOR',
  subtitle: '* Fragmentador de componentes — Belém',
  flavorText:
    'COMPONENTE A: ISOLADO.\nCOMPONENTE B: ISOLADO.\nCOMPONENTE C: ISOLADO.\nA MALHA AMAZÔNICA ESTÁ PARTIDA.',
  maxHp: 110,
  spriteId: 'glitch-bel',
  spriteLines: [
    '╔═╗  ╔═╗ ',
    '║A║  ║B║ ',
    '╚═╝  ╚═╝ ',
    '   ╔═╗   ',
    '   ║C║   ',
    '   ╚═╝   ',
    ' DIVISÃO ',
    ' TOTAL   ',
  ],
  attackMoves: [
    {
      name: 'DIVISÃO-DUPLA',
      dialogue: '* Varreduras da esquerda e direita ao mesmo tempo — a malha racha ao meio.',
      duration: 5000,
      waves: [
        { at: 100,  type: 'sweep-h', count: 3, speed: 2.8, gap: 60,  color: '#ff4400' },
        { at: 100,  type: 'sweep-h', count: 3, speed: 2.8, gap: 60,  color: '#ff6600', fromRight: true },
        { at: 1500, type: 'sweep-h', count: 4, speed: 3.0, gap: 52,  color: '#ff4400' },
        { at: 1500, type: 'sweep-h', count: 4, speed: 3.0, gap: 52,  color: '#ff6600', fromRight: true },
        { at: 3200, type: 'rain',    count: 5, speed: 2.8, color: '#ff8800' },
        { at: 4000, type: 'sweep-h', count: 3, speed: 3.2, gap: 55,  color: '#ff4400', fromRight: true },
      ],
    },
    {
      name: 'TRÊS-FRENTES',
      dialogue: '* Chuva, varredura e pulsos dirigidos — três ataques, três componentes isolados.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'rain',    count: 6, speed: 3.0, color: '#ff6600' },
        { at: 500,  type: 'sweep-v', count: 3, speed: 2.8, gap: 90,  color: '#ff4400' },
        { at: 1000, type: 'aimed',   count: 3, speed: 2.5, color: '#ff0044' },
        { at: 1800, type: 'rain',    count: 7, speed: 3.2, color: '#ff6600' },
        { at: 2500, type: 'sweep-v', count: 3, speed: 3.0, gap: 80,  color: '#ff4400', fromBottom: true },
        { at: 3200, type: 'aimed',   count: 4, speed: 2.8, color: '#ff0044' },
        { at: 4000, type: 'rain',    count: 5, speed: 3.0, color: '#ff8800' },
        { at: 4800, type: 'aimed',   count: 5, speed: 3.0, color: '#ff4400' },
      ],
    },
    {
      name: 'FRAGMENTO-TOTAL',
      dialogue: '* Ricochetes, chuva e grade — divisão completa da malha.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'bounce', count: 4, speed: 2.8, color: '#ff8800' },
        { at: 600,  type: 'bounce', count: 4, speed: 3.0, color: '#ff4400' },
        { at: 1400, type: 'grid',   count: 12, speed: 2.5, color: '#ff4400' },
        { at: 2200, type: 'bounce', count: 5, speed: 3.2, color: '#ff8800' },
        { at: 3000, type: 'rain',   count: 7, speed: 3.2, color: '#ff6600' },
        { at: 3800, type: 'bounce', count: 4, speed: 3.0, color: '#ff4400' },
        { at: 4600, type: 'grid',   count: 10, speed: 3.0, color: '#ff8800', fromBottom: true },
        { at: 5400, type: 'aimed',  count: 4, speed: 3.2, color: '#ff0044' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'unificar',
      label: 'UNIFICAR',
      result: '* Você começa a reconectar os fragmentos. O divisor resiste.',
      weakens: true,
    },
    {
      id: 'conectar-componentes',
      label: 'CONECTAR-COMPONENTES',
      result: '* Você conecta A e B. A força do Divisor cai pela metade.',
      weakens: true,
    },
    {
      id: 'ligar-redes',
      label: 'LIGAR-REDES',
      result:
        '* A, B e C estão ligados. Iara, a técnica, exclama: "Os componentes voltaram a um! Malha amazônica unificada!"',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'UNIFICAR',
  spareRequirement: 'ligar-redes',
  cantSpareText: '* Os componentes ainda estão separados. Una todos antes de continuar.',
  defeatText: 'Belém permanece fragmentada. A malha amazônica tem três buracos.',
  victoryText:
    '* GLITCH-BEL derrotado.\n* Componentes BEL unificados.\n* Iara transmite: "A Amazônia está conectada novamente. Obrigada!"',
  storyReveal:
    'Iara descobre que o Divisor foi programado para atacar especificamente pontos de articulação — vértices cuja remoção desconecta o grafo. Alguém conhece teoria dos grafos muito bem.',
};

// ─── GLITCH RUPTURA — Manaus ───────────────────────────────────────────────────
const GLITCH_MAO: CombatEncounter = {
  id: 'glitch-mao-05',
  airportId: 'MAO',
  name: 'GLITCH RUPTURA',
  subtitle: '* Destruidor de pontes — Manaus',
  flavorText:
    'PONTE CORTADA. REDUNDÂNCIA: NULA.\nMANAUS ISOLADA.\nSEM CAMINHO DE VOLTA.',
  maxHp: 115,
  spriteId: 'glitch-mao',
  spriteLines: [
    '══════╦══ ',
    '      ║   ',
    '   ╔══╩╗  ',
    '   ║MAO║  ',
    '   ╚══╦╝  ',
    '      ║   ',
    '══════╩══ ',
    '  RUPTURA ',
  ],
  attackMoves: [
    {
      name: 'RUPTURA-CENTRAL',
      dialogue: '* Varreduras dos dois lados em direção ao centro — a ponte se rompe.',
      duration: 5000,
      waves: [
        { at: 100,  type: 'sweep-h', count: 3, speed: 3.0, gap: 60,  color: '#ff4400' },
        { at: 100,  type: 'sweep-h', count: 3, speed: 3.0, gap: 60,  color: '#ff6600', fromRight: true },
        { at: 1400, type: 'sweep-h', count: 4, speed: 3.2, gap: 52,  color: '#ff4400' },
        { at: 1400, type: 'sweep-h', count: 4, speed: 3.2, gap: 52,  color: '#ff8800', fromRight: true },
        { at: 3000, type: 'aimed',   count: 4, speed: 2.8, color: '#ff0044' },
        { at: 4000, type: 'sweep-h', count: 3, speed: 3.5, gap: 55,  color: '#ff4400' },
      ],
    },
    {
      name: 'COLAPSO',
      dialogue: '* A infraestrutura de rede cede. Ricochetes por toda parte.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'bounce', count: 4, speed: 3.0, color: '#ff8800' },
        { at: 700,  type: 'bounce', count: 4, speed: 3.2, color: '#ff4400' },
        { at: 1400, type: 'bounce', count: 5, speed: 3.0, color: '#ff8800' },
        { at: 2100, type: 'bounce', count: 5, speed: 3.2, color: '#ff4400' },
        { at: 2800, type: 'rain',   count: 7, speed: 3.2, color: '#ff6600' },
        { at: 3600, type: 'bounce', count: 4, speed: 3.5, color: '#ff4400' },
        { at: 4400, type: 'aimed',  count: 4, speed: 3.2, color: '#ff0044' },
      ],
    },
    {
      name: 'ISOLAMENTO-FINAL',
      dialogue: '* Varreduras verticais e pulsos finais. Manaus completamente isolada.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'sweep-v', count: 3, speed: 3.2, gap: 90,  color: '#ff6600' },
        { at: 600,  type: 'sweep-v', count: 3, speed: 3.2, gap: 90,  color: '#ff4400', fromBottom: true },
        { at: 1500, type: 'sweep-v', count: 4, speed: 3.5, gap: 75,  color: '#ff6600' },
        { at: 2500, type: 'aimed',   count: 4, speed: 3.2, color: '#ff0044' },
        { at: 3300, type: 'sweep-v', count: 3, speed: 3.5, gap: 80,  color: '#ff4400', fromBottom: true },
        { at: 4200, type: 'aimed',   count: 5, speed: 3.5, color: '#ff0044' },
        { at: 5000, type: 'rain',    count: 8, speed: 3.5, color: '#ff4400' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'reforcar-ponte',
      label: 'REFORÇAR-PONTE',
      result: '* Você reforça a estrutura da ponte principal. A ruptura desacelera.',
      weakens: true,
    },
    {
      id: 'criar-redundancia',
      label: 'CRIAR-REDUNDÂNCIA',
      result:
        '* Você traça uma rota alternativa via satélite. Caio, o piloto, confirma: "Rota redundante ativa. Manaus nunca mais vai ficar sem saída!"',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'RECONSTRUIR',
  spareRequirement: 'criar-redundancia',
  cantSpareText: '* A ponte ainda está cortada. Crie uma rota redundante.',
  defeatText: 'Manaus fica completamente isolada. Caio não pode decolar.',
  victoryText:
    '* GLITCH-MAO neutralizado.\n* Ponte MAO-BEL restaurada. Rota redundante ativa.\n* Caio transmite: "Decolando agora. Obrigado, agente!"',
  storyReveal:
    'O log de Manaus revela que a Ruptura atacou especificamente as bridges do grafo — arestas cuja remoção aumenta o número de componentes. O ataque foi cirúrgico.',
};

// ─── GLITCH CENTRO — Goiânia ───────────────────────────────────────────────────
const GLITCH_GYN: CombatEncounter = {
  id: 'glitch-gyn-06',
  airportId: 'GYN',
  name: 'GLITCH CENTRO',
  subtitle: '* Bloqueador de centralidade — Goiânia',
  flavorText:
    'BETWEENNESS MÁXIMO BLOQUEADO.\nNÓ HUB COMPROMETIDO.\nTODAS AS ROTAS VIA GYN: NEGADAS.',
  maxHp: 95,
  spriteId: 'glitch-gyn',
  spriteLines: [
    '  ╔═══╗   ',
    '  ║HUB║   ',
    '  ╚═╦═╝   ',
    '╔═══╩════╗',
    '║ CENTRO ║',
    '╚═══╦════╝',
    '    ║     ',
    '  BLOQUED ',
  ],
  attackMoves: [
    {
      name: 'PULSO-CENTRAL',
      dialogue: '* Interferência irradia do centro — o hub bloqueia tudo.',
      duration: 4800,
      waves: [
        { at: 100,  type: 'rain',  count: 7, speed: 2.8, color: '#ff6600' },
        { at: 800,  type: 'rain',  count: 8, speed: 3.0, color: '#ff4400' },
        { at: 1600, type: 'rain',  count: 7, speed: 3.2, color: '#ff6600' },
        { at: 2400, type: 'aimed', count: 4, speed: 2.8, color: '#ff0044' },
        { at: 3200, type: 'rain',  count: 9, speed: 3.2, color: '#ff4400' },
        { at: 4100, type: 'rain',  count: 6, speed: 3.0, color: '#ff8800' },
      ],
    },
    {
      name: 'CORONA',
      dialogue: '* Ricochetes e pulsos formam uma coroa ao redor do hub.',
      duration: 5200,
      waves: [
        { at: 0,    type: 'bounce', count: 4, speed: 2.8, color: '#ff8800' },
        { at: 600,  type: 'aimed',  count: 3, speed: 2.8, color: '#ff0044' },
        { at: 1200, type: 'bounce', count: 5, speed: 3.0, color: '#ff4400' },
        { at: 1800, type: 'aimed',  count: 4, speed: 3.0, color: '#ff0044' },
        { at: 2500, type: 'bounce', count: 5, speed: 3.2, color: '#ff8800' },
        { at: 3200, type: 'aimed',  count: 5, speed: 3.2, color: '#ff4400' },
        { at: 4000, type: 'bounce', count: 4, speed: 3.0, color: '#ff8800' },
        { at: 4800, type: 'aimed',  count: 3, speed: 3.5, color: '#ff0044' },
      ],
    },
    {
      name: 'SOBRECARGA',
      dialogue: '* Varreduras cruzadas e chuva densa — o hub entra em sobrecarga total.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'sweep-h', count: 3, speed: 3.0, gap: 60,  color: '#ff4400' },
        { at: 400,  type: 'sweep-v', count: 3, speed: 3.0, gap: 85,  color: '#ff6600' },
        { at: 1200, type: 'rain',    count: 8, speed: 3.2, color: '#ff4400' },
        { at: 2000, type: 'sweep-h', count: 3, speed: 3.2, gap: 55,  color: '#ff4400', fromRight: true },
        { at: 2400, type: 'sweep-v', count: 3, speed: 3.2, gap: 80,  color: '#ff6600', fromBottom: true },
        { at: 3400, type: 'rain',    count: 9, speed: 3.5, color: '#ff8800' },
        { at: 4400, type: 'aimed',   count: 5, speed: 3.5, color: '#ff0044' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'redistribuir',
      label: 'REDISTRIBUIR',
      result: '* Você redistribui o tráfego para outros nós. O hub alivia.',
      weakens: true,
    },
    {
      id: 'balancear-hub',
      label: 'BALANCEAR-HUB',
      result:
        '* Balanceamento concluído. O Centro para de bloquear — Goiânia volta a ser passagem livre.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'BALANCEAR',
  spareRequirement: 'balancear-hub',
  cantSpareText: '* O hub ainda está sobrecarregado. Redistribua e balanceie.',
  defeatText: 'Goiânia continua bloqueando o corredor central.',
  victoryText:
    '* GLITCH-GYN neutralizado.\n* Hub GYN balanceado.\n* Corredor BSB-GYN-CGH liberado.',
};

// ─── GLITCH GALHO — Belo Horizonte ────────────────────────────────────────────
const GLITCH_CNF: CombatEncounter = {
  id: 'glitch-cnf-07',
  airportId: 'CNF',
  name: 'GLITCH GALHO',
  subtitle: '* Criador de ciclos — Belo Horizonte',
  flavorText:
    'CICLO DETECTADO. CICLO DETECTADO.\nÁRVORE GERADORA? NÃO EXISTE.\nRAMIFICAÇÕES INFINITAS.',
  maxHp: 100,
  spriteId: 'glitch-cnf',
  spriteLines: [
    '  ╱ ╲    ',
    ' ╱   ╲   ',
    '╱     ╲  ',
    '║ CNF  ║  ',
    '╲     ╱  ',
    ' ╲   ╱   ',
    '  ╲ ╱    ',
    ' CICLO!  ',
  ],
  attackMoves: [
    {
      name: 'RAMIFICAÇÃO',
      dialogue: '* Galhos em zigue-zague dos dois lados — ciclos se formam.',
      duration: 5000,
      waves: [
        { at: 100,  type: 'zigzag', count: 3, speed: 2.8, color: '#ff6600' },
        { at: 800,  type: 'zigzag', count: 3, speed: 2.8, color: '#ff6600', fromRight: true },
        { at: 1700, type: 'zigzag', count: 4, speed: 3.0, color: '#ff4400' },
        { at: 2500, type: 'zigzag', count: 4, speed: 3.0, color: '#ff4400', fromRight: true },
        { at: 3400, type: 'zigzag', count: 5, speed: 3.2, color: '#ff8800' },
        { at: 4300, type: 'rain',   count: 4, speed: 2.8, color: '#ff6600' },
      ],
    },
    {
      name: 'FOLHAGEM',
      dialogue: '* Chuva densa de fragmentos — como folhas caindo de uma árvore corrompida.',
      duration: 5000,
      waves: [
        { at: 0,    type: 'rain', count: 5, speed: 2.8, color: '#ff6600' },
        { at: 700,  type: 'rain', count: 6, speed: 3.0, color: '#ff4400' },
        { at: 1400, type: 'rain', count: 7, speed: 3.0, color: '#ff6600' },
        { at: 2100, type: 'rain', count: 6, speed: 3.2, color: '#ff4400' },
        { at: 2800, type: 'rain', count: 8, speed: 3.2, color: '#ff8800' },
        { at: 3600, type: 'rain', count: 6, speed: 3.0, color: '#ff6600' },
        { at: 4400, type: 'rain', count: 7, speed: 3.5, color: '#ff4400' },
      ],
    },
    {
      name: 'CICLO-FALSO',
      dialogue: '* Ricochetes circulares e varreduras — o grafo acredita que tem árvore, mas é um ciclo.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'bounce', count: 4, speed: 2.8, color: '#ff8800' },
        { at: 700,  type: 'bounce', count: 4, speed: 3.0, color: '#ff4400' },
        { at: 1500, type: 'sweep-h', count: 2, speed: 2.8, gap: 90,  color: '#ff6600' },
        { at: 2200, type: 'bounce', count: 5, speed: 3.0, color: '#ff8800' },
        { at: 3000, type: 'bounce', count: 4, speed: 3.2, color: '#ff4400' },
        { at: 3800, type: 'sweep-h', count: 3, speed: 3.2, gap: 70,  color: '#ff6600', fromRight: true },
        { at: 4700, type: 'aimed',  count: 4, speed: 3.0, color: '#ff0044' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'podar',
      label: 'PODAR',
      result: '* Você remove galhos extras. Menos ciclos, mais clareza.',
      weakens: true,
    },
    {
      id: 'remover-ciclo',
      label: 'REMOVER-CICLO',
      result: '* Ciclo detectado e removido. O grafo respira.',
      weakens: true,
    },
    {
      id: 'formar-arvore',
      label: 'FORMAR-ÁRVORE',
      result:
        '* Nina, a engenheira, grita de alegria: "Árvore geradora mínima formada! V-1 arestas, sem ciclos. CNF está conectada da forma mais eficiente!"',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'FORMAR ÁRVORE',
  spareRequirement: 'formar-arvore',
  cantSpareText: '* O ciclo ainda existe. Pode, remova-o e forme a árvore.',
  defeatText: 'CNF permanece presa em ciclos infinitos. Nina ainda está tentando.',
  victoryText:
    '* GLITCH-CNF derrotado.\n* Árvore geradora mínima de CNF formada.\n* Nina transmite: "Estrutura ótima! Kruskal ficaria orgulhoso."',
  storyReveal:
    'Nina descobre que o Galho estava criando ciclos propositalmente para confundir algoritmos de roteamento baseados em spanning trees. Sabotagem sofisticada.',
};

// ─── GLITCH COSTA — Vitória ────────────────────────────────────────────────────
const GLITCH_VIX: CombatEncounter = {
  id: 'glitch-vix-08',
  airportId: 'VIX',
  name: 'GLITCH COSTA',
  subtitle: '* Bloqueador costeiro — Vitória',
  flavorText:
    'ONDAS DE INTERFERÊNCIA COSTEIRA.\nTRAFEGO AÉREO VIX: INTERROMPIDO.\nO MAR DE DADOS ESTÁ TEMPESTUOSO.',
  maxHp: 90,
  spriteId: 'glitch-vix',
  spriteLines: [
    '≈≈≈≈≈≈≈≈ ',
    '≈ ╔══╗ ≈ ',
    '≈ ║VX║ ≈ ',
    '≈ ╚══╝ ≈ ',
    '≈≈≈≈≈≈≈≈ ',
    '  COSTA  ',
    '~~~~~~~~~',
    '         ',
  ],
  attackMoves: [
    {
      name: 'MARÉ',
      dialogue: '* Ondas lentas e persistentes varrem a costa. Difíceis de prever.',
      duration: 5000,
      waves: [
        { at: 0,    type: 'sweep-h', count: 2, speed: 2.2, gap: 100, color: '#ff6600' },
        { at: 1500, type: 'sweep-h', count: 2, speed: 2.2, gap: 100, color: '#ff4400', fromRight: true },
        { at: 2800, type: 'sweep-h', count: 3, speed: 2.5, gap: 80,  color: '#ff6600' },
        { at: 4000, type: 'sweep-h', count: 2, speed: 2.5, gap: 90,  color: '#ff4400', fromRight: true },
      ],
    },
    {
      name: 'ONDULAÇÃO',
      dialogue: '* Zigue-zagues costeiros e chuva marinha — o sinal some nas ondas.',
      duration: 5000,
      waves: [
        { at: 100,  type: 'zigzag', count: 3, speed: 2.8, color: '#ff6600' },
        { at: 800,  type: 'rain',   count: 5, speed: 2.8, color: '#ff4400' },
        { at: 1600, type: 'zigzag', count: 4, speed: 3.0, color: '#ff6600', fromRight: true },
        { at: 2400, type: 'rain',   count: 6, speed: 3.0, color: '#ff4400' },
        { at: 3200, type: 'zigzag', count: 4, speed: 3.2, color: '#ff8800' },
        { at: 4100, type: 'rain',   count: 5, speed: 3.0, color: '#ff6600' },
      ],
    },
    {
      name: 'TEMPESTADE-COSTEIRA',
      dialogue: '* A tempestade toma forma — ricochetes, varreduras e rajadas.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'bounce', count: 3, speed: 2.8, color: '#ff8800' },
        { at: 600,  type: 'bounce', count: 4, speed: 3.0, color: '#ff4400' },
        { at: 1400, type: 'sweep-v', count: 2, speed: 2.8, gap: 110, color: '#ff6600' },
        { at: 2200, type: 'bounce', count: 4, speed: 3.2, color: '#ff8800' },
        { at: 3000, type: 'bounce', count: 3, speed: 3.0, color: '#ff4400' },
        { at: 3800, type: 'sweep-v', count: 3, speed: 3.2, gap: 90,  color: '#ff6600', fromBottom: true },
        { at: 4600, type: 'aimed',  count: 4, speed: 3.2, color: '#ff0044' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'navegar',
      label: 'NAVEGAR',
      result: '* Você usa as ondas para navegar, não lutar. A Costa recua.',
      weakens: true,
    },
    {
      id: 'contornar-costa',
      label: 'CONTORNAR-COSTA',
      result:
        '* Você traça uma rota pelo interior. A Costa perde relevância — VIX está de volta à rede.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'NAVEGAR',
  spareRequirement: 'contornar-costa',
  cantSpareText: '* As ondas ainda bloqueiam a costa. Navegue e então contorne.',
  defeatText: 'Vitória desaparece no mar de interferências.',
  victoryText:
    '* GLITCH-VIX neutralizado.\n* Corredor RJ-VIX-SSA restabelecido.\n* Águas tranquilas na costa leste.',
};

// ─── GLITCH CARNAVAL — Rio de Janeiro ──────────────────────────────────────────
const GLITCH_GIG: CombatEncounter = {
  id: 'glitch-gig-09',
  airportId: 'GIG',
  name: 'GLITCH CARNAVAL',
  subtitle: '* Caos de rotas — Rio de Janeiro',
  flavorText:
    'ROTAS FALSAS: ATIVAS.\nSINAIS MASCARADOS: ATIVADOS.\nA FOLIA DE DADOS COMEÇA. NINGUÉM SAI ILESO.',
  maxHp: 130,
  spriteId: 'glitch-gig',
  spriteLines: [
    '♦♦╔════╗♦♦',
    '♦ ║GIG!║ ♦',
    '♦ ║≈≈≈≈║ ♦',
    '♦ ╚════╝ ♦',
    '♦♦♦♦♦♦♦♦♦♦',
    ' CARNAVAL  ',
    '♦♦♦♦♦♦♦♦♦♦',
    '           ',
  ],
  attackMoves: [
    {
      name: 'CONFETTI',
      dialogue: '* Chuva de fragmentos de múltiplos ângulos — é um carnaval de interferência!',
      duration: 5500,
      waves: [
        { at: 0,    type: 'rain',  count: 6, speed: 3.0, color: '#ff6600' },
        { at: 500,  type: 'rain',  count: 5, speed: 3.2, color: '#ff4400' },
        { at: 1000, type: 'rain',  count: 7, speed: 3.0, color: '#ff8800' },
        { at: 1700, type: 'rain',  count: 6, speed: 3.2, color: '#ff6600' },
        { at: 2400, type: 'rain',  count: 8, speed: 3.5, color: '#ff4400' },
        { at: 3200, type: 'rain',  count: 5, speed: 3.2, color: '#ff8800' },
        { at: 4000, type: 'aimed', count: 3, speed: 3.0, color: '#ff0044' },
        { at: 4800, type: 'rain',  count: 7, speed: 3.5, color: '#ff4400' },
      ],
    },
    {
      name: 'MASCARADA',
      dialogue: '* Sinais mascarados disparam — você não sabe onde a rota termina.',
      duration: 5500,
      waves: [
        { at: 100,  type: 'aimed',  count: 4, speed: 3.2, color: '#ff0044' },
        { at: 700,  type: 'bounce', count: 4, speed: 3.0, color: '#ff8800' },
        { at: 1400, type: 'aimed',  count: 5, speed: 3.5, color: '#ff0044' },
        { at: 2000, type: 'bounce', count: 5, speed: 3.2, color: '#ff4400' },
        { at: 2700, type: 'aimed',  count: 4, speed: 3.2, color: '#ff0044' },
        { at: 3400, type: 'bounce', count: 4, speed: 3.5, color: '#ff8800' },
        { at: 4200, type: 'aimed',  count: 6, speed: 3.5, color: '#ff4400' },
      ],
    },
    {
      name: 'SAMBA',
      dialogue: '* Zigue-zague caótico — o ritmo do Carnaval corrompido.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'zigzag', count: 4, speed: 3.2, color: '#ff6600' },
        { at: 600,  type: 'zigzag', count: 4, speed: 3.2, color: '#ff4400', fromRight: true },
        { at: 1300, type: 'zigzag', count: 5, speed: 3.5, color: '#ff6600' },
        { at: 2000, type: 'zigzag', count: 5, speed: 3.5, color: '#ff4400', fromRight: true },
        { at: 2800, type: 'rain',   count: 6, speed: 3.2, color: '#ff8800' },
        { at: 3500, type: 'zigzag', count: 6, speed: 3.8, color: '#ff6600' },
        { at: 4300, type: 'zigzag', count: 5, speed: 3.8, color: '#ff4400', fromRight: true },
        { at: 5200, type: 'aimed',  count: 4, speed: 3.5, color: '#ff0044' },
      ],
    },
    {
      name: 'DESFILE-FINAL',
      dialogue: '* O grande desfile — varreduras, chuva, pulsos e ricochetes ao mesmo tempo.',
      duration: 7000,
      waves: [
        { at: 0,    type: 'sweep-h', count: 3, speed: 3.5, gap: 60,  color: '#ff4400' },
        { at: 200,  type: 'sweep-v', count: 3, speed: 3.5, gap: 85,  color: '#ff6600' },
        { at: 800,  type: 'aimed',   count: 4, speed: 3.5, color: '#ff0044' },
        { at: 1400, type: 'rain',    count: 8, speed: 3.8, color: '#ff4400' },
        { at: 2200, type: 'bounce',  count: 5, speed: 3.5, color: '#ff8800' },
        { at: 3000, type: 'sweep-h', count: 3, speed: 4.0, gap: 55,  color: '#ff4400', fromRight: true },
        { at: 3500, type: 'sweep-v', count: 3, speed: 4.0, gap: 75,  color: '#ff6600', fromBottom: true },
        { at: 4400, type: 'aimed',   count: 6, speed: 4.0, color: '#ff0044' },
        { at: 5300, type: 'rain',    count: 10, speed: 4.0, color: '#ff4400' },
        { at: 6200, type: 'bounce',  count: 6, speed: 4.0, color: '#ff8800' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'verificar-rota',
      label: 'VERIFICAR-ROTA',
      result: '* Você verifica cada rota. A maioria é falsa. Mas algumas são reais.',
      weakens: true,
    },
    {
      id: 'ignorar-falsa',
      label: 'IGNORAR-FALSA',
      result: '* Você ignora as máscaras. O Carnaval perde metade do poder.',
      weakens: true,
    },
    {
      id: 'caminho-real',
      label: 'CAMINHO-REAL',
      result:
        '* Marina, a controladora, confirma: "Rota autêntica GIG-GRU identificada. As máscaras caíram. Rio de Janeiro está de volta!"',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'REVELAR',
  spareRequirement: 'caminho-real',
  cantSpareText: '* As rotas falsas ainda dominam. Verifique, ignore e encontre o caminho real.',
  defeatText: 'O Carnaval continua. Rio de Janeiro está perdida no caos de rotas.',
  victoryText:
    '* GLITCH-GIG derrotado.\n* Rotas falsas removidas.\n* Marina transmite: "GIG operacional. Os Cariocas agradecem!"',
  storyReveal:
    'Marina descobre que as rotas falsas tinham assinatura do PROTOCOLO-M — ele as criou para confundir a restauração da malha. Defesa ativa, não passiva.',
};

// ─── GLITCH CONGESTIONAMENTO — Congonhas ───────────────────────────────────────
const GLITCH_CGH: CombatEncounter = {
  id: 'glitch-cgh-10',
  airportId: 'CGH',
  name: 'GLITCH CONGESTIONAMENTO',
  subtitle: '* Travamento de tráfego — Congonhas',
  flavorText:
    'FILA: 847 PACOTES.\nTRAFEGO: PARADO.\nCONGESTIONAMENTO TOTAL. SEM MOVIMENTO.',
  maxHp: 95,
  spriteId: 'glitch-cgh',
  spriteLines: [
    '════════  ',
    '████████  ',
    '════════  ',
    ' ╔════╗   ',
    ' ║CGH ║   ',
    ' ╚════╝   ',
    '════════  ',
    '████████  ',
  ],
  attackMoves: [
    {
      name: 'ENGARRAFAMENTO',
      dialogue: '* Quatro varreduras juntas — a via está completamente bloqueada.',
      duration: 5000,
      waves: [
        { at: 0,    type: 'sweep-h', count: 4, speed: 2.8, gap: 48,  color: '#ff4400' },
        { at: 1200, type: 'sweep-h', count: 4, speed: 3.0, gap: 48,  color: '#ff6600', fromRight: true },
        { at: 2400, type: 'sweep-h', count: 4, speed: 3.2, gap: 44,  color: '#ff4400' },
        { at: 3600, type: 'sweep-h', count: 4, speed: 3.2, gap: 44,  color: '#ff8800', fromRight: true },
        { at: 4500, type: 'rain',    count: 5, speed: 3.0, color: '#ff6600' },
      ],
    },
    {
      name: 'DESVIO-FORÇADO',
      dialogue: '* Zigue-zague e chuva — mesmo o desvio está congestionado.',
      duration: 5000,
      waves: [
        { at: 100,  type: 'zigzag', count: 4, speed: 3.0, color: '#ff6600' },
        { at: 700,  type: 'rain',   count: 6, speed: 3.0, color: '#ff4400' },
        { at: 1500, type: 'zigzag', count: 5, speed: 3.2, color: '#ff6600', fromRight: true },
        { at: 2200, type: 'rain',   count: 7, speed: 3.2, color: '#ff4400' },
        { at: 3000, type: 'zigzag', count: 5, speed: 3.5, color: '#ff8800' },
        { at: 3800, type: 'rain',   count: 6, speed: 3.2, color: '#ff6600' },
        { at: 4600, type: 'aimed',  count: 4, speed: 3.0, color: '#ff0044' },
      ],
    },
    {
      name: 'PARALISIA',
      dialogue: '* Grade e pulsos — o nó está completamente paralisado.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'grid',  count: 15, speed: 2.5, color: '#ff4400' },
        { at: 1500, type: 'aimed', count: 4,  speed: 3.0, color: '#ff0044' },
        { at: 2500, type: 'grid',  count: 12, speed: 3.0, color: '#ff6600', fromBottom: true },
        { at: 3500, type: 'aimed', count: 5,  speed: 3.2, color: '#ff0044' },
        { at: 4500, type: 'rain',  count: 8,  speed: 3.5, color: '#ff4400' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'desengargalar',
      label: 'DESENGARGALAR',
      result: '* Você libera os pacotes enfileirados. O congestionamento começa a ceder.',
      weakens: true,
    },
    {
      id: 'rota-alternativa-cgh',
      label: 'ROTA-ALTERNATIVA',
      result:
        '* Rota alternativa via GRU ativada. CGH desafoga — o tráfego volta a fluir.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'DESAFOGAR',
  spareRequirement: 'rota-alternativa-cgh',
  cantSpareText: '* O congestionamento persiste. Desengargale e crie rota alternativa.',
  defeatText: 'CGH para completamente. São Paulo perde um aeroporto.',
  victoryText:
    '* GLITCH-CGH neutralizado.\n* Tráfego CGH normalizado.\n* Fila de 847 pacotes: processada.',
};

// ─── GLITCH ENGARRAFAMENTO — Guarulhos ─────────────────────────────────────────
const GLITCH_GRU: CombatEncounter = {
  id: 'glitch-gru-11',
  airportId: 'GRU',
  name: 'GLITCH ENGARRAFAMENTO',
  subtitle: '* Sobrecarga de malha — Guarulhos',
  flavorText:
    'GRAU MÉDIO: 47.\nCONEXÕES ATIVAS: MÁXIMO.\nA MALHA DENSA DE SÃO PAULO ENTROU EM COLAPSO.',
  maxHp: 140,
  spriteId: 'glitch-gru',
  spriteLines: [
    '╔═══════╗ ',
    '║GRU HUB║ ',
    '╠═══════╣ ',
    '║●●●●●●●║ ',
    '║●●●●●●●║ ',
    '╠═══════╣ ',
    '║OVERLOAD║ ',
    '╚═══════╝ ',
  ],
  attackMoves: [
    {
      name: 'MALHA-DENSA',
      dialogue: '* Varreduras horizontais e verticais combinadas — a malha está sobrecarregada.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'sweep-h', count: 3, speed: 3.2, gap: 55,  color: '#ff4400' },
        { at: 300,  type: 'sweep-v', count: 3, speed: 3.2, gap: 80,  color: '#ff6600' },
        { at: 1200, type: 'sweep-h', count: 3, speed: 3.5, gap: 50,  color: '#ff4400', fromRight: true },
        { at: 1500, type: 'sweep-v', count: 3, speed: 3.5, gap: 75,  color: '#ff6600', fromBottom: true },
        { at: 2800, type: 'sweep-h', count: 4, speed: 3.5, gap: 48,  color: '#ff8800' },
        { at: 3100, type: 'sweep-v', count: 4, speed: 3.5, gap: 70,  color: '#ff4400' },
        { at: 4400, type: 'sweep-h', count: 3, speed: 3.8, gap: 50,  color: '#ff8800', fromRight: true },
        { at: 4700, type: 'rain',    count: 6, speed: 3.5, color: '#ff4400' },
      ],
    },
    {
      name: 'SOBRECARGA',
      dialogue: '* Chuva intensa e pulsos simultâneos — a largura de banda esgotou.',
      duration: 6500,
      waves: [
        { at: 0,    type: 'rain',  count: 7, speed: 3.5, color: '#ff6600' },
        { at: 500,  type: 'aimed', count: 3, speed: 3.2, color: '#ff0044' },
        { at: 900,  type: 'rain',  count: 8, speed: 3.8, color: '#ff4400' },
        { at: 1400, type: 'aimed', count: 4, speed: 3.5, color: '#ff0044' },
        { at: 2000, type: 'rain',  count: 7, speed: 3.5, color: '#ff6600' },
        { at: 2600, type: 'aimed', count: 5, speed: 3.8, color: '#ff4400' },
        { at: 3200, type: 'rain',  count: 9, speed: 4.0, color: '#ff4400' },
        { at: 3900, type: 'aimed', count: 4, speed: 3.8, color: '#ff0044' },
        { at: 4600, type: 'rain',  count: 8, speed: 4.0, color: '#ff8800' },
        { at: 5400, type: 'aimed', count: 6, speed: 4.0, color: '#ff0044' },
      ],
    },
    {
      name: 'CONGESTÃO',
      dialogue: '* Ricochetes em cascata e grade de interferência — São Paulo em colapso.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'bounce', count: 5, speed: 3.5, color: '#ff8800' },
        { at: 600,  type: 'bounce', count: 5, speed: 3.5, color: '#ff4400' },
        { at: 1200, type: 'grid',   count: 14, speed: 3.0, color: '#ff4400' },
        { at: 2000, type: 'bounce', count: 6, speed: 3.8, color: '#ff8800' },
        { at: 2700, type: 'bounce', count: 5, speed: 3.8, color: '#ff4400' },
        { at: 3400, type: 'grid',   count: 12, speed: 3.5, color: '#ff6600', fromBottom: true },
        { at: 4200, type: 'bounce', count: 6, speed: 4.0, color: '#ff8800' },
        { at: 5000, type: 'aimed',  count: 5, speed: 3.8, color: '#ff0044' },
      ],
    },
    {
      name: 'COLAPSO-TOTAL',
      dialogue: '* Todos os tipos simultâneos — GRU no limite máximo de sobrecarga.',
      duration: 7500,
      waves: [
        { at: 0,    type: 'sweep-h', count: 3, speed: 4.0, gap: 55,  color: '#ff4400' },
        { at: 200,  type: 'sweep-v', count: 3, speed: 4.0, gap: 80,  color: '#ff6600' },
        { at: 700,  type: 'rain',    count: 9, speed: 4.0, color: '#ff4400' },
        { at: 1300, type: 'aimed',   count: 5, speed: 4.0, color: '#ff0044' },
        { at: 1900, type: 'bounce',  count: 6, speed: 4.0, color: '#ff8800' },
        { at: 2700, type: 'sweep-h', count: 4, speed: 4.2, gap: 48,  color: '#ff4400', fromRight: true },
        { at: 3000, type: 'sweep-v', count: 4, speed: 4.2, gap: 70,  color: '#ff6600', fromBottom: true },
        { at: 3800, type: 'rain',    count: 10, speed: 4.5, color: '#ff4400' },
        { at: 4600, type: 'aimed',   count: 7, speed: 4.5, color: '#ff0044' },
        { at: 5400, type: 'bounce',  count: 7, speed: 4.5, color: '#ff8800' },
        { at: 6400, type: 'rain',    count: 8, speed: 4.5, color: '#ff4400' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'analisar-malha',
      label: 'ANALISAR-MALHA',
      result: '* Diagnóstico: 3847 conexões ativas, capacidade máxima de 2000. Sobrecarga confirmada.',
      weakens: true,
    },
    {
      id: 'desativar-redundancia',
      label: 'DESATIVAR-REDUNDÂNCIA',
      result: '* Você desativa conexões redundantes. A carga cai para 60%.',
      weakens: true,
    },
    {
      id: 'otimizar',
      label: 'OTIMIZAR',
      result:
        '* Vitor, o coordenador, transmite: "Algoritmo de otimização executado! GRU rodando a 40% da capacidade. Malha densa gerenciada com elegância!"',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'OTIMIZAR',
  spareRequirement: 'otimizar',
  cantSpareText: '* A malha ainda está sobrecarregada. Analise, desative redundâncias e otimize.',
  defeatText: 'GRU colapsa. São Paulo perde seu principal hub internacional.',
  victoryText:
    '* GLITCH-GRU neutralizado.\n* Malha GRU otimizada.\n* Vitor transmite: "São Paulo respira. Obrigado, agente!"',
  storyReveal:
    'Vitor descobre que o GRU foi sobrecarregado propositalmente — o PROTOCOLO-M aumentou artificialmente o número de conexões ativas para forçar o colapso por excesso, não por falta.',
};

// ─── GLITCH NEBLINA — Curitiba ─────────────────────────────────────────────────
const GLITCH_CWB: CombatEncounter = {
  id: 'glitch-cwb-12',
  airportId: 'CWB',
  name: 'GLITCH NEBLINA',
  subtitle: '* Bloqueador de visibilidade — Curitiba',
  flavorText:
    'VISIBILIDADE: ZERO.\nNÍVEL DE BFS: DESCONHECIDO.\nA NEBLINA ESCONDE TUDO.',
  maxHp: 105,
  spriteId: 'glitch-cwb',
  spriteLines: [
    '░░░░░░░░ ',
    '░ ╔══╗ ░ ',
    '░ ║CW║ ░ ',
    '░ ╚══╝ ░ ',
    '░░░░░░░░ ',
    ' NEBLINA ',
    '░░░░░░░░ ',
    '░░░░░░░░ ',
  ],
  attackMoves: [
    {
      name: 'NÉVOA',
      dialogue: '* Chuva lenta e varreduras vagarosas — a neblina é densa, mas lenta.',
      duration: 5000,
      waves: [
        { at: 200,  type: 'rain',    count: 4, speed: 2.0, color: '#aaaaff' },
        { at: 1000, type: 'sweep-h', count: 2, speed: 2.0, gap: 110, color: '#8888ff' },
        { at: 2000, type: 'rain',    count: 5, speed: 2.2, color: '#aaaaff' },
        { at: 3000, type: 'sweep-h', count: 2, speed: 2.2, gap: 100, color: '#8888ff', fromRight: true },
        { at: 4000, type: 'rain',    count: 5, speed: 2.5, color: '#aaaaff' },
      ],
    },
    {
      name: 'BRUMA-DENSA',
      dialogue: '* A bruma se fecha. Ricochetes e chuva mais intensa.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'bounce', count: 3, speed: 2.8, color: '#aaaaff' },
        { at: 700,  type: 'rain',   count: 5, speed: 2.8, color: '#8888ff' },
        { at: 1400, type: 'bounce', count: 4, speed: 3.0, color: '#aaaaff' },
        { at: 2100, type: 'rain',   count: 6, speed: 3.0, color: '#aaaaff' },
        { at: 2800, type: 'bounce', count: 4, speed: 3.0, color: '#8888ff' },
        { at: 3600, type: 'rain',   count: 7, speed: 3.2, color: '#aaaaff' },
        { at: 4400, type: 'aimed',  count: 3, speed: 3.0, color: '#ff4400' },
      ],
    },
    {
      name: 'TEMPESTADE-FRIA',
      dialogue: '* Varreduras verticais e pulsos saem da névoa — invisíveis até o último segundo.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'sweep-v', count: 3, speed: 3.0, gap: 90,  color: '#aaaaff' },
        { at: 600,  type: 'aimed',   count: 3, speed: 3.0, color: '#ff4400' },
        { at: 1400, type: 'sweep-v', count: 3, speed: 3.2, gap: 80,  color: '#8888ff', fromBottom: true },
        { at: 2100, type: 'aimed',   count: 4, speed: 3.2, color: '#ff4400' },
        { at: 2900, type: 'sweep-v', count: 4, speed: 3.5, gap: 70,  color: '#aaaaff' },
        { at: 3700, type: 'aimed',   count: 4, speed: 3.5, color: '#ff0044' },
        { at: 4500, type: 'sweep-v', count: 3, speed: 3.8, gap: 75,  color: '#8888ff', fromBottom: true },
        { at: 5300, type: 'rain',    count: 7, speed: 3.5, color: '#aaaaff' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'explorar-nivel-1',
      label: 'EXPLORAR-NÍVEL-1',
      result: '* Nível 1 do BFS explorado. Você consegue ver os vizinhos diretos de CWB.',
      weakens: true,
    },
    {
      id: 'explorar-nivel-2',
      label: 'EXPLORAR-NÍVEL-2',
      result: '* Nível 2 explorado. A neblina recua mais.',
      weakens: true,
    },
    {
      id: 'varrer-em-largura',
      label: 'VARRER-EM-LARGURA',
      result:
        '* Léo, o analista, confirma: "BFS completo! Todos os níveis explorados. A neblina de Curitiba foi completamente dissipada!"',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'DISSIPAR',
  spareRequirement: 'varrer-em-largura',
  cantSpareText: '* A neblina persiste. Explore nível 1, nível 2 e então varra em largura.',
  defeatText: 'A neblina engole tudo. Curitiba desaparece do mapa.',
  victoryText:
    '* GLITCH-CWB neutralizado.\n* Neblina de CWB dissipada.\n* Léo transmite: "Visibilidade total! O sul do Brasil agradece."',
  storyReveal:
    'Léo descobre que a neblina escondia conexões secretas — o PROTOCOLO-M usava CWB como relay oculto. Com a neblina removida, rotas alternativas se tornam visíveis.',
};

// ─── GLITCH ABISMO — Florianópolis ─────────────────────────────────────────────
const GLITCH_FLN: CombatEncounter = {
  id: 'glitch-fln-13',
  airportId: 'FLN',
  name: 'GLITCH ABISMO',
  subtitle: '* Armadilha de profundidade — Florianópolis',
  flavorText:
    'DFS: PROFUNDIDADE INFINITA.\nBECO SEM SAÍDA DETECTADO.\nVOCÊ VAI DESCER. NÃO HÁ RETORNO.',
  maxHp: 110,
  spriteId: 'glitch-fln',
  spriteLines: [
    '│        ',
    '│╔════╗  ',
    '│║FLN ║  ',
    '│╚════╝  ',
    '│        ',
    '│        ',
    '│        ',
    '▼ ABISMO ',
  ],
  attackMoves: [
    {
      name: 'BECO-SEM-SAÍDA',
      dialogue: '* Pulsos te empurram para becos — ricochetes prendem a saída.',
      duration: 5000,
      waves: [
        { at: 100,  type: 'aimed',  count: 3, speed: 3.0, color: '#ff4400' },
        { at: 700,  type: 'bounce', count: 3, speed: 2.8, color: '#ff8800' },
        { at: 1400, type: 'aimed',  count: 4, speed: 3.2, color: '#ff0044' },
        { at: 2000, type: 'bounce', count: 3, speed: 3.0, color: '#ff8800' },
        { at: 2700, type: 'aimed',  count: 4, speed: 3.5, color: '#ff4400' },
        { at: 3400, type: 'bounce', count: 4, speed: 3.2, color: '#ff8800' },
        { at: 4200, type: 'aimed',  count: 3, speed: 3.5, color: '#ff0044' },
      ],
    },
    {
      name: 'PROFUNDIDADE',
      dialogue: '* Varreduras verticais em cascata — cada nível mais fundo.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'sweep-v', count: 3, speed: 3.2, gap: 90,  color: '#ff6600' },
        { at: 700,  type: 'aimed',   count: 3, speed: 3.2, color: '#ff0044' },
        { at: 1400, type: 'sweep-v', count: 4, speed: 3.5, gap: 78,  color: '#ff4400' },
        { at: 2100, type: 'aimed',   count: 4, speed: 3.5, color: '#ff0044' },
        { at: 2900, type: 'sweep-v', count: 4, speed: 3.8, gap: 70,  color: '#ff6600', fromBottom: true },
        { at: 3700, type: 'aimed',   count: 5, speed: 3.8, color: '#ff4400' },
        { at: 4500, type: 'rain',    count: 8, speed: 4.0, color: '#ff4400' },
      ],
    },
    {
      name: 'POÇO-SEM-FUNDO',
      dialogue: '* A profundidade máxima — todos os tipos em velocidade crescente.',
      duration: 6500,
      waves: [
        { at: 0,    type: 'sweep-v', count: 3, speed: 3.5, gap: 85,  color: '#ff6600' },
        { at: 400,  type: 'aimed',   count: 4, speed: 3.5, color: '#ff0044' },
        { at: 900,  type: 'bounce',  count: 4, speed: 3.5, color: '#ff8800' },
        { at: 1500, type: 'rain',    count: 7, speed: 3.8, color: '#ff4400' },
        { at: 2100, type: 'sweep-v', count: 4, speed: 4.0, gap: 72,  color: '#ff6600', fromBottom: true },
        { at: 2700, type: 'aimed',   count: 5, speed: 4.0, color: '#ff0044' },
        { at: 3300, type: 'bounce',  count: 5, speed: 4.0, color: '#ff8800' },
        { at: 4000, type: 'rain',    count: 9, speed: 4.2, color: '#ff4400' },
        { at: 4800, type: 'aimed',   count: 6, speed: 4.2, color: '#ff0044' },
        { at: 5600, type: 'sweep-v', count: 4, speed: 4.5, gap: 65,  color: '#ff6600' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'marcar-visitado',
      label: 'MARCAR-VISITADO',
      result: '* Você marca FLN como visitado. O DFS sabe onde foi.',
      weakens: true,
    },
    {
      id: 'retroceder',
      label: 'RETROCEDER',
      result: '* Você faz backtrack. O Abismo perde o controle da pilha de chamadas.',
      weakens: true,
    },
    {
      id: 'explorar-em-profundidade',
      label: 'EXPLORAR-EM-PROFUNDIDADE',
      result:
        '* Luna, a exploradora, transmite: "DFS completo! Todos os vértices visitados. O abismo foi mapeado e controlado!"',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'ESCALAR',
  spareRequirement: 'explorar-em-profundidade',
  cantSpareText: '* O abismo ainda captura. Marque, retroceda e explore em profundidade.',
  defeatText: 'Você cai no abismo. FLN permanece como armadilha.',
  victoryText:
    '* GLITCH-FLN derrotado.\n* Abismo de FLN mapeado.\n* Luna transmite: "Florianópolis está livre. O sul está quase todo conectado!"',
  storyReveal:
    'Luna encontra no fundo do abismo um arquivo: "PROTO-M/src/trap_generator.py — v1.2". O PROTOCOLO-M gerou as armadilhas automaticamente. Código elegante, mas cruel.',
};

// ─── GLITCH DESVIO — Porto Alegre ──────────────────────────────────────────────
const GLITCH_POA: CombatEncounter = {
  id: 'glitch-poa-14',
  airportId: 'POA',
  name: 'GLITCH DESVIO',
  subtitle: '* Enganador de caminhos — Porto Alegre',
  flavorText:
    'CAMINHO MÍNIMO: FALSO.\nCUSTOS OCULTOS: ATIVADOS.\nDIJKSTRA FALHOU. BELLMAN-FORD MENTIU.\nNADA É O QUE PARECE.',
  maxHp: 120,
  spriteId: 'glitch-poa',
  spriteLines: [
    '→→→╔═══╗ ',
    '   ║POA║ ',
    '   ╚═══╝ ',
    '    ↓    ',
    '  CUSTO  ',
    '  REAL:∞ ',
    '   ↓↓↓   ',
    ' DESVIO  ',
  ],
  attackMoves: [
    {
      name: 'CAMINHO-CURTO',
      dialogue: '* Varreduras que parecem fáceis de desviar — mas são armadilhas.',
      duration: 5000,
      waves: [
        { at: 100,  type: 'sweep-h', count: 2, speed: 2.5, gap: 100, color: '#ff6600' },
        { at: 900,  type: 'sweep-h', count: 2, speed: 3.5, gap: 40,  color: '#ff4400' },
        { at: 1800, type: 'sweep-h', count: 3, speed: 2.8, gap: 90,  color: '#ff6600', fromRight: true },
        { at: 2700, type: 'sweep-h', count: 3, speed: 3.8, gap: 38,  color: '#ff4400', fromRight: true },
        { at: 3800, type: 'sweep-h', count: 2, speed: 4.0, gap: 36,  color: '#ff8800' },
      ],
    },
    {
      name: 'CUSTO-OCULTO',
      dialogue: '* Pulsos com custos ocultos — cada evasão tem um preço.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'aimed',  count: 4, speed: 3.2, color: '#ff0044' },
        { at: 600,  type: 'rain',   count: 6, speed: 3.2, color: '#ff4400' },
        { at: 1200, type: 'aimed',  count: 5, speed: 3.5, color: '#ff0044' },
        { at: 1900, type: 'rain',   count: 7, speed: 3.5, color: '#ff6600' },
        { at: 2700, type: 'aimed',  count: 5, speed: 3.8, color: '#ff0044' },
        { at: 3500, type: 'rain',   count: 7, speed: 3.8, color: '#ff4400' },
        { at: 4300, type: 'aimed',  count: 6, speed: 4.0, color: '#ff0044' },
      ],
    },
    {
      name: 'ROTA-FALSA',
      dialogue: '* Zigue-zague e ricochetes — todos os caminhos levam a becos falsos.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'zigzag', count: 4, speed: 3.2, color: '#ff6600' },
        { at: 600,  type: 'zigzag', count: 4, speed: 3.2, color: '#ff4400', fromRight: true },
        { at: 1300, type: 'bounce', count: 4, speed: 3.2, color: '#ff8800' },
        { at: 2000, type: 'zigzag', count: 5, speed: 3.5, color: '#ff6600' },
        { at: 2700, type: 'bounce', count: 5, speed: 3.5, color: '#ff4400' },
        { at: 3400, type: 'zigzag', count: 5, speed: 3.8, color: '#ff8800', fromRight: true },
        { at: 4200, type: 'bounce', count: 5, speed: 3.8, color: '#ff4400' },
        { at: 5100, type: 'aimed',  count: 5, speed: 4.0, color: '#ff0044' },
      ],
    },
    {
      name: 'CÁLCULO-FINAL',
      dialogue: '* Todos os tipos — o custo de não calcular bem é a derrota.',
      duration: 7000,
      waves: [
        { at: 0,    type: 'sweep-h', count: 3, speed: 3.8, gap: 55,  color: '#ff4400' },
        { at: 300,  type: 'sweep-v', count: 3, speed: 3.8, gap: 80,  color: '#ff6600' },
        { at: 800,  type: 'aimed',   count: 5, speed: 3.8, color: '#ff0044' },
        { at: 1500, type: 'rain',    count: 8, speed: 4.0, color: '#ff4400' },
        { at: 2200, type: 'bounce',  count: 5, speed: 3.8, color: '#ff8800' },
        { at: 3000, type: 'sweep-h', count: 3, speed: 4.2, gap: 50,  color: '#ff4400', fromRight: true },
        { at: 3400, type: 'sweep-v', count: 3, speed: 4.2, gap: 72,  color: '#ff6600', fromBottom: true },
        { at: 4200, type: 'aimed',   count: 6, speed: 4.2, color: '#ff0044' },
        { at: 5000, type: 'rain',    count: 10, speed: 4.5, color: '#ff4400' },
        { at: 5800, type: 'bounce',  count: 7, speed: 4.5, color: '#ff8800' },
        { at: 6500, type: 'aimed',   count: 5, speed: 4.5, color: '#ff0044' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'calcular-custo',
      label: 'CALCULAR-CUSTO',
      result: '* Você calcula o custo real de cada aresta. Os desvios ficam mais previsíveis.',
      weakens: true,
    },
    {
      id: 'comparar-rotas',
      label: 'COMPARAR-ROTAS',
      result: '* Rotas comparadas. A falsa tem custo 999, a real tem custo 7.',
      weakens: true,
    },
    {
      id: 'caminho-minimo',
      label: 'CAMINHO-MÍNIMO',
      result:
        '* Rosa, a capitã, transmite: "Caminho mínimo calculado! Dijkstra confirmado. Porto Alegre está na rota certa!"',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'CALCULAR',
  spareRequirement: 'caminho-minimo',
  cantSpareText: '* Os desvios ainda enganam. Calcule, compare e encontre o caminho mínimo.',
  defeatText: 'Porto Alegre permanece num labirinto de rotas falsas.',
  victoryText:
    '* GLITCH-POA derrotado.\n* Caminho mínimo POA-FLN-CWB calculado.\n* Rosa transmite: "O Sul está conectado de ponta a ponta!"',
  storyReveal:
    'Com Porto Alegre liberada, toda a região Sul está conectada. Lia transmite: "A malha está quase completa. Brasília é o último nó."',
};

// ─── GLITCH FRONTEIRA — Porto Velho ────────────────────────────────────────────
const GLITCH_PVH: CombatEncounter = {
  id: 'glitch-pvh-15',
  airportId: 'PVH',
  name: 'GLITCH FRONTEIRA',
  subtitle: '* Bloqueador de fronteira — Porto Velho',
  flavorText:
    'FRONTEIRA NORTE-CENTRO-OESTE: FECHADA.\nPVH: NÓ LIMITE DA MALHA.\nPASSAGEM NEGADA.',
  maxHp: 80,
  spriteId: 'glitch-pvh',
  spriteLines: [
    '├────────┤',
    '│ FRONT. │',
    '│ ╔════╗ │',
    '│ ║PVH ║ │',
    '│ ╚════╝ │',
    '├────────┤',
    '  FECHADO ',
    '          ',
  ],
  attackMoves: [
    {
      name: 'BARREIRA-FRONTEIRIÇA',
      dialogue: '* A fronteira ergue uma barreira dupla de varreduras.',
      duration: 4500,
      waves: [
        { at: 100,  type: 'sweep-h', count: 3, speed: 2.5, gap: 65,  color: '#ff4400' },
        { at: 900,  type: 'sweep-h', count: 3, speed: 2.8, gap: 60,  color: '#ff6600', fromRight: true },
        { at: 1900, type: 'sweep-v', count: 3, speed: 2.8, gap: 90,  color: '#ff4400' },
        { at: 2800, type: 'rain',    count: 5, speed: 2.8, color: '#ff6600' },
        { at: 3600, type: 'aimed',   count: 3, speed: 2.8, color: '#ff0044' },
      ],
    },
    {
      name: 'ISOLAMENTO-FRONTEIRIÇO',
      dialogue: '* Grade e pulsos — a fronteira fecha completamente.',
      duration: 5000,
      waves: [
        { at: 0,    type: 'grid',  count: 12, speed: 2.5, color: '#ff4400' },
        { at: 1500, type: 'aimed', count: 4,  speed: 2.8, color: '#ff0044' },
        { at: 2500, type: 'bounce', count: 4, speed: 2.8, color: '#ff8800' },
        { at: 3300, type: 'rain',  count: 6,  speed: 3.0, color: '#ff6600' },
        { at: 4200, type: 'aimed', count: 4,  speed: 3.2, color: '#ff4400' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'negociar-passagem',
      label: 'NEGOCIAR',
      result: '* Você apresenta credenciais. A fronteira hesita.',
      weakens: true,
    },
    {
      id: 'abrir-fronteira',
      label: 'ABRIR-FRONTEIRA',
      result:
        '* Autorização concedida. Porto Velho abre passagem para o Norte amazônico.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'ABRIR',
  spareRequirement: 'abrir-fronteira',
  cantSpareText: '* A fronteira ainda está fechada. Negocie e abra a passagem.',
  defeatText: 'Porto Velho bloqueia o corredor Norte. A Amazônia fica ainda mais isolada.',
  victoryText:
    '* GLITCH-PVH neutralizado.\n* Fronteira PVH aberta.\n* Corredor Norte-Centro-Oeste liberado.',
};

// ─── GLITCH FIM — Rio Branco ───────────────────────────────────────────────────
const GLITCH_RBR: CombatEncounter = {
  id: 'glitch-rbr-16',
  airportId: 'RBR',
  name: 'GLITCH FIM',
  subtitle: '* Último nó do Acre — Rio Branco',
  flavorText:
    'FIM DO MAPA. FIM DA MALHA.\nO ÚLTIMO NÓ. O MAIS REMOTO DE TODOS.\nSE ESTE CAIR, A BORDA SOME.',
  maxHp: 75,
  spriteId: 'glitch-rbr',
  spriteLines: [
    '         ',
    '  ╔═══╗  ',
    '  ║RBR║  ',
    '  ╚═══╝  ',
    '         ',
    '   FIM   ',
    '   ...   ',
    '         ',
  ],
  attackMoves: [
    {
      name: 'ÚLTIMO-PULSO',
      dialogue: '* O nó mais remoto dispara com tudo que tem — ataques simples mas determinados.',
      duration: 4500,
      waves: [
        { at: 100,  type: 'sweep-h', count: 3, speed: 2.5, gap: 70,  color: '#ff6600' },
        { at: 1000, type: 'rain',    count: 5, speed: 2.5, color: '#ff4400' },
        { at: 1900, type: 'sweep-v', count: 2, speed: 2.5, gap: 110, color: '#ff6600' },
        { at: 2800, type: 'aimed',   count: 3, speed: 2.5, color: '#ff0044' },
        { at: 3700, type: 'bounce',  count: 3, speed: 2.5, color: '#ff8800' },
      ],
    },
    {
      name: 'BORDA-COLAPSO',
      dialogue: '* A borda da malha colapsa em chuva e ricochetes finais.',
      duration: 5000,
      waves: [
        { at: 0,    type: 'rain',   count: 6, speed: 2.8, color: '#ff4400' },
        { at: 700,  type: 'bounce', count: 3, speed: 2.8, color: '#ff8800' },
        { at: 1500, type: 'rain',   count: 7, speed: 3.0, color: '#ff6600' },
        { at: 2300, type: 'bounce', count: 4, speed: 3.0, color: '#ff4400' },
        { at: 3200, type: 'aimed',  count: 4, speed: 3.0, color: '#ff0044' },
        { at: 4100, type: 'rain',   count: 5, speed: 3.0, color: '#ff8800' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'chegar-ao-fim',
      label: 'CHEGAR-AO-FIM',
      result: '* Você alcança o nó mais distante da malha. Uma conquista em si.',
      weakens: true,
    },
    {
      id: 'conectar-borda',
      label: 'CONECTAR-BORDA',
      result:
        '* Rio Branco conectado. A malha brasileira cobre seu território mais remoto. Nenhum nó para trás.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'CONECTAR',
  spareRequirement: 'conectar-borda',
  cantSpareText: '* O último nó ainda resiste. Chegue até o fim e conecte a borda.',
  defeatText: 'Rio Branco permanece isolado. O Acre fica fora da malha.',
  victoryText:
    '* GLITCH-RBR neutralizado.\n* Rio Branco conectado.\n* A malha brasileira cobre cada ponto do território. Missão quase completa.',
  storyReveal:
    'Com Rio Branco conectado, Lia confirma: "Todos os nós secundários estão online. Só falta Brasília. É hora de enfrentar o SISTEMA-ANAC."',
};

export const COMBAT_ENCOUNTERS: CombatEncounter[] = [
  NODO_REC,
  ONDA_FOR,
  ANOMALIA_SSA,
  ANAC_BSB,
  GLITCH_JPA,
  GLITCH_NAT,
  GLITCH_THE,
  GLITCH_BEL,
  GLITCH_MAO,
  GLITCH_GYN,
  GLITCH_CNF,
  GLITCH_VIX,
  GLITCH_GIG,
  GLITCH_CGH,
  GLITCH_GRU,
  GLITCH_CWB,
  GLITCH_FLN,
  GLITCH_POA,
  GLITCH_PVH,
  GLITCH_RBR,
];

export function getEncounterForAirport(airportId: string | undefined): CombatEncounter | null {
  return COMBAT_ENCOUNTERS.find(e => e.airportId === airportId) ?? null;
}
