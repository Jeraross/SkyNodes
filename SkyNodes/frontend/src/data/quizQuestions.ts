import avdRaw    from '@banco/banco_questoes_avd.csv?raw';
import grafosRaw from '@banco/banco_questoes_grafos.csv?raw';

export type QuizDifficulty = 'Fácil' | 'Médio' | 'Difícil';
export type QuizCategory   = 'grafos' | 'avd' | 'mix';

export interface QuizQuestion {
  id: string;
  tema: string;
  pergunta: string;
  alternativas: [string, string, string, string];
  respostaCorreta: 'A' | 'B' | 'C' | 'D';
  explicacao: string;
  dificuldade: QuizDifficulty;
  categoria: 'grafos' | 'avd';
}

function parseCSV(raw: string, categoria: 'grafos' | 'avd'): QuizQuestion[] {
  const lines = raw.trim().split('\n').slice(1); // skip header
  return lines
    .map(line => {
      const cols = line.split(';');
      if (cols.length < 10) return null;
      return {
        id:              cols[0].trim(),
        tema:            cols[1].trim(),
        pergunta:        cols[2].trim(),
        alternativas:    [cols[3].trim(), cols[4].trim(), cols[5].trim(), cols[6].trim()] as [string,string,string,string],
        respostaCorreta: cols[7].trim().toUpperCase() as 'A' | 'B' | 'C' | 'D',
        explicacao:      cols[8].trim(),
        dificuldade:     cols[9].trim() as QuizDifficulty,
        categoria,
      };
    })
    .filter((q): q is QuizQuestion => q !== null);
}

export const QUESTIONS_AVD    = parseCSV(avdRaw,    'avd');
export const QUESTIONS_GRAFOS = parseCSV(grafosRaw, 'grafos');
export const QUESTIONS_ALL    = [...QUESTIONS_AVD, ...QUESTIONS_GRAFOS];

export function getQuestions(
  category: QuizCategory,
  difficulty: 'all' | QuizDifficulty,
  count: number,
): QuizQuestion[] {
  let pool: QuizQuestion[];
  if (category === 'grafos') pool = QUESTIONS_GRAFOS;
  else if (category === 'avd') pool = QUESTIONS_AVD;
  else pool = QUESTIONS_ALL;

  if (difficulty !== 'all') {
    pool = pool.filter(q => q.dificuldade === difficulty);
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
