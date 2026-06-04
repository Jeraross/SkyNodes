const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const DIALOGUES: Record<string, string[]> = {
  welcomeAvd: [
    'Bem-vindo ao caminho dos Dados! Aqui vamos testar seus conhecimentos em visualizacao e analise.',
    'O caminho AVD comeca agora. Pronto para dominar os dados?',
  ],
  welcomeGrafos: [
    'Bem-vindo ao caminho dos Grafos! Vertices, arestas e algoritmos esperam por voce.',
    'O mundo dos grafos e vasto. Vamos ver o quanto voce conhece!',
  ],
  welcomeMix: [
    'Modo MIX ativado! Uma mistura explosiva de grafos e dados te espera.',
    'O desafio maximo comeca agora — grafos E dados juntos!',
  ],
  nodeHover: [
    'Clique para comecar esse no!',
    'Este no tem desafios interessantes...',
    'Pronto para essa etapa?',
  ],
  correctAnswer: [
    'Isso! Voce sabe do que esta falando!',
    'Excelente! Conhecimento confirmado!',
    'Muito bem! Continue assim!',
    'Perfeito! Essa era a resposta certa!',
  ],
  wrongAnswer: [
    'Nao foi dessa vez, mas a explicacao vai te ajudar a memorizar.',
    'Erramos para aprender! Leia bem a explicacao.',
    'Quase! Fique de olho na explicacao abaixo.',
  ],
  hint1: [
    'Aqui vai uma dica para te ajudar...',
    'Deixa eu te dar um empurrãozinho...',
  ],
  hint2: [
    'Segunda dica! Vamos la...',
    'Mais um pista para voce...',
  ],
  hint3: [
    'Ultima dica! Use com sabedoria...',
    'Terceira e ultima dica — aproveite!',
  ],
  hintExhausted: [
    'Ja usei todas as dicas deste no. Confie no que voce sabe!',
  ],
  skipUsed: [
    'Pulamos essa! Mas lembre: so tem mais um pulo no caminho.',
    'Questao pulada. Guarde bem o proximo pulo!',
  ],
  powerUpEliminate: [
    'Eliminei duas respostas erradas. Agora e mais facil!',
    'Metade das alternativas erradas saiu. Boa sorte!',
  ],
  powerUpAudience: [
    'A plateia votou! Leve em conta, mas confie em voce mesmo.',
    'Veja o que o publico acha. A decisao final e sua!',
  ],
  bossIntroGraph: [
    'Chegamos ao no BOSS! Aqui voce vai montar um grafo de verdade. Leia bem as propriedades!',
    'No boss! Hora de construir, nao so responder. Arraste os nos e conecte as arestas!',
  ],
  bossIntroChart: [
    'No boss! Agora monte o grafico correto. Arraste as barras para a posicao certa!',
    'Desafio final! Organize as barras como pedido no enunciado.',
  ],
  bossComplete: [
    'INCRIVEL! Voce construiu exatamente o que eu pedi. Mestre confirmado!',
    'Perfeito! Todas as propriedades satisfeitas. Voce e um verdadeiro mestre!',
  ],
  resultPerfect: [
    'Pontuacao perfeita! Simplesmente incrivel. O titulo de mestre e seu por direito!',
  ],
  resultGood: [
    'Otimo resultado! Voce domina o conteudo. A figurinha de maestria e sua!',
    'Muito bem! Pontuacao excelente. Continue estudando!',
  ],
  resultOk: [
    'Bom esforco! Com mais pratica voce chega la. Tente novamente!',
  ],
  leaderboard: [
    'Veja os melhores do Show do Grafao! Sera que voce esta no top 10?',
    'O leaderboard nao mente! Quem sera o proximo mestre?',
  ],
};

export function getDialogue(key: string): string {
  return pick(DIALOGUES[key] ?? ['...']);
}
