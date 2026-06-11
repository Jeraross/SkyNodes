export type AtariSpriteId =
  | 'agente-j'
  | 'lia'
  | 'nodo-rec'
  | 'onda-for'
  | 'anomalia-ssa'
  | 'sistema-anac';

export type AtariSprite = {
  id: AtariSpriteId;
  rows: string[];
  palette: Record<string, number>;
};

const BLACK = 0x000000;
const WHITE = 0xf8f8f8;
const SKIN = 0xd89048;
const SKIN_LIGHT = 0xf0b068;
const HAIR = 0x302018;
const NAVY = 0x2848a8;
const CYAN = 0x30c8d8;
const RED = 0xd82828;
const ORANGE = 0xe87020;
const YELLOW = 0xf8d848;
const GREEN = 0x48d860;
const BLUE = 0x2868d8;
const MAGENTA = 0xb840d8;
const DARK_GRAY = 0x303030;

const characterPalette = {
  A: HAIR,
  B: SKIN,
  C: SKIN_LIGHT,
  D: NAVY,
  E: CYAN,
  F: BLACK,
  G: WHITE,
  H: RED,
};

export const ATARI_SPRITES: Record<AtariSpriteId, AtariSprite> = {
  'agente-j': {
    id: 'agente-j',
    palette: characterPalette,
    rows: [
      '......AAAAAA......',
      '.....AAAAAAAA.....',
      '....AABBBBBAA.....',
      '...AABCCCCBBA.....',
      '...ABCGFFGCBA.....',
      '...ABCFFFFCBA.....',
      '...ABCCCCCCBA.....',
      '....AABGGBBA......',
      '.....EABBBE.......',
      '.....EEBBEE.......',
      '....DDDEEDDD......',
      '...DDDEDDDEDD.....',
      '..DDDEDDDDDEDD....',
      '..DDDDDEEDDDD.....',
      '..DDDHDFFDHDD.....',
      '...DDDDFFDDDD.....',
      '....DDDFFDDD......',
      '.....DD..DD.......',
      '.....DD..DD.......',
      '.....DD..DD.......',
      '.....DD..DD.......',
      '.....FF..FF.......',
      '....FFF..FFF......',
      '...FFFF..FFFF.....',
    ],
  },
  lia: {
    id: 'lia',
    palette: {
      ...characterPalette,
      I: ORANGE,
      J: YELLOW,
    },
    rows: [
      '.....AAAAAAAA.....',
      '....AAAAAAAAAA....',
      '...AAABBBBBAAA....',
      '...AABCCCCBBAA....',
      '..AAACGFFGCAAA....',
      '..AAACFFFFCAAA....',
      '...AABCCCCBBA.....',
      '....AAJJJJAA......',
      '......BBBB........',
      '.....IIIIII.......',
      '....IIJIIJII......',
      '...IIJIIIIJII.....',
      '..IIIJJIIJJIII....',
      '..IIIIIIIIIIII....',
      '..IIJIIHHIIJII....',
      '...IIIIHHIIII.....',
      '....IIIIIIII......',
      '.....II..II.......',
      '.....II..II.......',
      '.....II..II.......',
      '.....II..II.......',
      '.....FF..FF.......',
      '....FFF..FFF......',
      '...FFFF..FFFF.....',
    ],
  },
  'nodo-rec': {
    id: 'nodo-rec',
    palette: {
      R: RED,
      O: ORANGE,
      Y: YELLOW,
      G: GREEN,
      W: WHITE,
      D: DARK_GRAY,
    },
    rows: [
      '.....RRRRRR.....',
      '...RRRYYYYRRR...',
      '..RRYYRRRRYYRR..',
      '..RYRRGGWWRRYR..',
      '..RYRRDDDD RYR..',
      '..RRYYRRRRYYRR..',
      '...RRRYYYYRRR...',
      '.....RRRRRR.....',
      '.......RR.......',
      '....RRRRRRRR....',
      '..RRROOOOOORRR..',
      '.RROODDDDDDOORR.',
      '.RRODGGDDGGDORR.',
      '..RROODDDDOORR..',
      '....RRRRRRRR....',
      '...RR..RR..RR...',
    ],
  },
  'onda-for': {
    id: 'onda-for',
    palette: {
      C: CYAN,
      B: BLUE,
      W: WHITE,
      R: RED,
      O: ORANGE,
    },
    rows: [
      '...CCCC....CCCC.',
      '..CCBBCC..CCBBCC',
      '.CCBBBBCCCCBBBB.',
      'CCBBWWBBBBWWBBC',
      '.CBBBBBBBBBBBBC.',
      '..CCBBBBBBBBCC..',
      '....CCBBBBCC....',
      'CCCC..CCCC..CCCC',
      'BBBBCCCCCCCCBBBB',
      '...BBRRRRRRBB...',
      '..BBRROOOORRBB..',
      '..BRROWWWWORRB..',
      '...BBRRRRRRBB...',
      'CCCC..CCCC..CCCC',
      '.BBBBCCCCCCCCBB.',
      '..CCCC....CCCC..',
    ],
  },
  'anomalia-ssa': {
    id: 'anomalia-ssa',
    palette: {
      M: MAGENTA,
      R: RED,
      O: ORANGE,
      W: WHITE,
      D: DARK_GRAY,
    },
    rows: [
      '..MMMMMMMMMMMM..',
      '.MMRRRRRRRRRRMM.',
      'MMRROOOOOOOORRMM',
      'MRROWWOWWOWORRM.',
      'MRROOOOOOOOORRM.',
      'MMRRDDDDDDRRMM..',
      '.MMMMMMMMMMMM...',
      '...MM....MM.....',
      '..MMMR..RMMM....',
      '.MMRMRRRRMRMM...',
      'MMRMMRRRRMMRMM..',
      'MRRMMRWWRMMRRM..',
      'MMRMMRRRRMMRMM..',
      '.MMRMRRRRMRMM...',
      '..MMMMMMMMMM....',
      '...MM....MM.....',
    ],
  },
  'sistema-anac': {
    id: 'sistema-anac',
    palette: {
      G: GREEN,
      C: CYAN,
      W: WHITE,
      R: RED,
      D: DARK_GRAY,
      Y: YELLOW,
    },
    rows: [
      '...GGGGGGGGGG...',
      '..GGCCCCCCCCGG..',
      '.GGCCWWCCWWCCGG.',
      '.GCCDDCCCCDDCCG.',
      '.GCCCCRRRRCCCCG.',
      '.GGCCCCCCCCCCGG.',
      '..GGGGGGGGGGGG..',
      '....GG....GG....',
      '..GGGGYYYYGGGG..',
      '.GGDGGYYYYGGDGG.',
      'GGDDGGYYYYGGDDGG',
      'GDDDGGRRRRGGDDDG',
      'GGDDGGYYYYGGDDGG',
      '.GGDGGYYYYGGDGG.',
      '..GGGGGGGGGGGG..',
      '....GG....GG....',
    ],
  },
};

export function getAtariSprite(id: AtariSpriteId): AtariSprite {
  return ATARI_SPRITES[id];
}

export function getSpriteMetrics(sprite: AtariSprite): { width: number; height: number } {
  return {
    width: Math.max(...sprite.rows.map(row => row.length)),
    height: sprite.rows.length,
  };
}
