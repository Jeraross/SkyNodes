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
}

export const STICKERS: Sticker[] = [
  { id: 'eiffel_tower', name: 'FRANCA',          desc: 'Clair Obscur: Expedition 33 — RPG de turno nascido nas sombras da Torre Eiffel',  img: eiffelImg   },
  { id: 'bigben',       name: 'INGLATERRA',       desc: '007 — O agente mais famoso do MI6 sob o relogio do Big Ben',                      img: bigbenImg   },
  { id: 'greek',        name: 'GRECIA',           desc: 'God of War — Kratos destroi o Olimpo pedra por pedra',                            img: greekImg    },
  { id: 'pokeball',     name: 'JAPAO',            desc: 'Pokemon — Capture-os todos nas terras do sol nascente',                           img: pokeballImg },
  { id: 'spider',       name: 'NEW YORK',         desc: "Marvel's Spider-Man — Heroi de NY balanca entre o Empire State e o Chrysler",     img: spiderImg   },
  { id: 'block',        name: 'SUECIA',           desc: 'Minecraft — O bloco de grama mais famoso nasceu nos fiordes suecos',              img: blockImg    },
  { id: 'peeper',       name: 'OCEANO PACIFICO',  desc: 'Subnautica — Sobreviva nas profundezas alienígenas do Pacifico',                  img: peepImg     },
  { id: 'd20',          name: 'BELGICA',          desc: "Baldur's Gate 3 — Role o D20 e decida o destino de Faerun",                       img: d20Img      },
];
