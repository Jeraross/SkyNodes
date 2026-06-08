import type { DialogueScript } from '../logic/dialogueEngine';

export type AirportTaskKind = 'restore-network' | 'graph' | 'chart' | 'dialogue';

export interface AirportNpc {
  id: string;
  name: string;
  role: string;
  lines: string[];
  sprite: 'antonio' | 'carlos' | 'ana' | 'controller' | 'passenger';
  dialogue: DialogueScript;
}

export interface AirportTask {
  id: string;
  title: string;
  kind: AirportTaskKind;
  reward: number;
  prompt: string;
}

export interface AirportShopOption {
  label: string;
  amount: number;
  cost: number;
}

export interface AirportMenuData {
  airportId: string;
  title: string;
  status: string;
  npcs: AirportNpc[];
  tasks: AirportTask[];
  shop: {
    fuelOptions: AirportShopOption[];
  };
}

const defaultShop = {
  fuelOptions: [
    { label: '+20 COMBUSTÍVEL', amount: 20, cost: 120 },
    { label: '+50 COMBUSTÍVEL', amount: 50, cost: 260 },
  ],
};

// ─── REC — Intro ──────────────────────────────────────────────────────────────
// Antônio acabou de pousar. No dia seguinte, todas as comunicações caem.

const carlosRecDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'carlos',
      text: 'ANTÔNIO, FICOU SABENDO? AS COMUNICAÇÕES COM SALVADOR CAÍRAM ONTEM À NOITE. HOJE DE MANHÃ, FORTALEZA TAMBÉM.',
      next: 'antonio-acabei',
    },
    'antonio-acabei': {
      speakerId: 'antonio',
      text: 'ACABEI DE SAIR DO AVIÃO. NÃO TENHO IDEIA DO QUE ACONTECEU.',
      choices: [
        { label: 'O que os outros pilotos estão dizendo?', next: 'carlos-pilotos' },
        { label: 'Consigo sair daqui hoje?', next: 'carlos-saida' },
      ],
    },
    'carlos-pilotos': {
      speakerId: 'carlos',
      text: 'OS PILOTOS COM SISTEMA AUTOMÁTICO NÃO CONSEGUEM DECOLAR. OS PAINÉIS NÃO RECEBEM SINAL DE ROTA.',
      next: 'antonio-manual',
    },
    'antonio-manual': {
      speakerId: 'antonio',
      text: 'MEU AVIÃO É TOTALMENTE MANUAL. NÃO DEPENDO DE SINAL.',
      next: 'carlos-eu-sei',
    },
    'carlos-eu-sei': {
      speakerId: 'carlos',
      text: 'EU SEI. POR ISSO ESTOU FALANDO COM VOCÊ.',
      next: 'antonio-familia',
    },
    'antonio-familia': {
      speakerId: 'antonio',
      text: 'MINHA FAMÍLIA ESTÁ EM JOÃO PESSOA. PRECISO SABER SE ESTÃO BEM.',
      next: 'carlos-entendo',
    },
    'carlos-entendo': {
      speakerId: 'carlos',
      text: 'ENTENDO. SE FOR, ABASTEÇA ANTES. NÃO HÁ PREVISÃO DE QUANDO VOLTA A TER COORDENAÇÃO CENTRAL.',
    },
    'carlos-saida': {
      speakerId: 'carlos',
      text: 'TECNICAMENTE SIM. MAS NÃO HÁ COMUNICAÇÃO COM NENHUM AEROPORTO DE DESTINO.',
      next: 'antonio-voo-cego',
    },
    'antonio-voo-cego': {
      speakerId: 'antonio',
      text: 'VOO COM MAPA DE PAPEL SE PRECISAR.',
      next: 'carlos-mapa',
    },
    'carlos-mapa': {
      speakerId: 'carlos',
      text: 'TENHO UM AQUI. DO NORDESTE. GUARDA. PODE PRECISAR.',
    },
  },
};

const liaRecDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'lia',
      text: 'MEU VOO PARA SALVADOR CANCELOU. DISSERAM QUE É SÓ TEMPORÁRIO, MAS O PAINEL DE PARTIDAS ESTÁ APAGADO HÁ HORAS.',
      next: 'antonio-quando',
    },
    'antonio-quando': {
      speakerId: 'antonio',
      text: 'HÁ QUANTAS HORAS?',
      next: 'lia-desde',
    },
    'lia-desde': {
      speakerId: 'lia',
      text: 'DESDE ONTEM À NOITE. DORMI AQUI NA CADEIRA. PENSEI QUE FOSSE RESOLVER.',
      choices: [
        { label: 'Tem alguém te esperando lá?', next: 'lia-mae' },
        { label: 'Já tentou ligar pra alguma companhia?', next: 'lia-ligou' },
      ],
    },
    'lia-mae': {
      speakerId: 'lia',
      text: 'MINHA MÃE. ELA MORA SOZINHA.',
      next: 'antonio-entendo-lia',
    },
    'antonio-entendo-lia': {
      speakerId: 'antonio',
      text: 'ENTENDO.',
      next: 'lia-voce-piloto',
    },
    'lia-voce-piloto': {
      speakerId: 'lia',
      text: 'VOCÊ É PILOTO, NÃO É? CONSEGUE VOAR?',
      next: 'antonio-vou-tentar',
    },
    'antonio-vou-tentar': {
      speakerId: 'antonio',
      text: 'AINDA ESTOU TENTANDO ENTENDER O QUE ACONTECEU. MAS SIM, EU CONSIGO VOAR.',
    },
    'lia-ligou': {
      speakerId: 'lia',
      text: 'CELULAR SEM SINAL DESDE ONTEM. TELEFONE FIXO DO AEROPORTO TAMBÉM. NÃO É SÓ O VOO.',
      next: 'antonio-parece-maior',
    },
    'antonio-parece-maior': {
      speakerId: 'antonio',
      text: 'PARECE MAIOR QUE UM PROBLEMA DE ROTA.',
      next: 'lia-isso-me-preocupa',
    },
    'lia-isso-me-preocupa': {
      speakerId: 'lia',
      text: 'ESSA PARTE É A QUE MAIS ME PREOCUPA.',
    },
  },
};

const anaRecDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'ana',
      text: 'ANTÔNIO. A PARDAL-01 ESTÁ ABASTECIDA. VOCÊ QUER SAIR HOJE?',
      next: 'antonio-ainda-nao-sei',
    },
    'antonio-ainda-nao-sei': {
      speakerId: 'antonio',
      text: 'AINDA ESTOU DECIDINDO. O QUE VOCÊ ESTÁ OUVINDO POR AÍ?',
      next: 'ana-ouvindo',
    },
    'ana-ouvindo': {
      speakerId: 'ana',
      text: 'QUE OS SISTEMAS ELETRÔNICOS DE ROTA PARARAM TODOS AO MESMO TEMPO. OS MECÂNICOS MAIS VELHOS ESTÃO DIZENDO QUE PARECE COISA DE TEMPESTADE SOLAR.',
      choices: [
        { label: 'Tempestade solar faz isso?', next: 'ana-solar' },
        { label: 'Quanto combustível cabe na Pardal?', next: 'ana-combustivel' },
      ],
    },
    'ana-solar': {
      speakerId: 'ana',
      text: 'NÃO SEI. NÃO SOU ASTRÔNOMA. SÓ SEI QUE O ALTERNADOR DA PARDAL-01 É MECÂNICO. SE FOR ISSO, ELA VOA.',
      next: 'antonio-bom-saber',
    },
    'antonio-bom-saber': {
      speakerId: 'antonio',
      text: 'BOM SABER.',
      next: 'ana-mas-voa',
    },
    'ana-mas-voa': {
      speakerId: 'ana',
      text: 'ELA NÃO É BONITA. MAS VOA.',
    },
    'ana-combustivel': {
      speakerId: 'ana',
      text: 'TANQUE CHEIO DÁ PRA JOÃO PESSOA COM FOLGA. SE FOR MAIS LONGE, CALCULE ANTES DE SAIR.',
      next: 'antonio-obrigado-ana',
    },
    'antonio-obrigado-ana': {
      speakerId: 'antonio',
      text: 'OBRIGADO, ANA.',
      next: 'ana-vai-com-cuidado',
    },
    'ana-vai-com-cuidado': {
      speakerId: 'ana',
      text: 'VAI COM CUIDADO. E SE A ROTA TIVER COM AQUELAS COISAS NO CÉU QUE OS OUTROS PILOTOS ESTÃO DESCREVENDO, NÃO TENTE PASSAR NO SUSTO.',
    },
  },
};

// ─── JPA — Missão 1 ───────────────────────────────────────────────────────────
// Antônio chega procurando a família. É barrado. O prefeito quer conversar.

const controladorJpaDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'controller',
      text: 'SENHOR ANTÔNIO. O PREFEITO GOSTARIA DE FALAR COM O SENHOR ANTES DE QUALQUER PARTIDA DAQUI.',
      next: 'antonio-nao-trabalho',
    },
    'antonio-nao-trabalho': {
      speakerId: 'antonio',
      text: 'EU NÃO TRABALHO PARA O PREFEITO. ESTOU PROCURANDO MINHA FAMÍLIA.',
      next: 'control-eu-entendo',
    },
    'control-eu-entendo': {
      speakerId: 'controller',
      text: 'EU ENTENDO, SENHOR. MAS A SITUAÇÃO ESTÁ COMPLICADA E O PREFEITO TEM AUTORIDADE SOBRE O AEROPORTO AGORA.',
      choices: [
        { label: 'Desde quando prefeito manda em aeroporto?', next: 'control-desde' },
        { label: 'Onde está minha família?', next: 'control-familia' },
      ],
    },
    'control-desde': {
      speakerId: 'controller',
      text: 'DESDE QUE A ANAC NÃO RESPONDE MAIS. ALGUÉM PRECISAVA TOMAR DECISÕES.',
      next: 'antonio-vai-la',
    },
    'antonio-vai-la': {
      speakerId: 'antonio',
      text: 'CERTO. VOU FALAR COM ELE.',
    },
    'control-familia': {
      speakerId: 'controller',
      text: 'NÃO SEI DIZER, SENHOR. AS COMUNICAÇÕES INTERNAS DA CIDADE TAMBÉM ESTÃO COM PROBLEMAS. O PREFEITO PODE SABER MAIS.',
      next: 'antonio-entende',
    },
    'antonio-entende': {
      speakerId: 'antonio',
      text: 'ENTENDIDO.',
    },
  },
};

const prefeitoJpaDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'controller',
      text: 'SENHOR ANTÔNIO. RUI FONSECA, PREFEITO DE JOÃO PESSOA. OBRIGADO POR VIR.',
      next: 'antonio-nao-tive-escolha',
    },
    'antonio-nao-tive-escolha': {
      speakerId: 'antonio',
      text: 'NÃO TIVE MUITA ESCOLHA. ONDE ESTÁ MINHA FAMÍLIA?',
      next: 'prefeito-familia',
    },
    'prefeito-familia': {
      speakerId: 'controller',
      text: 'OS BAIRROS ESTÃO SEM COMUNICAÇÃO MAS SEM RELATO DE FERIDOS. A CIDADE ESTÁ FUNCIONANDO. SÓ OS SISTEMAS ELETRÔNICOS QUE PARARAM.',
      next: 'antonio-o-que-voce-quer',
    },
    'antonio-o-que-voce-quer': {
      speakerId: 'antonio',
      text: 'O QUE VOCÊ QUER DE MIM?',
      next: 'prefeito-direto',
    },
    'prefeito-direto': {
      speakerId: 'controller',
      text: 'PRECISO CHEGAR EM BRASÍLIA. VOCÊ TEM O ÚNICO AVIÃO QUE VOA SEM SISTEMA. EU TENHO COMBUSTÍVEL E AUTORIZAÇÃO DE PISTA.',
      choices: [
        { label: 'Não é assim que funciona.', next: 'prefeito-eu-sei' },
        { label: 'O que você espera encontrar em Brasília?', next: 'prefeito-brasilia' },
      ],
    },
    'prefeito-eu-sei': {
      speakerId: 'controller',
      text: 'EU SEI. MAS NADA ESTÁ FUNCIONANDO COMO DEVERIA. PRECISO DE RESPOSTA DO GOVERNO FEDERAL. MINHA CIDADE ESTÁ CEGA.',
      next: 'antonio-e-a-minha-familia',
    },
    'antonio-e-a-minha-familia': {
      speakerId: 'antonio',
      text: 'E MINHA FAMÍLIA?',
      next: 'prefeito-promessa',
    },
    'prefeito-promessa': {
      speakerId: 'controller',
      text: 'QUANDO VOLTAR DE BRASÍLIA, VOCÊ VEM DE VOLTA. E EU GARANTO QUE SUA FAMÍLIA FICA BEM CUIDADA ENQUANTO VOCÊ NÃO ESTÁ. TENHO PESSOAS DE CONFIANÇA.',
      next: 'antonio-nao-e-negocio',
    },
    'antonio-nao-e-negocio': {
      speakerId: 'antonio',
      text: 'NÃO GOSTO DESSE TIPO DE ACORDO.',
      next: 'prefeito-eu-tambem',
    },
    'prefeito-eu-tambem': {
      speakerId: 'controller',
      text: 'EU TAMBÉM NÃO. MAS É O QUE TEMOS.',
    },
    'prefeito-brasilia': {
      speakerId: 'controller',
      text: 'RESPOSTAS. O QUE ACONTECEU. POR QUANTO TEMPO. O QUE FAZER. SEM ISSO, EU ESTOU SÓ IMPROVISANDO.',
      next: 'antonio-todos-improvisando',
    },
    'antonio-todos-improvisando': {
      speakerId: 'antonio',
      text: 'TODO MUNDO ESTÁ IMPROVISANDO.',
      next: 'prefeito-diferenca',
    },
    'prefeito-diferenca': {
      speakerId: 'controller',
      text: 'SIM. MAS EM BRASÍLIA PELO MENOS ALGUÉM DEVE SABER O QUE CAUSOU ISSO. VOCÊ NÃO QUER SABER TAMBÉM?',
      next: 'antonio-quero',
    },
    'antonio-quero': {
      speakerId: 'antonio',
      text: 'QUERO.',
    },
  },
};

// ─── Aeroportos no caminho para BSB ──────────────────────────────────────────
// Diálogos curtos e naturais de pessoas tentando entender o que aconteceu

const passengerGenJourneyDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'passenger',
      text: 'VOCÊ É PILOTO? CONSEGUE ME DIZER SE AS COISAS VOLTAM LOGO?',
      next: 'antonio-honesto',
    },
    'antonio-honesto': {
      speakerId: 'antonio',
      text: 'NÃO SEI. AINDA ESTOU DESCOBRINDO O QUE ACONTECEU.',
      choices: [
        { label: 'Você está bem?', next: 'pass-bem' },
        { label: 'Há quanto tempo está aqui?', next: 'pass-tempo' },
      ],
    },
    'pass-bem': {
      speakerId: 'passenger',
      text: 'TO. SÓ ANSIOSO. MINHA MULHER NÃO SABE ONDE EU ESTOU. OS CELULARES NÃO FUNCIONAM.',
      next: 'antonio-mesmo-aqui',
    },
    'antonio-mesmo-aqui': {
      speakerId: 'antonio',
      text: 'MESMO PROBLEMA AQUI.',
      next: 'pass-pelo-menos',
    },
    'pass-pelo-menos': {
      speakerId: 'passenger',
      text: 'PELO MENOS VOCÊ PODE VOAR. EU SÓ POSSO ESPERAR.',
    },
    'pass-tempo': {
      speakerId: 'passenger',
      text: 'DESDE ONTEM. DORMI NA CADEIRA. DISSERAM QUE O AEROPORTO NÃO PODE LIBERAR NINGUÉM SEM COMUNICAÇÃO COM O DESTINO.',
      next: 'antonio-faz-sentido',
    },
    'antonio-faz-sentido': {
      speakerId: 'antonio',
      text: 'FAZ SENTIDO.',
      next: 'pass-nao-ajuda',
    },
    'pass-nao-ajuda': {
      speakerId: 'passenger',
      text: 'FAZ. MAS NÃO AJUDA.',
    },
  },
};

// ─── BSB — Descoberta ─────────────────────────────────────────────────────────
// Brasília confirma: foi uma tempestade solar. Ninguém planejou para isso.

const helenaDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'helena',
      text: 'VOCÊ É O PILOTO QUE TROUXE O PREFEITO DE JOÃO PESSOA?',
      next: 'antonio-sim',
    },
    'antonio-sim': {
      speakerId: 'antonio',
      text: 'SIM. O QUE ACONTECEU AQUI?',
      next: 'helena-tempestade',
    },
    'helena-tempestade': {
      speakerId: 'helena',
      text: 'TEMPESTADE SOLAR. A MAIOR EM SETENTA ANOS. APAGOU OS SISTEMAS DE NAVEGAÇÃO, COMUNICAÇÃO E CONTROLE DE TRÁFEGO AÉREO DO PAÍS INTEIRO.',
      choices: [
        { label: 'Por quanto tempo?', next: 'helena-tempo' },
        { label: 'Tem como consertar?', next: 'helena-conserto' },
      ],
    },
    'helena-tempo': {
      speakerId: 'helena',
      text: 'NÃO SABEMOS. OS ENGENHEIROS ESTÃO TRABALHANDO. MAS OS SISTEMAS SÃO INTERDEPENDENTES. UM PRECISA DO OUTRO PARA VOLTAR.',
      next: 'antonio-paradoxo',
    },
    'antonio-paradoxo': {
      speakerId: 'antonio',
      text: 'ENTÃO NINGUÉM CONSEGUE RELIGAR NADA PORQUE TUDO PRECISA DE TUDO PARA FUNCIONAR.',
      next: 'helena-mais-ou-menos',
    },
    'helena-mais-ou-menos': {
      speakerId: 'helena',
      text: 'MAIS OU MENOS ISSO. A ÚNICA COISA QUE FUNCIONA É O QUE É MECÂNICO. COMO O SEU AVIÃO.',
      next: 'antonio-entao-eu',
    },
    'antonio-entao-eu': {
      speakerId: 'antonio',
      text: 'ENTÃO EU SOU UM DOS POUCOS QUE CONSEGUE VOAR.',
      next: 'helena-por-enquanto',
    },
    'helena-por-enquanto': {
      speakerId: 'helena',
      text: 'POR ENQUANTO, SIM. NÃO HÁ MUITO QUE POSSAMOS PEDIR. MAS SE VOCÊ PUDER IR VERIFICANDO OS AEROPORTOS NO CAMINHO, AJUDARIA.',
    },
    'helena-conserto': {
      speakerId: 'helena',
      text: 'OS ENGENHEIROS ACHAM QUE SIM. LEVA TEMPO. CADA AEROPORTO TEM QUE SER RECONECTADO MANUALMENTE.',
      next: 'antonio-quanto-tempo',
    },
    'antonio-quanto-tempo': {
      speakerId: 'antonio',
      text: 'QUANTO TEMPO?',
      next: 'helena-semanas',
    },
    'helena-semanas': {
      speakerId: 'helena',
      text: 'SEMANAS. TALVEZ MESES PARA TUDO. OS AEROPORTOS MAIORES PRIMEIRO. DEPOIS OS REGIONAIS.',
    },
  },
};

const caioDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'caio',
      text: 'SEU AVIÃO VOA NO MANUAL? ISSO É RARO HOJE EM DIA.',
      next: 'antonio-aprendi-assim',
    },
    'antonio-aprendi-assim': {
      speakerId: 'antonio',
      text: 'APRENDI ASSIM. NUNCA TROQUEI.',
      next: 'caio-bom',
    },
    'caio-bom': {
      speakerId: 'caio',
      text: 'BOM. PORQUE OS MAPAS DE ROTA SÃO ANALÓGICOS. SE VOCÊ PUDER IR PASSANDO PELOS AEROPORTOS, PODE AJUDAR A ENTENDER O QUE AINDA ESTÁ DE PÉ.',
      choices: [
        { label: 'O que exatamente você precisa saber?', next: 'caio-precisa' },
        { label: 'Eu só quero voltar pra João Pessoa.', next: 'caio-entende' },
      ],
    },
    'caio-precisa': {
      speakerId: 'caio',
      text: 'QUAIS AEROPORTOS AINDA TÊM COMBUSTÍVEL. QUAIS TÊM PISTA OPERACIONAL. SE EXISTEM ROTAS ENTRE ELES.',
      next: 'antonio-isso-eu-faco',
    },
    'antonio-isso-eu-faco': {
      speakerId: 'antonio',
      text: 'ISSO EU CONSIGO FAZER ENQUANTO VIAJO.',
      next: 'caio-e-o-suficiente',
    },
    'caio-e-o-suficiente': {
      speakerId: 'caio',
      text: 'É O SUFICIENTE. INFORMAÇÃO É O QUE MAIS FALTA AGORA.',
    },
    'caio-entende': {
      speakerId: 'caio',
      text: 'ENTENDO. QUAL ROTA VOCÊ VAI TOMAR?',
      next: 'antonio-ainda-decidindo',
    },
    'antonio-ainda-decidindo': {
      speakerId: 'antonio',
      text: 'AINDA ESTOU DECIDINDO. AS ROTAS DIRETAS ESTÃO COM PROBLEMA.',
      next: 'caio-anomalias',
    },
    'caio-anomalias': {
      speakerId: 'caio',
      text: 'SIM. OS PILOTOS ESTÃO RELATANDO DISTÚRBIOS ELETROMAGNÉTICOS EM ALGUMAS FAIXAS DO CÉU. COISAS ESTRANHAS. FORMAS QUE NÃO DEVERIAM ESTAR LÁ.',
      next: 'antonio-que-tipo',
    },
    'antonio-que-tipo': {
      speakerId: 'antonio',
      text: 'QUE TIPO DE FORMAS?',
      next: 'caio-poligonais',
    },
    'caio-poligonais': {
      speakerId: 'caio',
      text: 'POLIGONAIS. GEOMÉTRICAS. NINGUÉM SABE O QUE SÃO. MAS ONDE APARECEM, OS INSTRUMENTOS ENLOUQUECEM.',
    },
  },
};

// ─── Retorno — rotas bloqueadas, Antônio força desvios ───────────────────────
// Tempestades e anomalias solares forçam rotas alternativas pelo Brasil inteiro

const renataDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'renata',
      text: 'A ROTA DIRETA PARA O NORDESTE ESTÁ FECHADA. TEMPESTADE SEVERA EM TODA AQUELA FAIXA.',
      next: 'antonio-desde-quando',
    },
    'antonio-desde-quando': {
      speakerId: 'antonio',
      text: 'DESDE QUANDO?',
      next: 'renata-ontem',
    },
    'renata-ontem': {
      speakerId: 'renata',
      text: 'ONTEM À TARDE. OS SISTEMAS DE PREVISÃO ANALÓGICOS INDICAM PELO MENOS MAIS DOIS DIAS.',
      choices: [
        { label: 'Tem rota alternativa?', next: 'renata-alternativa' },
        { label: 'E as anomalias? Vi algo estranho no caminho.', next: 'renata-anomalias' },
      ],
    },
    'renata-alternativa': {
      speakerId: 'renata',
      text: 'TEM. MAS VAI DAR UMA VOLTA GRANDE. VOCÊ TEM COMBUSTÍVEL?',
      next: 'antonio-quanto-aguenta',
    },
    'antonio-quanto-aguenta': {
      speakerId: 'antonio',
      text: 'DEPENDE DA ROTA. ME MOSTRA O QUE TEM.',
      next: 'renata-mapa',
    },
    'renata-mapa': {
      speakerId: 'renata',
      text: 'OLHA AQUI NO MAPA. SE VOCÊ PASSA POR AQUI E POR AQUI, CHEGA. MAIS LONGO, MAS ESTÁVEL.',
    },
    'renata-anomalias': {
      speakerId: 'renata',
      text: 'DUAS ROTAS BLOQUEADAS POR ELAS AQUI NA REGIÃO. OS PILOTOS QUE TENTARAM PASSAR VOLTARAM. DISSERAM QUE OS INSTRUMENTOS TODOS TRAVARAM.',
      next: 'antonio-como-passa',
    },
    'antonio-como-passa': {
      speakerId: 'antonio',
      text: 'COMO SE PASSA POR ELAS?',
      next: 'renata-nao-sei',
    },
    'renata-nao-sei': {
      speakerId: 'renata',
      text: 'AINDA ESTAMOS TENTANDO ENTENDER. UM PILOTO DISSE QUE CONSEGUIU PASSAR DEPOIS DE MAPEAR AS BORDAS DA COISA. COMO SE ELA TIVESSE UMA ESTRUTURA.',
    },
  },
};

const bentoMaoDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'bento',
      text: 'MANAUS JÁ VIVIA ISOLADA ANTES DISSO. A DIFERENÇA É QUE AGORA TODO MUNDO ESTÁ NO MESMO BARCO.',
      next: 'antonio-como-esta-aqui',
    },
    'antonio-como-esta-aqui': {
      speakerId: 'antonio',
      text: 'COMO ESTÁ A SITUAÇÃO AQUI?',
      next: 'bento-calmo',
    },
    'bento-calmo': {
      speakerId: 'bento',
      text: 'MAIS CALMO DO QUE VOCÊ ESPERARIA. A GENTE JÁ SABIA VOAR SEM SISTEMA. SÓ ESQUECEU POR UM TEMPO.',
      choices: [
        { label: 'Conhece as rotas desta região de memória?', next: 'bento-memoria' },
        { label: 'Viu as anomalias por aqui?', next: 'bento-anomalia' },
      ],
    },
    'bento-memoria': {
      speakerId: 'bento',
      text: 'A MAIORIA. AS ESTRADAS AÉREAS DO AMAZONAS NÃO MUDARAM EM QUARENTA ANOS. SÓ OS SISTEMAS QUE MUDARAM.',
      next: 'antonio-isso-ajuda',
    },
    'antonio-isso-ajuda': {
      speakerId: 'antonio',
      text: 'ISSO AJUDA MUITO.',
      next: 'bento-qualquer-coisa',
    },
    'bento-qualquer-coisa': {
      speakerId: 'bento',
      text: 'SE PRECISAR DE ROTA, ME PERGUNTA. NÃO TENHO MAPA ELETRÔNICO MAS TENHO A CABEÇA.',
    },
    'bento-anomalia': {
      speakerId: 'bento',
      text: 'VI. NO RIO PRIMEIRO. ACHEI QUE ERA DISTÚRBIO VISUAL. DEPOIS APARECEU NO CÉU. COISA GEOMÉTRICA, PARADA NO AR.',
      next: 'antonio-passou-por-ela',
    },
    'antonio-passou-por-ela': {
      speakerId: 'antonio',
      text: 'VOCÊ PASSOU POR ELA?',
      next: 'bento-dei-volta',
    },
    'bento-dei-volta': {
      speakerId: 'bento',
      text: 'DEI A VOLTA. NÃO SOU HERÓI. MAS OBSERVEI. ELA TEM BORDAS DEFINIDAS. NÃO É ALEATÓRIO.',
    },
  },
};

// ─── Aeroporto genérico ───────────────────────────────────────────────────────

function makeFallbackDialogue(airportId: string): DialogueScript {
  return {
    start: 'abertura',
    nodes: {
      abertura: {
        speakerId: 'controller',
        text: `AEROPORTO ${airportId}. O SENHOR É O PRIMEIRO AVIÃO QUE POUSA AQUI DESDE QUE OS SISTEMAS CAÍRAM.`,
        choices: [
          { label: 'Como está a situação aqui?', next: 'situacao' },
          { label: 'Tem combustível disponível?', next: 'combustivel' },
        ],
      },
      situacao: {
        speakerId: 'controller',
        text: 'ESTÁVEL. AS PESSOAS ESTÃO ASSUSTADAS MAS NINGUÉM SE MACHUCOU. SÓ SEM COMUNICAÇÃO COM NENHUM LUGAR.',
        next: 'antonio-igual-todo-lado',
      },
      'antonio-igual-todo-lado': {
        speakerId: 'antonio',
        text: 'IGUAL EM TODO LADO.',
      },
      combustivel: {
        speakerId: 'controller',
        text: 'TEM. OS TANQUES SÃO MECÂNICOS. NÃO DEPENDEM DO SISTEMA ELETRÔNICO.',
        next: 'antonio-bom',
      },
      'antonio-bom': {
        speakerId: 'antonio',
        text: 'BOM. VOU PRECISAR.',
      },
    },
  };
}

// ─── Dados dos aeroportos ─────────────────────────────────────────────────────

export const AIRPORT_MENUS: Record<string, AirportMenuData> = {
  REC: {
    airportId: 'REC',
    title: 'AEROPORTO DO RECIFE',
    status: 'TUTORIAL DA MALHA LOCAL - RECIFE ISOLADO',
    npcs: [
      {
        id: 'carlos',
        name: 'Controlador Carlos',
        role: 'Tutorial da malha aerea',
        sprite: 'carlos',
        lines: [
          'Antes de decolar, precisamos entender o que ainda existe na malha de Recife.',
          'Valide os pontos e conexoes simples. Depois eu libero o mapeamento para Joao Pessoa.',
        ],
        dialogue: carlosRecDialogue,
      },
      {
        id: 'lia',
        name: 'Passageira Lia',
        role: 'Passageira sem voo',
        sprite: 'passenger',
        lines: [
          'Meu voo para Salvador cancelou. Estou aqui desde ontem.',
          'Os celulares não têm sinal. Nem o telefone fixo.',
        ],
        dialogue: liaRecDialogue,
      },
      {
        id: 'ana',
        name: 'Mecânica Ana',
        role: 'Manutenção e hangar',
        sprite: 'ana',
        lines: [
          'A Pardal-01 está abastecida. Você quer sair hoje?',
          'Os mecânicos mais velhos estão dizendo que parece coisa de tempestade solar.',
        ],
        dialogue: anaRecDialogue,
      },
    ],
    tasks: [
      {
        id: 'rec-restore-network',
        title: 'Restabelecer Malha de Recife',
        kind: 'restore-network',
        reward: 280,
        prompt: 'Monte no canvas um grafo conectado com todos os nos alcancaveis e todas as rotas possiveis do aeroporto atual.',
      },
    ],
    shop: defaultShop,
  },

  JPA: {
    airportId: 'JPA',
    title: 'AEROPORTO DE JOÃO PESSOA',
    status: 'ACESSO RESTRITO — PREFEITO NO CONTROLE',
    npcs: [
      {
        id: 'controlador-jpa',
        name: 'Controlador Local',
        role: 'Controle de acesso',
        sprite: 'controller',
        lines: [
          'O prefeito quer falar com o senhor antes de qualquer partida.',
          'A ANAC não responde. O prefeito assumiu o controle do aeroporto.',
        ],
        dialogue: controladorJpaDialogue,
      },
      {
        id: 'prefeito',
        name: 'Prefeito Rui Fonseca',
        role: 'Prefeitura de João Pessoa',
        sprite: 'passenger',
        lines: [
          'Preciso chegar em Brasília. Você tem o único avião que funciona.',
          'Não é o acordo que eu gostaria de fazer. Mas é o que temos.',
        ],
        dialogue: prefeitoJpaDialogue,
      },
    ],
    tasks: [
      {
        id: 'jpa-map-connections',
        title: 'Mapear Conexões Disponíveis',
        kind: 'graph',
        reward: 140,
        prompt: 'Descubra quais aeroportos ainda são alcançáveis a partir de JPA.',
      },
      {
        id: 'jpa-route-to-bsb',
        title: 'Traçar Rota para Brasília',
        kind: 'graph',
        reward: 180,
        prompt: 'Encontre um caminho válido de João Pessoa até Brasília com o combustível disponível.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+30 COMBUSTÍVEL', amount: 30, cost: 150 },
        { label: '+60 COMBUSTÍVEL', amount: 60, cost: 280 },
      ],
    },
  },

  BSB: {
    airportId: 'BSB',
    title: 'HUB BRASÍLIA',
    status: 'GOVERNO FEDERAL — CENTRO DE RESPOSTA',
    npcs: [
      {
        id: 'helena',
        name: 'Helena — Ministério dos Transportes',
        role: 'Gestão de crise',
        sprite: 'controller',
        lines: [
          'Tempestade solar. A maior em setenta anos.',
          'Os sistemas de navegação, comunicação e controle de tráfego do país inteiro foram afetados.',
        ],
        dialogue: helenaDialogue,
      },
      {
        id: 'caio',
        name: 'Analista Caio',
        role: 'Mapeamento aeronáutico',
        sprite: 'controller',
        lines: [
          'Cada aeroporto tem que ser reconectado manualmente.',
          'Informação é o que mais falta agora. Se você puder ir verificando os aeroportos no caminho...',
        ],
        dialogue: caioDialogue,
      },
    ],
    tasks: [
      {
        id: 'bsb-map-northeast',
        title: 'Mapear Conectividade do Nordeste',
        kind: 'chart',
        reward: 200,
        prompt: 'Organize os dados de aeroportos alcançáveis em um mapa de conectividade regional.',
      },
      {
        id: 'bsb-find-path-home',
        title: 'Encontrar Rota de Retorno',
        kind: 'graph',
        reward: 220,
        prompt: 'As rotas diretas estão bloqueadas. Encontre um caminho alternativo até João Pessoa.',
      },
    ],
    shop: defaultShop,
  },

  GRU: {
    airportId: 'GRU',
    title: 'GUARULHOS',
    status: 'TRÁFEGO DESVIADO — ROTAS ALTERNATIVAS',
    npcs: [
      {
        id: 'renata',
        name: 'Controladora Renata',
        role: 'Tráfego e rotas',
        sprite: 'controller',
        lines: [
          'A rota direta para o Nordeste está fechada. Tempestade severa em toda aquela faixa.',
          'Tem rota alternativa, mas vai dar uma volta.',
        ],
        dialogue: renataDialogue,
      },
      {
        id: 'passageiro-gru',
        name: 'Passageiro em espera',
        role: 'Em trânsito',
        sprite: 'passenger',
        lines: [
          'Estou aqui desde ontem. Minha mulher não sabe onde estou.',
          'Você pelo menos pode voar. Eu só posso esperar.',
        ],
        dialogue: passengerGenJourneyDialogue,
      },
    ],
    tasks: [
      {
        id: 'gru-bypass-storm',
        title: 'Calcular Desvio da Tempestade',
        kind: 'graph',
        reward: 190,
        prompt: 'Encontre o caminho mais curto contornando as rotas bloqueadas pela tempestade.',
      },
      {
        id: 'gru-anomaly-map',
        title: 'Mapear Anomalias Solares',
        kind: 'chart',
        reward: 210,
        prompt: 'Marque as posições das anomalias reportadas e identifique rotas seguras entre elas.',
      },
    ],
    shop: defaultShop,
  },

  MAO: {
    airportId: 'MAO',
    title: 'MANAUS',
    status: 'ISOLADO MAS OPERACIONAL',
    npcs: [
      {
        id: 'bento',
        name: 'Controlador Bento',
        role: 'Operações regionais',
        sprite: 'controller',
        lines: [
          'Manaus já vivia isolada antes disso. A diferença é que agora todo mundo está no mesmo barco.',
          'Sei as rotas de memória. Os sistemas digitais nunca foram tão confiáveis por aqui.',
        ],
        dialogue: bentoMaoDialogue,
      },
    ],
    tasks: [
      {
        id: 'mao-map-amazon-routes',
        title: 'Mapear Rotas Amazônicas',
        kind: 'graph',
        reward: 180,
        prompt: 'Registre as rotas que Bento conhece de memória e construa o grafo da região Norte.',
      },
      {
        id: 'mao-anomaly-structure',
        title: 'Analisar Estrutura da Anomalia',
        kind: 'chart',
        reward: 200,
        prompt: 'A anomalia tem bordas definidas. Use os dados de Bento para mapear sua estrutura.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+25 COMBUSTÍVEL', amount: 25, cost: 140 },
        { label: '+55 COMBUSTÍVEL', amount: 55, cost: 290 },
      ],
    },
  },
};

export function getAirportMenu(airportId: string): AirportMenuData {
  return AIRPORT_MENUS[airportId] ?? {
    airportId,
    title: `AEROPORTO ${airportId}`,
    status: 'OPERACIONAL — SEM COMUNICAÇÃO EXTERNA',
    npcs: [
      {
        id: 'local-controller',
        name: 'Controlador Local',
        role: 'Operações locais',
        sprite: 'controller',
        lines: [
          'Você é o primeiro avião que pousa aqui desde que os sistemas caíram.',
          'Estável por aqui. Assustado, mas estável.',
        ],
        dialogue: makeFallbackDialogue(airportId),
      },
    ],
    tasks: [
      {
        id: `${airportId.toLowerCase()}-local-routes`,
        title: 'Registrar Rotas Locais',
        kind: 'graph',
        reward: 100,
        prompt: 'Identifique e registre as conexões disponíveis neste aeroporto.',
      },
    ],
    shop: defaultShop,
  };
}
