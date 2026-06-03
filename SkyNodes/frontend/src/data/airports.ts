export type Region = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';

export interface Airport {
  id: string;
  name: string;
  city: string;
  state: string;
  region: Region;
  lat: number;
  lng: number;
}

export const airports: Airport[] = [
  { id: 'REC', name: 'Aeroporto Internacional do Recife', city: 'Recife', state: 'PE', region: 'Nordeste', lat: -8.1265, lng: -34.9233 },
  { id: 'SSA', name: 'Aeroporto Internacional de Salvador', city: 'Salvador', state: 'BA', region: 'Nordeste', lat: -12.9086, lng: -38.3225 },
  { id: 'FOR', name: 'Aeroporto Internacional de Fortaleza', city: 'Fortaleza', state: 'CE', region: 'Nordeste', lat: -3.7763, lng: -38.5326 },
  { id: 'NAT', name: 'Aeroporto Internacional de Natal', city: 'Natal', state: 'RN', region: 'Nordeste', lat: -5.9111, lng: -35.2477 },
  { id: 'JPA', name: 'Aeroporto Internacional de João Pessoa', city: 'João Pessoa', state: 'PB', region: 'Nordeste', lat: -7.1459, lng: -34.9476 },
  { id: 'THE', name: 'Aeroporto de Teresina', city: 'Teresina', state: 'PI', region: 'Nordeste', lat: -5.0601, lng: -42.8236 },
  { id: 'GRU', name: 'Aeroporto Internacional de Guarulhos', city: 'São Paulo', state: 'SP', region: 'Sudeste', lat: -23.4356, lng: -46.4731 },
  { id: 'CGH', name: 'Aeroporto de Congonhas', city: 'São Paulo', state: 'SP', region: 'Sudeste', lat: -23.6265, lng: -46.6556 },
  { id: 'GIG', name: 'Aeroporto Internacional do Galeão', city: 'Rio de Janeiro', state: 'RJ', region: 'Sudeste', lat: -22.8100, lng: -43.2506 },
  { id: 'CNF', name: 'Aeroporto Internacional de Confins', city: 'Belo Horizonte', state: 'MG', region: 'Sudeste', lat: -19.6239, lng: -43.9689 },
  { id: 'VIX', name: 'Aeroporto de Vitória', city: 'Vitória', state: 'ES', region: 'Sudeste', lat: -20.2580, lng: -40.2858 },
  { id: 'BSB', name: 'Aeroporto Internacional de Brasília', city: 'Brasília', state: 'DF', region: 'Centro-Oeste', lat: -15.8711, lng: -47.9186 },
  { id: 'GYN', name: 'Aeroporto Internacional de Goiânia', city: 'Goiânia', state: 'GO', region: 'Centro-Oeste', lat: -16.6320, lng: -49.2207 },
  { id: 'CWB', name: 'Aeroporto Internacional de Curitiba', city: 'Curitiba', state: 'PR', region: 'Sul', lat: -25.5285, lng: -49.1758 },
  { id: 'FLN', name: 'Aeroporto Internacional de Florianópolis', city: 'Florianópolis', state: 'SC', region: 'Sul', lat: -27.6703, lng: -48.5521 },
  { id: 'POA', name: 'Aeroporto Internacional de Porto Alegre', city: 'Porto Alegre', state: 'RS', region: 'Sul', lat: -29.9944, lng: -51.1713 },
  { id: 'MAO', name: 'Aeroporto Internacional de Manaus', city: 'Manaus', state: 'AM', region: 'Norte', lat: -3.0386, lng: -60.0498 },
  { id: 'BEL', name: 'Aeroporto Internacional de Belém', city: 'Belém', state: 'PA', region: 'Norte', lat: -1.3792, lng: -48.4762 },
  { id: 'PVH', name: 'Aeroporto Internacional de Porto Velho', city: 'Porto Velho', state: 'RO', region: 'Norte', lat: -8.7093, lng: -63.9018 },
  { id: 'RBR', name: 'Aeroporto Internacional de Rio Branco', city: 'Rio Branco', state: 'AC', region: 'Norte', lat: -9.8697, lng: -67.8986 },
];

export const airportMap = new Map<string, Airport>(airports.map(a => [a.id, a]));
