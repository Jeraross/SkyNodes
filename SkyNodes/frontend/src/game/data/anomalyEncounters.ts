// src/game/data/anomalyEncounters.ts
import type { CombatEncounter } from './combatEncounters';

const ANOMALIA_GEOMETRICA: CombatEncounter = {
  id: 'anomalia-rota-geo',
  airportId: '',  // not airport-bound — used for route encounters
  name: 'ANOMALIA GEOMÉTRICA',
  subtitle: '* Perturbação topológica na rota',
  flavorText:
    'ROTA COMPROMETIDA.\nFORMAS INSTÁVEIS DETECTADAS.\nNÃO É UM NÓ. NÃO É UMA ARESTA.\nÉ UM ERRO NA MALHA.',
  maxHp: 160,
  spriteId: 'nodo-rec',
  spriteLines: [
    '█▀▀░░█▀▀░',
    '░░▄██▄░░░',
    '▀▀░░░▀█▄░',
    '░█▄░█░░▀▀',
    '░░▀▄▀█▄░░',
    '▄░░░░░░▄█',
    '░▀▄▄▄█▀░░',
    '█░░░░░░▀░',
  ],
  attackMoves: [
    {
      name: 'DISTORÇÃO-GEOMÉTRICA',
      dialogue: '* As formas se dobram. Os ângulos somem. A rota se fragmenta.',
      duration: 5000,
      waves: [
        { at: 0,    type: 'sweep-h', count: 4, speed: 3.2, gap: 50,  color: '#ff4400' },
        { at: 500,  type: 'sweep-v', count: 3, speed: 3.2, gap: 80,  color: '#ff6600' },
        { at: 1500, type: 'zigzag',  count: 5, speed: 3.0, color: '#ff8800' },
        { at: 2500, type: 'aimed',   count: 4, speed: 3.0, color: '#ff0044' },
        { at: 3500, type: 'sweep-h', count: 4, speed: 3.5, gap: 45,  color: '#ff4400', fromRight: true },
        { at: 4400, type: 'rain',    count: 6, speed: 3.2, color: '#ff6600' },
      ],
    },
    {
      name: 'COLAPSO-POLIGONAL',
      dialogue: '* Polígonos deformados caem sobre a rota. Esquive entre os fragmentos.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'bounce', count: 5, speed: 3.0, color: '#ff8800' },
        { at: 700,  type: 'bounce', count: 5, speed: 3.2, color: '#ff4400' },
        { at: 1400, type: 'rain',   count: 8, speed: 3.5, color: '#ff4400' },
        { at: 2200, type: 'bounce', count: 6, speed: 3.0, color: '#ff8800' },
        { at: 3000, type: 'aimed',  count: 5, speed: 3.2, color: '#ff0044' },
        { at: 3800, type: 'bounce', count: 5, speed: 3.5, color: '#ff4400' },
        { at: 4700, type: 'rain',   count: 7, speed: 3.8, color: '#ff6600' },
      ],
    },
    {
      name: 'GRADE-CAÓTICA',
      dialogue: '* Retângulos se multiplicam. Cada espaço livre desaparece.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'grid',    count: 0, speed: 0,   color: '#ff0000' },
        { at: 1200, type: 'aimed',   count: 5, speed: 3.5, color: '#ff0044' },
        { at: 2200, type: 'grid',    count: 0, speed: 0,   color: '#ff4400' },
        { at: 3200, type: 'bounce',  count: 5, speed: 3.5, color: '#ff8800' },
        { at: 4000, type: 'aimed',   count: 6, speed: 4.0, color: '#ff0000' },
        { at: 5000, type: 'rain',    count: 9, speed: 4.0, color: '#ff4400' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'mapear',
      label: 'MAPEAR',
      result: '* Você tenta mapear a anomalia. Sem forma definida — puro ruído topológico.',
      weakens: true,
    },
    {
      id: 'estabilizar',
      label: 'ESTABILIZAR',
      result:
        '* Você injeta um sinal de estabilização na rota. As formas param de se mover por um instante.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'DISPERSAR',
  spareRequirement: 'estabilizar',
  cantSpareText: '* A anomalia ainda está instável. Mapeie e estabilize.',
  defeatText: 'A anomalia bloqueia a rota. Você recua ao aeroporto de origem.',
  victoryText:
    '* ANOMALIA DISPERSADA.\n* ROTA DESOBSTRUÍDA.\n* BÔNUS ATIVO: 2 VIAGENS COM RECOMPENSA 1.5×.',
  storyReveal:
    'O padrão geométrico da anomalia carrega fragmentos do PROTOCOLO-M. Ela não é natural — foi semeada deliberadamente para bloquear rotas estratégicas.',
};

const ANOMALIA_FRAGMENTO: CombatEncounter = {
  id: 'anomalia-rota-frag',
  airportId: '',
  name: 'FRAGMENTO INSTÁVEL',
  subtitle: '* Massa de dados corrompidos na rota',
  flavorText:
    'DADOS SEM ESTRUTURA.\nNEM NÓ NEM ARESTA — APENAS RUÍDO.\nA ROTA SOME DENTRO DELE.',
  maxHp: 160,
  spriteId: 'nodo-rec',
  spriteLines: [
    '░░▄▄▄░░░█',
    '▀░░░░▄▄░░',
    '░█░░░░░█▀',
    '░░▀▄░▄▀░░',
    '▄░░░▀░░░▄',
    '░▀▄░░░▄▀░',
    '░░░▀▄▀░░░',
    '░░░░█░░░░',
  ],
  attackMoves: [
    {
      name: 'FRAGMENTAÇÃO',
      dialogue: '* O fragmento se parte em padrões impossíveis. Cada pedaço ataca sozinho.',
      duration: 5500,
      waves: [
        { at: 0,    type: 'rain',    count: 7,  speed: 3.0, color: '#ff4400' },
        { at: 600,  type: 'zigzag',  count: 4,  speed: 3.0, color: '#ff6600' },
        { at: 1400, type: 'rain',    count: 8,  speed: 3.2, color: '#ff4400' },
        { at: 2200, type: 'aimed',   count: 5,  speed: 3.0, color: '#ff0044' },
        { at: 3000, type: 'rain',    count: 9,  speed: 3.5, color: '#ff6600' },
        { at: 3800, type: 'zigzag',  count: 5,  speed: 3.2, color: '#ff8800' },
        { at: 4700, type: 'aimed',   count: 6,  speed: 3.5, color: '#ff0044' },
      ],
    },
    {
      name: 'CASCATA',
      dialogue: '* Fragmentos caem em cascata das quatro direções.',
      duration: 5000,
      waves: [
        { at: 0,    type: 'sweep-h', count: 3, speed: 3.2, gap: 60,  color: '#ff4400' },
        { at: 400,  type: 'sweep-v', count: 3, speed: 3.2, gap: 90,  color: '#ff6600' },
        { at: 1200, type: 'sweep-h', count: 3, speed: 3.5, gap: 55,  color: '#ff4400', fromRight: true },
        { at: 1600, type: 'sweep-v', count: 3, speed: 3.5, gap: 80,  color: '#ff6600', fromBottom: true },
        { at: 2800, type: 'rain',    count: 8, speed: 3.5, color: '#ff4400' },
        { at: 3800, type: 'aimed',   count: 5, speed: 3.5, color: '#ff0000' },
      ],
    },
    {
      name: 'ENTROPIA',
      dialogue: '* Desordem máxima. Bounce, rain, aimed — tudo ao mesmo tempo.',
      duration: 6000,
      waves: [
        { at: 0,    type: 'bounce', count: 4, speed: 3.0, color: '#ff8800' },
        { at: 400,  type: 'rain',   count: 6, speed: 3.2, color: '#ff4400' },
        { at: 800,  type: 'aimed',  count: 3, speed: 3.0, color: '#ff0044' },
        { at: 1400, type: 'bounce', count: 5, speed: 3.2, color: '#ff8800' },
        { at: 2000, type: 'rain',   count: 7, speed: 3.5, color: '#ff6600' },
        { at: 2600, type: 'aimed',  count: 4, speed: 3.2, color: '#ff0044' },
        { at: 3200, type: 'bounce', count: 5, speed: 3.5, color: '#ff4400' },
        { at: 3800, type: 'rain',   count: 8, speed: 4.0, color: '#ff4400' },
        { at: 4600, type: 'aimed',  count: 5, speed: 3.8, color: '#ff0000' },
        { at: 5400, type: 'bounce', count: 4, speed: 4.0, color: '#ff8800' },
      ],
    },
  ],
  actOptions: [
    {
      id: 'analisar-ruido',
      label: 'ANALISAR RUÍDO',
      result: '* Você encontra um padrão no ruído. É repetitivo — quase como uma assinatura digital.',
      weakens: true,
    },
    {
      id: 'comprimir',
      label: 'COMPRIMIR',
      result:
        '* Você comprime os fragmentos em um pacote coerente. O fragmento encolhe e para de se mover.',
      weakens: true,
      unlocksMercy: true,
    },
  ],
  mercyLabel: 'COMPRIMIR',
  spareRequirement: 'comprimir',
  cantSpareText: '* Fragmento ainda disperso. Analise o ruído e comprima.',
  defeatText: 'O fragmento dissolve sua navegação. Você retorna ao aeroporto de origem.',
  victoryText:
    '* FRAGMENTO COMPRIMIDO E DISPERSADO.\n* ROTA LIVRE.\n* BÔNUS ATIVO: 2 VIAGENS COM RECOMPENSA 1.5×.',
  storyReveal:
    'A assinatura no fragmento corresponde ao servidor da ANAC em Brasília. O PROTOCOLO-M está se espalhando ativamente pelas rotas, não apenas nos aeroportos.',
};

// Alternates between two variants based on routeId hash for visual variety
export function getRouteAnomalyEncounter(routeId: string): CombatEncounter {
  const hash = routeId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return hash % 2 === 0 ? ANOMALIA_GEOMETRICA : ANOMALIA_FRAGMENTO;
}
