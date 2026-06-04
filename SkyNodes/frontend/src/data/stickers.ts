import eiffelImg   from '../assets/Stickers/eiffel_tower.png';
import bigbenImg   from '../assets/Stickers/bigben_sticker.png';
import greekImg    from '../assets/Stickers/greek_sticker.png';
import pokeballImg from '../assets/Stickers/pokeball_sticker.png';
import spiderImg   from '../assets/Stickers/spider_sticker.png';
import blockImg    from '../assets/Stickers/block_sticker.png';
import peepImg     from '../assets/Stickers/peeper_sticker.png';
import d20Img      from '../assets/Stickers/d20_sticker.png';

export interface Sticker {
  id: string;
  name: string;
  desc: string;
  img: string;
  mastery?: boolean;
}

// placeholder SVG para figurinhas de maestria (substituir por arte final)
const MAESTRIA_DADOS_SVG = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="%230f172a" stroke="%2322d3ee" stroke-width="3"/><text x="50" y="38" text-anchor="middle" font-size="28" fill="%2322d3ee">📊</text><text x="50" y="68" text-anchor="middle" font-size="10" fill="%2322d3ee" font-family="monospace">MESTRE</text><text x="50" y="82" text-anchor="middle" font-size="10" fill="%2322d3ee" font-family="monospace">DOS DADOS</text></svg>')}`;

const MAESTRIA_GRAFOS_SVG = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="%230f172a" stroke="%23a78bfa" stroke-width="3"/><text x="50" y="38" text-anchor="middle" font-size="28" fill="%23a78bfa">🕸</text><text x="50" y="68" text-anchor="middle" font-size="10" fill="%23a78bfa" font-family="monospace">MESTRE</text><text x="50" y="82" text-anchor="middle" font-size="10" fill="%23a78bfa" font-family="monospace">DOS GRAFOS</text></svg>')}`;

export const MASTERY_STICKER_IDS = ['maestro_dados', 'maestro_grafos'] as const;

export const STICKERS: Sticker[] = [
  // Figurinhas gamers (desbloqueadas pelo quiz antigo e pelo modo MIX)
  { id: 'eiffel_tower', name: 'FRANCA',          desc: 'Clair Obscur: Expedition 33 — RPG de turno nascido nas sombras da Torre Eiffel',  img: eiffelImg   },
  { id: 'bigben',       name: 'INGLATERRA',       desc: '007 — O agente mais famoso do MI6 sob o relogio do Big Ben',                      img: bigbenImg   },
  { id: 'greek',        name: 'GRECIA',           desc: 'God of War — Kratos destroi o Olimpo pedra por pedra',                            img: greekImg    },
  { id: 'pokeball',     name: 'JAPAO',            desc: 'Pokemon — Capture-os todos nas terras do sol nascente',                           img: pokeballImg },
  { id: 'spider',       name: 'NEW YORK',         desc: "Marvel's Spider-Man — Heroi de NY balanca entre o Empire State e o Chrysler",     img: spiderImg   },
  { id: 'block',        name: 'SUECIA',           desc: 'Minecraft — O bloco de grama mais famoso nasceu nos fiordes suecos',              img: blockImg    },
  { id: 'peeper',       name: 'OCEANO PACIFICO',  desc: 'Subnautica — Sobreviva nas profundezas alienígenas do Pacifico',                  img: peepImg     },
  { id: 'd20',          name: 'BELGICA',          desc: "Baldur's Gate 3 — Role o D20 e decida o destino de Faerun",                       img: d20Img      },
  // Figurinhas de maestria (desbloqueadas ao completar um caminho inteiro)
  { id: 'maestro_dados',  name: 'MESTRE DOS DADOS',  desc: 'Completou o caminho AVD do Show do Grafão — mestre da visualização de dados.', img: MAESTRIA_DADOS_SVG,  mastery: true },
  { id: 'maestro_grafos', name: 'MESTRE DOS GRAFOS', desc: 'Completou o caminho Grafos do Show do Grafão — dominou a teoria dos grafos.',  img: MAESTRIA_GRAFOS_SVG, mastery: true },
];
