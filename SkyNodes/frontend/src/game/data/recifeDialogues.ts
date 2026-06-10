import type { DialogueSequence } from '../types';

export const RECIFE_CHEGADA: DialogueSequence = {
  id: 'recife_chegada',
  lines: [
    { speaker: 'AGENTE_J',   text: 'Então é aqui que começa a missão.' },
    { speaker: 'PRESIDENTE', text: 'Exatamente, companheiro J. Recife é um dos poucos aeroportos que ainda possui energia.' },
    { speaker: 'AGENTE_J',   text: 'Energia não parece ser o mesmo que funcionamento.' },
    { speaker: 'PRESIDENTE', text: 'Os sistemas estão parcialmente ativos, mas as conexões com os outros aeroportos desapareceram.' },
    { speaker: 'AGENTE_J',   text: 'Em outras palavras, temos um ponto no mapa sem ligação com lugar algum.' },
    { speaker: 'PRESIDENTE', text: 'Os técnicos chamam esse ponto de vértice.' },
    { speaker: 'AGENTE_J',   text: 'Eu chamava de aeroporto quando ainda estava trabalhando.' },
    { speaker: 'LIA',        text: 'Agente J, finalmente alguém respondeu ao chamado.' },
    { speaker: 'AGENTE_J',   text: 'Você está presa dentro desse monitor?' },
    { speaker: 'LIA',        text: 'Não. Esta é apenas uma transmissão de emergência.' },
    { speaker: 'AGENTE_J',   text: 'Uma pena. Seria uma história mais interessante.' },
    { speaker: 'LIA',        text: 'Sou Lia, operadora responsável pelo sistema de reconstrução da malha aérea.' },
    { speaker: 'AGENTE_J',   text: 'Então me diga por onde começar.' },
    { speaker: 'LIA',        text: 'Recife é nosso primeiro vértice ativo. Precisamos conectá-lo a pelo menos outro aeroporto.' },
    { speaker: 'AGENTE_J',   text: 'E como fazemos isso?' },
    { speaker: 'LIA',        text: 'Criando uma rota. Em um grafo, essa conexão é chamada de aresta.' },
  ],
};

export const RECIFE_TUTORIAL_VERTICES: DialogueSequence = {
  id: 'recife_tutorial_vertices',
  lines: [
    { speaker: 'LIA',      text: 'Cada ponto da malha representa um aeroporto.' },
    { speaker: 'LIA',      text: 'Esses pontos são chamados de vértices.' },
    { speaker: 'AGENTE_J', text: 'Então Recife é um vértice.' },
    { speaker: 'LIA',      text: 'Exatamente.' },
    { speaker: 'AGENTE_J', text: 'E eu sou o sujeito que precisa impedir que ele continue sozinho.' },
  ],
};

export const RECIFE_TUTORIAL_ARESTAS: DialogueSequence = {
  id: 'recife_tutorial_arestas',
  lines: [
    { speaker: 'LIA',      text: 'João Pessoa está ao alcance dos nossos sistemas.' },
    { speaker: 'AGENTE_J', text: 'Consigo ver o aeroporto, mas não existe rota até ele.' },
    { speaker: 'LIA',      text: 'Clique na linha tracejada entre Recife e João Pessoa para criar a conexão.' },
    { speaker: 'LIA',      text: 'Essa linha é uma aresta.' },
    { speaker: 'AGENTE_J', text: 'Dois aeroportos, uma ligação.' },
    { speaker: 'LIA',      text: 'Agora eles são considerados vizinhos, pois existe uma conexão direta entre eles.' },
  ],
};

export const RECIFE_GLITCH_APARECE: DialogueSequence = {
  id: 'recife_glitch_aparece',
  lines: [
    { speaker: 'GLITCH_FRAGMENTO', text: 'CONEXÃO INVÁLIDA. VÉRTICE DEVE PERMANECER ISOLADO.', glitch: true },
    { speaker: 'AGENTE_J',         text: 'Parece que alguém não gostou da nossa rota.' },
    { speaker: 'LIA',               text: 'É um glitch. As ondas solares fragmentaram os programas de segurança.' },
    { speaker: 'GLITCH_FRAGMENTO', text: 'ORDEM: DIVIDIR. APAGAR. ISOLAR.', glitch: true },
    { speaker: 'AGENTE_J',         text: 'Ótimo. Minha primeira missão e já estou discutindo com um erro de computador.' },
  ],
};

export const RECIFE_PRE_PUZZLE: DialogueSequence = {
  id: 'recife_pre_puzzle',
  lines: [
    { speaker: 'LIA',      text: 'O glitch separou os sistemas do aeroporto em vários pontos.' },
    { speaker: 'LIA',      text: 'Conecte todos os terminais à torre de controle.' },
    { speaker: 'AGENTE_J', text: 'Então nenhum ponto pode ficar sozinho.' },
    { speaker: 'LIA',      text: 'Correto. Quando todos os vértices podem alcançar uns aos outros, temos um grafo conectado.' },
  ],
};

export const RECIFE_ENCERRAMENTO: DialogueSequence = {
  id: 'recife_encerramento',
  lines: [
    { speaker: 'GLITCH_FRAGMENTO', text: 'CONECTIVIDADE... RESTAURADA... ERRO...', glitch: true },
    { speaker: 'LIA',               text: 'Todos os setores estão conectados.' },
    { speaker: 'AGENTE_J',          text: 'Então Recife voltou a formar uma rede completa.' },
    { speaker: 'LIA',               text: 'E nossa primeira rota aérea também foi restaurada.' },
    { speaker: 'PRESIDENTE',        text: 'Excelente trabalho, companheiro J.' },
    { speaker: 'AGENTE_J',          text: 'Já pode pedir a primeira pizza.' },
    { speaker: 'PRESIDENTE',        text: 'As pizzas são entregues depois que o país for salvo.' },
    { speaker: 'AGENTE_J',          text: 'Isso não estava nos termos.' },
  ],
};

export const ALL_RECIFE_DIALOGUES: DialogueSequence[] = [
  RECIFE_CHEGADA,
  RECIFE_TUTORIAL_VERTICES,
  RECIFE_TUTORIAL_ARESTAS,
  RECIFE_GLITCH_APARECE,
  RECIFE_PRE_PUZZLE,
  RECIFE_ENCERRAMENTO,
];
