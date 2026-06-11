import type { DialogueScript } from '../logic/dialogueEngine';

export type AirportTaskKind = 'restore-network' | 'graph' | 'chart' | 'dialogue';

export interface AirportNpc {
  id: string;
  name: string;
  role: string;
  lines: string[];
  sprite: 'agente-j' | 'lia' | 'ana' | 'controller' | 'passenger';
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
// Agente J pousa em Recife. Lia é a operadora de campo que vai guiar a missão.

const liaGuideDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'lia',
      text: 'AGENTE J. RECEBI A CONFIRMAÇÃO DO PRESIDENTE. PROTOCOLO-M ESTÁ ATIVO EM TODA A MALHA. RECIFE É O PONTO DE PARTIDA.',
      next: 'agente-j-entendido',
    },
    'agente-j-entendido': {
      speakerId: 'agente-j',
      text: 'ENTENDIDO. O QUE PRECISO FAZER PRIMEIRO?',
      choices: [
        { label: 'Como funciona o PROTOCOLO-M?', next: 'lia-explica' },
        { label: 'Por onde começo?', next: 'lia-inicio' },
      ],
    },
    'lia-explica': {
      speakerId: 'lia',
      text: 'É UM SISTEMA DE IA AUTÔNOMO DOS LABS ANAC. AO DETECTAR A ONDA SOLAR, ENTROU EM HIPER-PROTEÇÃO E BLOQUEOU TODA A MALHA. IRONICAMENTE, PARA PROTEGER ELA.',
      next: 'agente-j-e-agora',
    },
    'agente-j-e-agora': {
      speakerId: 'agente-j',
      text: 'E AGORA PRECISO RESTAURAR NÓ POR NÓ.',
      next: 'lia-exato',
    },
    'lia-exato': {
      speakerId: 'lia',
      text: 'EXATO. CADA NÓ RESTAURADO ENFRAQUECE O PROTOCOLO. O NÚCLEO CENTRAL ESTÁ EM BRASÍLIA.',
    },
    'lia-inicio': {
      speakerId: 'lia',
      text: 'MAPEIE OS NÓS E ARESTAS DA MALHA LOCAL. É BÁSICO — MAS É A FUNDAÇÃO. SEM ISSO, NENHUMA ROTA PODE SER VALIDADA.',
      next: 'agente-j-vou-comecar',
    },
    'agente-j-vou-comecar': {
      speakerId: 'agente-j',
      text: 'VOU COMEÇAR AGORA.',
      next: 'lia-boa-sorte',
    },
    'lia-boa-sorte': {
      speakerId: 'lia',
      text: 'BOA SORTE. E CUIDADO: O GLITCH JÁ ESTÁ MONITORANDO A TORRE.',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
      text: 'ENTENDO.',
      next: 'lia-voce-piloto',
    },
    'lia-voce-piloto': {
      speakerId: 'lia',
      text: 'VOCÊ É PILOTO, NÃO É? CONSEGUE VOAR?',
      next: 'antonio-vou-tentar',
    },
    'antonio-vou-tentar': {
      speakerId: 'agente-j',
      text: 'AINDA ESTOU TENTANDO ENTENDER O QUE ACONTECEU. MAS SIM, EU CONSIGO VOAR.',
    },
    'lia-ligou': {
      speakerId: 'lia',
      text: 'CELULAR SEM SINAL DESDE ONTEM. TELEFONE FIXO DO AEROPORTO TAMBÉM. NÃO É SÓ O VOO.',
      next: 'antonio-parece-maior',
    },
    'antonio-parece-maior': {
      speakerId: 'agente-j',
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
      text: 'AGENTE J. A PARDAL-01 ESTÁ ABASTECIDA. VOCÊ QUER SAIR HOJE?',
      next: 'antonio-ainda-nao-sei',
    },
    'antonio-ainda-nao-sei': {
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      text: 'AGENTE J. O PREFEITO GOSTARIA DE FALAR COM O SENHOR ANTES DE QUALQUER PARTIDA DAQUI.',
      next: 'antonio-nao-trabalho',
    },
    'antonio-nao-trabalho': {
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
      text: 'CERTO. VOU FALAR COM ELE.',
    },
    'control-familia': {
      speakerId: 'controller',
      text: 'NÃO SEI DIZER, SENHOR. AS COMUNICAÇÕES INTERNAS DA CIDADE TAMBÉM ESTÃO COM PROBLEMAS. O PREFEITO PODE SABER MAIS.',
      next: 'antonio-entende',
    },
    'antonio-entende': {
      speakerId: 'agente-j',
      text: 'ENTENDIDO.',
    },
  },
};

const prefeitoJpaDialogue: DialogueScript = {
  start: 'abertura',
  nodes: {
    abertura: {
      speakerId: 'controller',
      text: 'AGENTE J. RUI FONSECA, PREFEITO DE JOÃO PESSOA. OBRIGADO POR VIR.',
      next: 'antonio-nao-tive-escolha',
    },
    'antonio-nao-tive-escolha': {
      speakerId: 'agente-j',
      text: 'NÃO TIVE MUITA ESCOLHA. ONDE ESTÁ MINHA FAMÍLIA?',
      next: 'prefeito-familia',
    },
    'prefeito-familia': {
      speakerId: 'controller',
      text: 'OS BAIRROS ESTÃO SEM COMUNICAÇÃO MAS SEM RELATO DE FERIDOS. A CIDADE ESTÁ FUNCIONANDO. SÓ OS SISTEMAS ELETRÔNICOS QUE PARARAM.',
      next: 'antonio-o-que-voce-quer',
    },
    'antonio-o-que-voce-quer': {
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
      text: 'E MINHA FAMÍLIA?',
      next: 'prefeito-promessa',
    },
    'prefeito-promessa': {
      speakerId: 'controller',
      text: 'QUANDO VOLTAR DE BRASÍLIA, VOCÊ VEM DE VOLTA. E EU GARANTO QUE SUA FAMÍLIA FICA BEM CUIDADA ENQUANTO VOCÊ NÃO ESTÁ. TENHO PESSOAS DE CONFIANÇA.',
      next: 'antonio-nao-e-negocio',
    },
    'antonio-nao-e-negocio': {
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
      text: 'TODO MUNDO ESTÁ IMPROVISANDO.',
      next: 'prefeito-diferenca',
    },
    'prefeito-diferenca': {
      speakerId: 'controller',
      text: 'SIM. MAS EM BRASÍLIA PELO MENOS ALGUÉM DEVE SABER O QUE CAUSOU ISSO. VOCÊ NÃO QUER SABER TAMBÉM?',
      next: 'antonio-quero',
    },
    'antonio-quero': {
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
      text: 'ENTÃO NINGUÉM CONSEGUE RELIGAR NADA PORQUE TUDO PRECISA DE TUDO PARA FUNCIONAR.',
      next: 'helena-mais-ou-menos',
    },
    'helena-mais-ou-menos': {
      speakerId: 'helena',
      text: 'MAIS OU MENOS ISSO. A ÚNICA COISA QUE FUNCIONA É O QUE É MECÂNICO. COMO O SEU AVIÃO.',
      next: 'antonio-entao-eu',
    },
    'antonio-entao-eu': {
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
      text: 'AINDA ESTOU DECIDINDO. AS ROTAS DIRETAS ESTÃO COM PROBLEMA.',
      next: 'caio-anomalias',
    },
    'caio-anomalias': {
      speakerId: 'caio',
      text: 'SIM. OS PILOTOS ESTÃO RELATANDO DISTÚRBIOS ELETROMAGNÉTICOS EM ALGUMAS FAIXAS DO CÉU. COISAS ESTRANHAS. FORMAS QUE NÃO DEVERIAM ESTAR LÁ.',
      next: 'antonio-que-tipo',
    },
    'antonio-que-tipo': {
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
      speakerId: 'agente-j',
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
        speakerId: 'agente-j',
        text: 'IGUAL EM TODO LADO.',
      },
      combustivel: {
        speakerId: 'controller',
        text: 'TEM. OS TANQUES SÃO MECÂNICOS. NÃO DEPENDEM DO SISTEMA ELETRÔNICO.',
        next: 'antonio-bom',
      },
      'antonio-bom': {
        speakerId: 'agente-j',
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
        id: 'lia',
        name: 'Lia',
        role: 'Operadora de Rede — PROTOCOLO-M',
        sprite: 'lia',
        lines: [
          'Agente J, o PROTOCOLO-M está bloqueando toda a malha. Recife é o ponto de partida.',
          'Mapeie os nós e arestas. Depois enfrentamos o Glitch na torre.',
        ],
        dialogue: liaGuideDialogue,
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
        prompt: 'Mapeie todas as 7 arestas do grafo local — operacionais e danificadas — clicando nos pares de nos.',
      },
      {
        id: 'rec-calibrate-systems',
        title: 'Calibrar Sistemas da Torre',
        kind: 'chart',
        reward: 180,
        prompt: 'Arraste as barras ate os valores-alvo para restaurar os sistemas operacionais da torre de controle.',
      },
      {
        id: 'rec-route-weights',
        title: 'Calibrar Pesos das Rotas',
        kind: 'chart',
        reward: 160,
        prompt: 'Cada rota tem um peso proporcional ao seu alcance. Ajuste as barras para os valores corretos do grafo.',
      },
      {
        id: 'rec-frequency-scan',
        title: 'Varredura de Frequências',
        kind: 'chart',
        reward: 200,
        prompt: 'O PROTOCOLO-M corrompeu as frequências de transmissão. Restaure cada banda ao nivel operacional.',
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
      {
        id: 'jpa-degree-map',
        title: 'Mapa de Grau dos Nós',
        kind: 'chart',
        reward: 160,
        prompt: 'Calibre o grau correto de cada nó da malha local de João Pessoa.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+30 COMBUSTÍVEL', amount: 30, cost: 150 },
        { label: '+60 COMBUSTÍVEL', amount: 60, cost: 280 },
      ],
    },
  },

  FOR: {
    airportId: 'FOR',
    title: 'AEROPORTO DE FORTALEZA',
    status: 'ANOMALIA DETECTADA — SISTEMAS INSTÁVEIS',
    npcs: [
      {
        id: 'controladora-for',
        name: 'Controladora Marta',
        role: 'Controle de tráfego',
        sprite: 'controller',
        lines: [
          'A anomalia aqui se comporta diferente. Ela reage quando você tenta se aproximar.',
          'Os pilotos mais velhos dizem que parece inteligente. Eu não sei o que pensar.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J? LIA NOS AVISOU QUE VOCÊ ESTAVA VINDO. A SITUAÇÃO AQUI ESTÁ DIFERENTE.',
              next: 'antonio-diferente',
            },
            'antonio-diferente': {
              speakerId: 'agente-j',
              text: 'DIFERENTE COMO?',
              next: 'marta-reage',
            },
            'marta-reage': {
              speakerId: 'controller',
              text: 'A ANOMALIA REAGE AOS AVIÕES. QUANDO OS INSTRUMENTOS DETECTAM UMA AERONAVE, ELA... MUDA. ORIENTA OS PULSOS EM DIREÇÃO AO AVIÃO.',
              choices: [
                { label: 'Isso é impossível.', next: 'marta-eu-sei' },
                { label: 'Você tem logs disso?', next: 'marta-logs' },
              ],
            },
            'marta-eu-sei': {
              speakerId: 'controller',
              text: 'EU SEI COMO SONA. MAS OS DADOS ESTÃO LÁ. TIVEMOS QUATRO AVIÕES SOBREVOANDO. OS QUATRO FORAM INTERCEPTADOS PELOS PULSOS.',
              next: 'antonio-nao-e-natural',
            },
            'antonio-nao-e-natural': {
              speakerId: 'agente-j',
              text: 'ISSO NÃO É COMPORTAMENTO NATURAL DE UMA TEMPESTADE SOLAR.',
              next: 'marta-eu-tambem',
            },
            'marta-eu-tambem': {
              speakerId: 'controller',
              text: 'EU TAMBÉM NÃO ACHO.',
            },
            'marta-logs': {
              speakerId: 'controller',
              text: 'TENHO. E O QUE ME PREOCUPA MAIS É O TIMESTAMP DO PRIMEIRO PULSO.',
              next: 'antonio-que-hora',
            },
            'antonio-que-hora': {
              speakerId: 'agente-j',
              text: 'QUE HORAS?',
              next: 'marta-antes',
            },
            'marta-antes': {
              speakerId: 'controller',
              text: '03:52. O INPE REGISTROU A ONDA SOLAR CHEGANDO ÀS 03:47. CINCO MINUTOS ANTES DA ONDA, A ANOMALIA JÁ ESTAVA ATIVA AQUI.',
              next: 'antonio-espera',
            },
            'antonio-espera': {
              speakerId: 'agente-j',
              text: 'ESPERA. ISSO SIGNIFICA QUE ELA COMEÇOU ANTES DA TEMPESTADE SOLAR.',
              next: 'marta-exatamente',
            },
            'marta-exatamente': {
              speakerId: 'controller',
              text: 'EXATAMENTE. NÃO SEI O QUE É. MAS ALGUÉM ATIVOU ALGO ANTES DA ONDA CHEGAR.',
            },
          },
        },
      },
      {
        id: 'mecanico-for',
        name: 'Mecânico Dirceu',
        role: 'Manutenção de aeronaves',
        sprite: 'ana',
        lines: [
          'Tentei voar ontem. Os instrumentos enlouqueceram a 15km do aeroporto.',
          'Geometria perfeita. Isso não é natural.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'ana',
              text: 'VOCÊ VIU A ANOMALIA DE PERTO? EU VIM DE VOLTA COM OS CONTROLES QUEIMADOS.',
              next: 'antonio-o-que-viu',
            },
            'antonio-o-que-viu': {
              speakerId: 'agente-j',
              text: 'O QUE VOCÊ VIU?',
              next: 'dirceu-forma',
            },
            'dirceu-forma': {
              speakerId: 'ana',
              text: 'UMA FORMA. COMO UMA GRADE. PERFEITA. CADA LINHA A EXATAMENTE A MESMA DISTÂNCIA. NADA NA NATUREZA FAZ ISSO.',
              next: 'antonio-confirma',
            },
            'antonio-confirma': {
              speakerId: 'agente-j',
              text: 'OUTRO PILOTO ME DISSE A MESMA COISA. POLIGONAL. GEOMÉTRICA.',
              next: 'dirceu-codigo',
            },
            'dirceu-codigo': {
              speakerId: 'ana',
              text: 'E QUANDO EU ME APROXIMEI, OS PULSOS VIERAM EM DIREÇÃO A MIM. COMO SE SOUBESSE QUE EU ESTAVA LÁ.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'for-analyze-pulses',
        title: 'Analisar Padrão dos Pulsos',
        kind: 'graph',
        reward: 150,
        prompt: 'Os pulsos seguem um padrão de grafo. Mapeie as conexões entre os focos de interferência.',
      },
      {
        id: 'for-frequency-restore',
        title: 'Restaurar Frequências',
        kind: 'chart',
        reward: 170,
        prompt: 'A onda solar embaralhou as frequências do hub. Restaure cada banda ao valor operacional.',
      },
      {
        id: 'for-hub-balance',
        title: 'Balancear Hub Regional',
        kind: 'chart',
        reward: 180,
        prompt: 'Fortaleza é hub. Calibre o fluxo de rotas para não sobrecarregar um único nó.',
      },
    ],
    shop: defaultShop,
  },

  SSA: {
    airportId: 'SSA',
    title: 'AEROPORTO DE SALVADOR',
    status: 'PROTOCOLO DESCONHECIDO — CÓDIGO FRAGMENTADO',
    npcs: [
      {
        id: 'engenheiro-ssa',
        name: 'Engenheira Paula',
        role: 'Sistemas ANAC / Salvador',
        sprite: 'controller',
        lines: [
          'Encontrei fragmentos de código no nó corrompido. Não é código de emergência padrão.',
          'Assinatura no código: ANAC LABS. Isso é interno da ANAC.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. VOCÊ PRECISAVA VER ISSO. ENCONTREI NO LOG DO NÓ CENTRAL ANTES DE ELE CORROMPER TOTALMENTE.',
              next: 'antonio-o-que-e',
            },
            'antonio-o-que-e': {
              speakerId: 'agente-j',
              text: 'O QUE É?',
              next: 'paula-codigo',
            },
            'paula-codigo': {
              speakerId: 'controller',
              text: 'FRAGMENTO DE CÓDIGO. NÃO É EMERGÊNCIA. NÃO É SISTEMA PADRÃO. TEM UMA TAG NO INÍCIO: PROTO-M v0.9.1. ANAC LABS.',
              choices: [
                { label: 'PROTO-M? Nunca ouvi falar.', next: 'paula-eu-tambem' },
                { label: 'Isso significa que é experimental.', next: 'paula-exato' },
              ],
            },
            'paula-eu-tambem': {
              speakerId: 'controller',
              text: 'EU TAMBÉM NÃO. PEDI PARA A LIA VER. ELA FICOU QUIETA POR TEMPO DEMAIS ANTES DE DIZER QUE NÃO CONHECIA.',
              next: 'antonio-tempo-demais',
            },
            'antonio-tempo-demais': {
              speakerId: 'agente-j',
              text: 'TEMPO DEMAIS.',
              next: 'paula-exato',
            },
            'paula-exato': {
              speakerId: 'controller',
              text: 'EXPERIMENTAL. NÃO DOCUMENTADO. ACESSO RESTRITO. QUEM FEZ ISSO ESTAVA TESTANDO ALGO SEM AUTORIZAÇÃO FORMAL.',
              next: 'antonio-vai-perguntar',
            },
            'antonio-vai-perguntar': {
              speakerId: 'agente-j',
              text: 'VOU VERIFICAR COM A LIA DIRETAMENTE QUANDO CHEGAR EM BRASÍLIA.',
            },
          },
        },
      },
      {
        id: 'passageiro-ssa',
        name: 'Passageiro Felipe',
        role: 'Jornalista investigativo',
        sprite: 'passenger',
        lines: [
          'Estou tentando cobrir isso. Os relatos não fecham com uma tempestade solar comum.',
          'Alguém sabia que a onda ia chegar. Ou pior: alguém ajudou.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'passenger',
              text: 'VOCÊ É O ENGENHEIRO DA INFRAERO? TENHO PERGUNTAS.',
              next: 'antonio-jornalista',
            },
            'antonio-jornalista': {
              speakerId: 'agente-j',
              text: 'DEPENDE DAS PERGUNTAS.',
              next: 'felipe-anomalia',
            },
            'felipe-anomalia': {
              speakerId: 'passenger',
              text: 'A ANOMALIA EM SALVADOR. ELA NÃO CHEGOU COM A TEMPESTADE. ELA JÁ ESTAVA ANTES. EU TENHO TESTEMUNHOS.',
              choices: [
                { label: 'Você tem evidências?', next: 'felipe-evidencias' },
                { label: 'Não tenho como confirmar isso.', next: 'felipe-nao-confirma' },
              ],
            },
            'felipe-evidencias': {
              speakerId: 'passenger',
              text: 'TRÊS PILOTOS VIRAM A GRADE ELETROMAGNÉTICA NO CÉU ANTES DO INPE REGISTRAR A ONDA SOLAR. HORAS ANTES.',
              next: 'antonio-esse-dado',
            },
            'antonio-esse-dado': {
              speakerId: 'agente-j',
              text: 'ESSE DADO É IMPORTANTE. PODE ME PASSAR OS CONTATOS DELES?',
              next: 'felipe-passa',
            },
            'felipe-passa': {
              speakerId: 'passenger',
              text: 'PASSO. E SE VOCÊ DESCOBRIR ALGUMA COISA EM BRASÍLIA, ME CONTA. O PAÍS PRECISA SABER O QUE ACONTECEU.',
            },
            'felipe-nao-confirma': {
              speakerId: 'passenger',
              text: 'VOCÊ NÃO PRECISA. MAS OS DADOS EXISTEM. ALGUÉM LIGOU ALGO ANTES DA ONDA CHEGAR. ISSO NÃO É OPINIÃO.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'ssa-read-protocol-fragments',
        title: 'Ler Fragmentos do Protocolo-M',
        kind: 'restore-network',
        reward: 200,
        prompt: 'Reconstrua o grafo fragmentado do Protocolo-M para entender sua lógica de funcionamento.',
      },
      {
        id: 'ssa-frequency-map',
        title: 'Mapear Frequências Bloqueadas',
        kind: 'chart',
        reward: 190,
        prompt: 'O Protocolo-M bloqueou frequências específicas em Salvador. Identifique e restaure.',
      },
      {
        id: 'ssa-rebuild-fragments',
        title: 'Reconstruir Fragmentos',
        kind: 'graph',
        reward: 220,
        prompt: 'Reconstrua o grafo de roteamento parcial a partir dos fragmentos de código.',
      },
    ],
    shop: defaultShop,
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
      {
        id: 'mao-bridge-strength',
        title: 'Reforçar Pontes Críticas',
        kind: 'chart',
        reward: 190,
        prompt: 'Manaus depende de poucas pontes. Calibre o reforço de cada conexão crítica.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+25 COMBUSTÍVEL', amount: 25, cost: 140 },
        { label: '+55 COMBUSTÍVEL', amount: 55, cost: 290 },
      ],
    },
  },

  // ─── NAT — O Caminho Interrompido ─────────────────────────────────────────
  NAT: {
    airportId: 'NAT',
    title: 'AEROPORTO DE NATAL',
    status: 'ROTA PRINCIPAL BLOQUEADA — CAMINHO ALTERNATIVO NECESSÁRIO',
    npcs: [
      {
        id: 'controlador-nat',
        name: 'Controlador Davi',
        role: 'Controle de voo — Natal',
        sprite: 'controller',
        lines: [
          'A rota direta está destruída. Mas eu conheço os setores secundários de cor.',
          'Vai dar uma volta, mas dá pra chegar.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. A ROTA PRINCIPAL DE NATAL ESTÁ CORTADA. INTERFERÊNCIA BLOQUEOU OS TRÊS SETORES CENTRAIS.',
              next: 'antonio-tem-saida',
            },
            'antonio-tem-saida': {
              speakerId: 'agente-j',
              text: 'TEM SAÍDA OU ESTOU PRESO AQUI?',
              next: 'davi-setores',
            },
            'davi-setores': {
              speakerId: 'controller',
              text: 'TEM. OS SETORES SECUNDÁRIOS AINDA FUNCIONAM. É COMO DESVIAR DE UM ENGARRAFAMENTO — VOCÊ NÃO VAI PELA AVENIDA, VAI PELAS RUAS DE TRÁS.',
              choices: [
                { label: 'Quanto mais longo?', next: 'davi-mais-longo' },
                { label: 'Me mostra o mapa.', next: 'davi-mapa' },
              ],
            },
            'davi-mais-longo': {
              speakerId: 'controller',
              text: 'DOIS, TRÊS SALTOS A MAIS. EM TEORIA DE GRAFOS ISSO SE CHAMA CAMINHO ALTERNATIVO — MESMO DESTINO, ARESTAS DIFERENTES.',
              next: 'antonio-melhor-do-que-nada',
            },
            'antonio-melhor-do-que-nada': {
              speakerId: 'agente-j',
              text: 'MELHOR DO QUE FICAR PARADO. JÁ PASSEI A METADE DA MINHA CARREIRA DANDO VOLTAS.',
              next: 'davi-mapa',
            },
            'davi-mapa': {
              speakerId: 'controller',
              text: 'O MAPA TÁ AQUI. CALIBRE OS PESOS DE CADA ROTA ANTES DE SAIR — O CAMINHO MAIS CURTO NEM SEMPRE É O QUE CUSTA MENOS.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'nat-restore-path',
        title: 'Restaurar Caminho Alternativo',
        kind: 'graph',
        reward: 160,
        prompt: 'A rota direta está bloqueada. Encontre um caminho válido passando pelos setores secundários.',
      },
      {
        id: 'nat-path-costs',
        title: 'Calibrar Custo das Rotas',
        kind: 'chart',
        reward: 150,
        prompt: 'Cada rota tem um custo diferente. Calibre os valores para escolher o caminho mais eficiente.',
      },
      {
        id: 'nat-frequency-restore',
        title: 'Restaurar Frequências VHF',
        kind: 'chart',
        reward: 140,
        prompt: 'As frequências de comunicação estão fora de calibração após a interferência solar.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+25 COMBUSTÍVEL', amount: 25, cost: 130 },
        { label: '+50 COMBUSTÍVEL', amount: 50, cost: 240 },
      ],
    },
  },

  // ─── THE — Teresina ────────────────────────────────────────────────────────
  THE: {
    airportId: 'THE',
    title: 'AEROPORTO DE TERESINA',
    status: 'OPERACIONAL — COMUNICAÇÕES PARCIAIS',
    npcs: [
      {
        id: 'controlador-the',
        name: 'Controlador Hélio',
        role: 'Controle regional — Teresina',
        sprite: 'controller',
        lines: [
          'Aqui em Teresina o sinal fica saindo e voltando. Como um eco.',
          'É estranho. A mesma sequência de pulsos, repetindo.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. TERESINA ESTÁ OPERACIONAL, MAS O SINAL FICA ECOANDO. A MESMA SEQUÊNCIA DE PULSOS, DE NOVO E DE NOVO.',
              next: 'antonio-eco',
            },
            'antonio-eco': {
              speakerId: 'agente-j',
              text: 'ECO DE SINAL NÃO É NORMAL. O QUE VOCÊ ACHA QUE ESTÁ CAUSANDO?',
              next: 'helio-padrao',
            },
            'helio-padrao': {
              speakerId: 'controller',
              text: 'É O QUE NÃO ENTENDO. UM ECO NATURAL É ALEATÓRIO. ESSE TEM RITMO. COMO SE ALGUÉM TIVESSE PROGRAMADO.',
              next: 'antonio-deliberado',
            },
            'antonio-deliberado': {
              speakerId: 'agente-j',
              text: 'DELIBERADO. INTERESSANTE.',
              next: 'helio-cuidado',
            },
            'helio-cuidado': {
              speakerId: 'controller',
              text: 'SE FOR SINAL ARTIFICIAL, ALGUÉM ESTÁ USANDO NOSSA INFRAESTRUTURA. CUIDADO QUANDO SAR DAQUI.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'the-map-region',
        title: 'Mapear Região Interiorana',
        kind: 'graph',
        reward: 130,
        prompt: 'Mapeie as conexões disponíveis no interior — poucas rotas mas funcionais.',
      },
      {
        id: 'the-echo-cancel',
        title: 'Cancelar Interferência de Eco',
        kind: 'chart',
        reward: 120,
        prompt: 'Os ecos de sinal estão impedindo comunicação limpa. Calibre os filtros para eliminá-los.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+20 COMBUSTÍVEL', amount: 20, cost: 110 },
        { label: '+45 COMBUSTÍVEL', amount: 45, cost: 230 },
      ],
    },
  },

  // ─── BEL — A Rede Fragmentada ──────────────────────────────────────────────
  BEL: {
    airportId: 'BEL',
    title: 'AEROPORTO DE BELÉM',
    status: 'FRAGMENTADO — TRÊS COMPONENTES ISOLADOS',
    npcs: [
      {
        id: 'iara',
        name: 'Técnica Iara',
        role: 'Sistemas de controle — Belém',
        sprite: 'controller',
        lines: [
          'Temos três grupos internos sem comunicação entre si. Cada um funciona, mas não falam.',
          'Em teoria de grafos, chamamos isso de componentes desconexos.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. BELÉM ESTÁ DIVIDIDA EM TRÊS ILHAS DIGITAIS. CADA COMPONENTE FUNCIONA INTERNAMENTE, MAS NÃO SE ENXERGAM.',
              next: 'antonio-como-unifica',
            },
            'antonio-como-unifica': {
              speakerId: 'agente-j',
              text: 'COMO UNIFICAMOS ISSO?',
              next: 'iara-arestas',
            },
            'iara-arestas': {
              speakerId: 'controller',
              text: 'CRIAMOS ARESTAS ENTRE OS COMPONENTES. BASTA UMA CONEXÃO ENTRE DOIS COMPONENTES PARA ELES VIRAREM UM. É COMO LIGAR ILHAS COM PONTES.',
              choices: [
                { label: 'Quantas pontes precisamos?', next: 'iara-pontes' },
                { label: 'Qual é o risco?', next: 'iara-risco' },
              ],
            },
            'iara-pontes': {
              speakerId: 'controller',
              text: 'MÍNIMO DUAS — UMA POR COMPONENTE ISOLADO. MAS MAIS PONTES SIGNIFICA MAIS RESILIÊNCIA. SE UMA CAIR, A OUTRA MANTÉM TUDO CONECTADO.',
              next: 'antonio-burocracia',
            },
            'antonio-burocracia': {
              speakerId: 'agente-j',
              text: 'COMO BUROCRACIA DE DEPARTAMENTO. CADA UM NO SEU CANTO ATÉ ALGUÉM FORÇAR UMA REUNIÃO.',
              next: 'iara-exato',
            },
            'iara-exato': {
              speakerId: 'controller',
              text: 'EXATAMENTE ISSO. E SEM REUNIÃO, NINGUÉM SAI DAQUI.',
            },
            'iara-risco': {
              speakerId: 'controller',
              text: 'SE O GLITCH AINDA ESTIVER ATIVO EM ALGUM COMPONENTE, CONECTAR PODE PROPAGAR O PROBLEMA. VERIFIQUE CADA NÓ ANTES DE CRIAR A ARESTA.',
            },
          },
        },
      },
      {
        id: 'piloto-bel',
        name: 'Piloto Regional',
        role: 'Linhas amazônicas',
        sprite: 'passenger',
        lines: [
          'Voo para Manaus assim que der. A floresta está normal — o problema é aqui.',
          'Já vi temporal desligar sistema nenhum. Isso aqui é diferente.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'passenger',
              text: 'CONHEÇO A ROTA BELÉM-MANAUS DE COR. VINte ANOS FAZENDO ESSE TRECHO. POSSO IR SEM SISTEMA.',
              next: 'antonio-como-esta-manaus',
            },
            'antonio-como-esta-manaus': {
              speakerId: 'agente-j',
              text: 'COMO ESTÁ MANAUS? ALGUMA INFORMAÇÃO?',
              next: 'piloto-manaus',
            },
            'piloto-bel-manaus': {
              speakerId: 'passenger',
              text: 'ÚLTIMO RELATO QUE OUVI: OPERACIONAL. BENTO LÁ É BOM. ELE CONHECE CADA ROTA DO AMAZONAS. SE PRECISAR DE INFORMAÇÃO DO NORTE, FALA COM ELE.',
              next: 'antonio-anotei',
            },
            'antonio-anotei': {
              speakerId: 'agente-j',
              text: 'ANOTEI. OBRIGADO.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'bel-unify-components',
        title: 'Unificar Componentes da Rede',
        kind: 'restore-network',
        reward: 220,
        prompt: 'Belém está dividida em três componentes desconexos. Conecte-os criando arestas entre os subgrafos.',
      },
      {
        id: 'bel-component-sync',
        title: 'Sincronizar Componentes',
        kind: 'chart',
        reward: 180,
        prompt: 'Cada componente opera em frequência diferente. Sincronize-os ao mesmo valor-alvo.',
      },
      {
        id: 'bel-amazon-routes',
        title: 'Mapear Rotas Amazônicas',
        kind: 'graph',
        reward: 200,
        prompt: 'O piloto conhece as rotas de cor. Registre o grafo da região Norte.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+30 COMBUSTÍVEL', amount: 30, cost: 155 },
        { label: '+60 COMBUSTÍVEL', amount: 60, cost: 295 },
      ],
    },
  },

  // ─── GYN — Hub Centro-Oeste ────────────────────────────────────────────────
  GYN: {
    airportId: 'GYN',
    title: 'AEROPORTO DE GOIÂNIA',
    status: 'HUB REGIONAL — SOBRECARGA DETECTADA',
    npcs: [
      {
        id: 'controlador-gyn',
        name: 'Controladora Vera',
        role: 'Centro-Oeste — Goiânia',
        sprite: 'controller',
        lines: [
          'Goiânia fica no meio do país. Todo voo que vem do Norte pro Sul passa por aqui.',
          'O hub está sobrecarregado. Muitas conexões num único ponto.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. GOIÂNIA É O NÓ CENTRAL DO PAÍS. ANTES DA CRISE JÁ ERA PESADO. AGORA ESTÁ PERTO DO LIMITE.',
              next: 'antonio-redistribuir',
            },
            'antonio-redistribuir': {
              speakerId: 'agente-j',
              text: 'COMO REDISTRIBUÍMOS O FLUXO?',
              next: 'vera-centralidade',
            },
            'vera-centralidade': {
              speakerId: 'controller',
              text: 'EM TEORIA DE GRAFOS ISSO SE CHAMA CENTRALIDADE. NÓS COM ALTA CENTRALIDADE SÃO PONTOS CRÍTICOS — SE CAEM, A REDE FRAGMENTA. PRECISAMOS DESCARREGAR GOIÂNIA.',
              choices: [
                { label: 'Como descarrego sem cortar rotas?', next: 'vera-rota-alternativa' },
                { label: 'Qual o risco se o hub travar?', next: 'vera-risco' },
              ],
            },
            'vera-rota-alternativa': {
              speakerId: 'controller',
              text: 'ATIVANDO ROTAS QUE CONTORNAM GOIÂNIA. MAIS LONGAS, MAS EVITAM O GARGALO. É COMO ABRIR DESVIOS DE TRÂNSITO.',
              next: 'antonio-engarrafamento',
            },
            'antonio-engarrafamento': {
              speakerId: 'agente-j',
              text: 'ENGARRAFAMENTO AÉREO. QUEM DIRIA.',
            },
            'vera-risco': {
              speakerId: 'controller',
              text: 'NORTE E SUL FICAM SEM COMUNICAÇÃO ENTRE SI. É O PIOR CENÁRIO. POR ISSO ESTOU PEDINDO AJUDA AGORA.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'gyn-map-center',
        title: 'Mapear Conectividade Central',
        kind: 'graph',
        reward: 170,
        prompt: 'Goiânia conecta Norte, Sul e Leste. Mapeie todas as rotas ativas do hub.',
      },
      {
        id: 'gyn-hub-balance',
        title: 'Balancear Hub Regional',
        kind: 'chart',
        reward: 160,
        prompt: 'O fluxo está concentrado em Goiânia. Redistribua a carga para equilibrar a rede.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+25 COMBUSTÍVEL', amount: 25, cost: 135 },
        { label: '+55 COMBUSTÍVEL', amount: 55, cost: 265 },
      ],
    },
  },

  // ─── CNF — A Árvore de Conexões ────────────────────────────────────────────
  CNF: {
    airportId: 'CNF',
    title: 'AEROPORTO DE CONFINS — BELO HORIZONTE',
    status: 'ENERGIA CRÍTICA — CONEXÕES MÍNIMAS NECESSÁRIAS',
    npcs: [
      {
        id: 'nina',
        name: 'Engenheira Nina',
        role: 'Infraestrutura — Confins',
        sprite: 'controller',
        lines: [
          'Energia limitada. Só consigo manter o mínimo de conexões ativas.',
          'Preciso conectar todos os setores sem criar redundância. Uma árvore geradora mínima.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. TEMOS ENERGIA PARA MANTER EXATAMENTE N-1 CONEXÕES, ONDE N É O NÚMERO DE SETORES. UMA ARESTA A MAIS E O SISTEMA DESLIGA TUDO.',
              next: 'antonio-arvore',
            },
            'antonio-arvore': {
              speakerId: 'agente-j',
              text: 'ISSO É UMA ÁRVORE GERADORA.',
              next: 'nina-exato',
            },
            'nina-exato': {
              speakerId: 'controller',
              text: 'EXATO. UM GRAFO CONECTADO SEM CICLOS. CADA SETOR ALCANÇÁVEL, ZERO REDUNDÂNCIA. É O MÁXIMO QUE CONSIGO MANTER COM ESTA ENERGIA.',
              choices: [
                { label: 'E se um elo cair?', next: 'nina-bridge' },
                { label: 'Como removemos os ciclos?', next: 'nina-ciclos' },
              ],
            },
            'nina-bridge': {
              speakerId: 'controller',
              text: 'QUALQUER ARESTA QUE CAIR FRAGMENTA A REDE. É O PREÇO DA EFICIÊNCIA — ZERO MARGEM DE ERRO. MAS É O QUE TEMOS.',
              next: 'antonio-eficiencia',
            },
            'antonio-eficiencia': {
              speakerId: 'agente-j',
              text: 'EFICIÊNCIA OU CONFORTO. SEMPRE A MESMA ESCOLHA.',
            },
            'nina-ciclos': {
              speakerId: 'controller',
              text: 'IDENTIFICAMOS AS ARESTAS QUE CRIAM CICLOS E REMOVEMOS A DE MAIOR CUSTO. REPETE ATÉ NÃO SOBRAR NENHUM CICLO. ISSO É O ALGORITMO DE KRUSKAL EM REVERSO.',
            },
          },
        },
      },
      {
        id: 'passageiro-cnf',
        name: 'Engenheiro em Trânsito',
        role: 'Infraestrutura federal',
        sprite: 'passenger',
        lines: [
          'Venho de São Paulo. A situação lá é caótica — nós demais conectados ao mesmo tempo.',
          'Guarulhos tem mais rotas do que consegue processar.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'passenger',
              text: 'GUARULHOS TEM TREZENTAS E OITENTA ARESTAS ATIVAS. CADA NÓ CONECTADO A TUDO. É O OPOSTO DO QUE VOCÊS ESTÃO FAZENDO AQUI.',
              next: 'antonio-denso-demais',
            },
            'antonio-denso-demais': {
              speakerId: 'agente-j',
              text: 'GRAFO DENSO DEMAIS TAMBÉM É PROBLEMA.',
              next: 'engenheiro-paradoxo',
            },
            'engenheiro-paradoxo': {
              speakerId: 'passenger',
              text: 'EXATAMENTE. REDUNDÂNCIA DEMAIS VIRA RUÍDO. O SISTEMA NÃO SABE QUAL CAMINHO USAR. AQUI EM BH COM A ÁRVORE MÍNIMA, CADA ROTA TEM UM PROPÓSITO CLARO.',
              next: 'antonio-menos-e-mais',
            },
            'antonio-menos-e-mais': {
              speakerId: 'agente-j',
              text: 'MENOS É MAIS.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'cnf-build-spanning-tree',
        title: 'Construir Árvore Geradora',
        kind: 'graph',
        reward: 200,
        prompt: 'Energia limitada. Conecte todos os setores usando o mínimo de arestas — sem ciclos.',
      },
      {
        id: 'cnf-tree-construction',
        title: 'Calibrar Estrutura da Árvore',
        kind: 'chart',
        reward: 180,
        prompt: 'Ajuste os pesos dos galhos para que a árvore geradora seja mínima.',
      },
      {
        id: 'cnf-cycle-detection',
        title: 'Detectar e Remover Ciclos',
        kind: 'chart',
        reward: 170,
        prompt: 'Ciclos desperdiçam energia. Identifique e elimine as arestas redundantes.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+30 COMBUSTÍVEL', amount: 30, cost: 160 },
        { label: '+65 COMBUSTÍVEL', amount: 65, cost: 305 },
      ],
    },
  },

  // ─── VIX — Vitória ─────────────────────────────────────────────────────────
  VIX: {
    airportId: 'VIX',
    title: 'AEROPORTO DE VITÓRIA',
    status: 'COSTA INSTÁVEL — INTERFERÊNCIA ALTA',
    npcs: [
      {
        id: 'controlador-vix',
        name: 'Controladora Sônia',
        role: 'Operações costeiras — Vitória',
        sprite: 'controller',
        lines: [
          'O litoral complica tudo. As interferências solares são mais intensas perto do mar.',
          'Já vi condições assim antes. Nunca tão generalizadas.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. VITÓRIA É LITORAL. A INTERFERÊNCIA SOLAR REFLETE NA SUPERFÍCIE DO MAR E DOBRA A INTENSIDADE. NOSSOS SISTEMAS ESTÃO SOFRENDO MAIS DO QUE O INTERIOR.',
              next: 'antonio-roteamento',
            },
            'antonio-roteamento': {
              speakerId: 'agente-j',
              text: 'COMO ESTÁ O ROTEAMENTO DAQUI?',
              next: 'sonia-costeiro',
            },
            'sonia-costeiro': {
              speakerId: 'controller',
              text: 'AS ROTAS COSTEIRAS PARA O NORTE ESTÃO BLOQUEADAS. PARA RIO, ESTÁ PARCIAL. RECOMENDO VOAR MAIS ALTO E MAIS PARA O INTERIOR QUANDO POSSÍVEL.',
              choices: [
                { label: 'E as frequências?', next: 'sonia-frequencias' },
                { label: 'Rio de Janeiro é o próximo passo.', next: 'sonia-rio' },
              ],
            },
            'sonia-frequencias': {
              speakerId: 'controller',
              text: 'CORROMPIDAS ACIMA DE 130 MHZ. ABAIXO DISSO AINDA FUNCIONA, MAS COM RUÍDO. CALIBRE ANTES DE USAR.',
            },
            'sonia-rio': {
              speakerId: 'controller',
              text: 'RIO TEM GALEÃO E SANTOS DUMONT. GALEÃO ESTÁ COM PROBLEMA ESPECÍFICO — OUVI FALAR DE ROTAS FALSAS. CUIDADO.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'vix-coastal-routes',
        title: 'Mapear Rotas Costeiras',
        kind: 'graph',
        reward: 155,
        prompt: 'O litoral tem aeroportos menores com conexões locais. Mapeie as rotas disponíveis na costa.',
      },
      {
        id: 'vix-coastal-freq',
        title: 'Calibrar Frequências Costeiras',
        kind: 'chart',
        reward: 145,
        prompt: 'Interferência marinha corrompeu as frequências costeiras. Restaure a comunicação.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+25 COMBUSTÍVEL', amount: 25, cost: 130 },
        { label: '+50 COMBUSTÍVEL', amount: 50, cost: 250 },
      ],
    },
  },

  // ─── GIG — Rotas Alternativas / Rio ───────────────────────────────────────
  GIG: {
    airportId: 'GIG',
    title: 'GALEÃO — RIO DE JANEIRO',
    status: 'MÚLTIPLAS ROTAS — ALGUMAS FALSAS',
    npcs: [
      {
        id: 'marina',
        name: 'Controladora Marina',
        role: 'Tráfego aéreo — Galeão',
        sprite: 'controller',
        lines: [
          'Temos várias rotas para o terminal central. O problema é que o glitch criou algumas falsas.',
          'Uma aresta falsa parece real mas some quando você tenta usar. É um pesadelo de diagnóstico.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. O GALEÃO ESTÁ COM UM PROBLEMA QUE EU NUNCA VI: ARESTAS FANTASMA. APARECEM NO SISTEMA MAS NÃO EXISTEM DE VERDADE.',
              next: 'antonio-como-distingue',
            },
            'antonio-como-distingue': {
              speakerId: 'agente-j',
              text: 'COMO DISTINGUIMOS AS REAIS DAS FALSAS?',
              next: 'marina-verificacao',
            },
            'marina-verificacao': {
              speakerId: 'controller',
              text: 'VERIFICAÇÃO DE CAMINHO: SE CADA PAR CONSECUTIVO DE NÓS NO CAMINHO TEM UMA ARESTA REAL ENTRE ELES, O CAMINHO É VÁLIDO. UMA ARESTA FALSA QUEBRA A CORRENTE.',
              choices: [
                { label: 'Como sabemos se a aresta é falsa?', next: 'marina-teste' },
                { label: 'Quantas arestas falsas existem?', next: 'marina-quantidade' },
              ],
            },
            'marina-teste': {
              speakerId: 'controller',
              text: 'TESTANDO COM SINAL MÍNIMO. SE A ARESTA EXISTE, O SINAL PASSA. SE FOR FALSA, O SINAL MORRE. É LENTO, MAS FUNCIONA.',
              next: 'antonio-carnaval',
            },
            'antonio-carnaval': {
              speakerId: 'agente-j',
              text: 'RIO DE JANEIRO. ATÉ AS ROTAS AÉREAS TÊM FANTASIA.',
              next: 'marina-ri',
            },
            'marina-ri': {
              speakerId: 'controller',
              text: 'PELA PRIMEIRA VEZ EM TRÊS DIAS, ISSO ME FEZ RIR.',
            },
            'marina-quantidade': {
              speakerId: 'controller',
              text: 'IDENTIFICAMOS SETE. MAS O GLITCH PODE TER CRIADO MAIS. NÃO CONFIE EM NENHUMA ROTA SEM VERIFICAR.',
            },
          },
        },
      },
      {
        id: 'passageiro-gig',
        name: 'Turista Alemão',
        role: 'Turista em trânsito',
        sprite: 'passenger',
        lines: [
          'Ich verstehe nicht. Meu voo para Frankfurt foi cancelado há três dias.',
          'É sempre o mesmo: turbulência de software.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'passenger',
              text: 'FRANKFURT. CANCELADO. TRÊS DIAS. VOCÊ PODE ME AJUDAR? BITTE.',
              next: 'antonio-nao-muito',
            },
            'antonio-nao-muito': {
              speakerId: 'agente-j',
              text: 'NÃO MUITO. MAS QUAL ROTA VOCÊ USOU PARA CHEGAR AQUI ANTES DO PROBLEMA?',
              next: 'turista-rota',
            },
            'turista-rota': {
              speakerId: 'passenger',
              text: 'FRANKFURT — GRU — GIG. CONEXÃO PELO TERMINAL DOIS. ESSA ROTA ESTAVA PERFEITA ATÉ ONTEM DE MANHÃ. DEPOIS... PUFF.',
              next: 'antonio-util',
            },
            'antonio-util': {
              speakerId: 'agente-j',
              text: 'ISSO AJUDA. SE A ROTA FUNCIONAVA ATÉ ONTEM DE MANHÃ, O PROBLEMA COMEÇOU NA ÚLTIMA NOITE. DANKE.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'gig-verify-routes',
        title: 'Verificar Rotas Reais',
        kind: 'graph',
        reward: 210,
        prompt: 'O glitch criou conexões falsas. Identifique quais rotas são reais verificando a conectividade de cada aresta.',
      },
      {
        id: 'gig-route-verify',
        title: 'Calibrar Validade das Rotas',
        kind: 'chart',
        reward: 195,
        prompt: 'Calibre os indicadores de cada rota para separar as reais das falsas.',
      },
      {
        id: 'gig-resilience-map',
        title: 'Mapa de Resiliência',
        kind: 'chart',
        reward: 185,
        prompt: 'Rio precisa de múltiplas rotas redundantes. Mapeie a resiliência de cada setor.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+35 COMBUSTÍVEL', amount: 35, cost: 175 },
        { label: '+70 COMBUSTÍVEL', amount: 70, cost: 330 },
      ],
    },
  },

  // ─── CGH — Congonhas / São Paulo ───────────────────────────────────────────
  CGH: {
    airportId: 'CGH',
    title: 'CONGONHAS — SÃO PAULO',
    status: 'CONGESTIONADO — TRÁFEGO BLOQUEADO',
    npcs: [
      {
        id: 'controlador-cgh',
        name: 'Controlador Vitor Jr.',
        role: 'Congonhas — tráfego urbano',
        sprite: 'controller',
        lines: [
          'Congonhas já era difícil antes da crise. Agora está impossível.',
          'São Paulo tem dois aeroportos principais e ambos estão paralisados.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. BEM-VINDO AO CAOS. CONGONHAS TEM O MAIOR VOLUME DE TRÁFEGO DO BRASIL E ZERO CAPACIDADE DE PROCESSÁ-LO AGORA.',
              next: 'antonio-alternativa',
            },
            'antonio-alternativa': {
              speakerId: 'agente-j',
              text: 'TEM COMO REDIRECIONAR O FLUXO?',
              next: 'vitor-descongesto',
            },
            'vitor-descongesto': {
              speakerId: 'controller',
              text: 'PRECISAMOS PRIMEIRO DESCONGESTIONAR. NENHUM AVIÃO ENTRA OU SAI ATÉ REDUZIRMOS A FILA. É COMO DESENTUPIR ANTES DE RELIGAR A TORNEIRA.',
              choices: [
                { label: 'E Guarulhos?', next: 'vitor-gru' },
                { label: 'Quantas aeronaves estão presas?', next: 'vitor-presas' },
              ],
            },
            'vitor-gru': {
              speakerId: 'controller',
              text: 'GUARULHOS TEM O MESMO PROBLEMA MAS EM ESCALA MAIOR. QUANDO RESOLVERMOS AQUI, O FLUXO PODE ESCORRER PARA LÁ. É UMA SEQUÊNCIA.',
              next: 'antonio-dominó',
            },
            'antonio-dominó': {
              speakerId: 'agente-j',
              text: 'EFEITO DOMINÓ AO CONTRÁRIO. INTERESANTE.',
            },
            'vitor-presas': {
              speakerId: 'controller',
              text: 'QUARENTA E SEIS. TODAS ESPERANDO LIBERAÇÃO DE PISTA. SEM SISTEMA, CADA LIBERAÇÃO É MANUAL. ESTAMOS EM QUATRO POR HORA.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'cgh-decongest',
        title: 'Descongestionar Terminal',
        kind: 'graph',
        reward: 180,
        prompt: 'Congonhas está congestionado. Identifique rotas alternativas para desviar o fluxo do gargalo.',
      },
      {
        id: 'cgh-traffic-decongest',
        title: 'Calibrar Fluxo de Tráfego',
        kind: 'chart',
        reward: 165,
        prompt: 'O tráfego está concentrado demais. Distribua o fluxo igualmente entre as pistas e gates.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+30 COMBUSTÍVEL', amount: 30, cost: 150 },
        { label: '+60 COMBUSTÍVEL', amount: 60, cost: 285 },
      ],
    },
  },

  // ─── CWB — Busca em Largura ────────────────────────────────────────────────
  CWB: {
    airportId: 'CWB',
    title: 'AEROPORTO DE CURITIBA',
    status: 'NEBLINA DENSA — VISIBILIDADE ZERO',
    npcs: [
      {
        id: 'leo',
        name: 'Analista Léo',
        role: 'Sistemas de navegação — Curitiba',
        sprite: 'controller',
        lines: [
          'A neblina não é metafórica. Os sistemas só mostram um nível de vizinhança de cada vez.',
          'Temos que explorar em camadas. Primeiro os vizinhos diretos, depois os deles.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. CURITIBA ESTÁ EM BLACKOUT DE VISIBILIDADE. SÓ CONSIGO VER OS NÓS IMEDIATAMENTE ADJACENTES. O RESTO É NEBLINA.',
              next: 'antonio-como-explora',
            },
            'antonio-como-explora': {
              speakerId: 'agente-j',
              text: 'COMO EXPLORAMOS SE NÃO ENXERGAMOS?',
              next: 'leo-bfs',
            },
            'leo-bfs': {
              speakerId: 'controller',
              text: 'EM CAMADAS. PRIMEIRO OS VIZINHOS DIRETOS DO NÓ INICIAL. DEPOIS OS VIZINHOS DOS VIZINHOS. E ASSIM POR DIANTE. BUSCA EM LARGURA — BFS.',
              choices: [
                { label: 'Tem jeito mais rápido?', next: 'leo-mais-rapido' },
                { label: 'Por que não ir direto ao destino?', next: 'leo-direto' },
              ],
            },
            'leo-mais-rapido': {
              speakerId: 'controller',
              text: 'DFS VAI MAIS FUNDO EM MENOS PASSOS — MAS NÃO GARANTE O CAMINHO MAIS CURTO. BFS GARANTE. COM A NEBLINA, PRECISAMOS DE GARANTIA, NÃO DE VELOCIDADE.',
              next: 'antonio-cebola',
            },
            'antonio-cebola': {
              speakerId: 'agente-j',
              text: 'EXPLORAR EM CAMADAS. COMO DESCASCAR UMA CEBOLA. CADA CASCA É UM NÍVEL DE DISTÂNCIA.',
              next: 'leo-perfeito',
            },
            'leo-perfeito': {
              speakerId: 'controller',
              text: 'PERFEITO. E A MELHOR PARTE: QUANDO ENCONTRAMOS O DESTINO, GARANTIMOS QUE É O CAMINHO MAIS CURTO.',
            },
            'leo-direto': {
              speakerId: 'controller',
              text: 'PORQUE NÃO SABEMOS ONDE ESTÁ O DESTINO. A NEBLINA ESCONDE TUDO ALÉM DO PRIMEIRO NÍVEL. SE FORMOS DIRETO, PODEMOS PASSAR POR CIMA SEM VER.',
            },
          },
        },
      },
      {
        id: 'passageiro-cwb',
        name: 'Passageira Silvia',
        role: 'Aguardando reconexão',
        sprite: 'passenger',
        lines: [
          'Estou tentando achar uma rota para Porto Alegre. Parece simples, mas...',
          'A neblina some e aparece. Quando acho um caminho, ele desaparece.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'passenger',
              text: 'JÁ TENTEI TRÊS CAMINHOS PARA PORTO ALEGRE. CADA UM PARECIA CERTO NO INÍCIO E SUMIA NO MEIO.',
              next: 'antonio-camadas',
            },
            'antonio-camadas': {
              speakerId: 'agente-j',
              text: 'VOCÊ ESTAVA INDO FUNDO DEMAIS SEM VERIFICAR OS VIZINHOS PRIMEIRO. EXPLORE EM CAMADAS.',
              next: 'silvia-entendeu',
            },
            'silvia-entendeu': {
              speakerId: 'passenger',
              text: 'CAMADA POR CAMADA. COMO VERIFICAR CADA DEGRAU DA ESCADA ANTES DE SUBIR O PRÓXIMO?',
              next: 'antonio-exato',
            },
            'antonio-exato': {
              speakerId: 'agente-j',
              text: 'EXATAMENTE ISSO.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'cwb-bfs-explore',
        title: 'Exploração em Largura',
        kind: 'graph',
        reward: 195,
        prompt: 'A neblina esconde vértices distantes. Explore a rede por níveis: vizinhos primeiro, depois vizinhos dos vizinhos.',
      },
      {
        id: 'cwb-bfs-levels',
        title: 'Calibrar Níveis de Visibilidade',
        kind: 'chart',
        reward: 175,
        prompt: 'Cada nível de distância tem uma opacidade diferente na neblina. Calibre a visibilidade por nível.',
      },
      {
        id: 'cwb-fog-clear',
        title: 'Dissipar Neblina Digital',
        kind: 'chart',
        reward: 165,
        prompt: 'Os setores estão envoltos em neblina digital. Aumente o sinal progressivamente setor por setor.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+30 COMBUSTÍVEL', amount: 30, cost: 155 },
        { label: '+65 COMBUSTÍVEL', amount: 65, cost: 300 },
      ],
    },
  },

  // ─── FLN — Busca em Profundidade ───────────────────────────────────────────
  FLN: {
    airportId: 'FLN',
    title: 'AEROPORTO DE FLORIANÓPOLIS',
    status: 'CORREDORES ABERTOS — SAÍDAS BLOQUEADAS',
    npcs: [
      {
        id: 'luna',
        name: 'Exploradora Luna',
        role: 'Planejamento de voo — Florianópolis',
        sprite: 'controller',
        lines: [
          'Os corredores de conexão aqui formam um labirinto. Cada caminho vai fundo.',
          'O glitch colocou becos sem saída em todo lugar. Você chega fundo, aí acabou.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. FLORIPA É UM LABIRINTO. OS CORREDORES VÃO FUNDO — MAS METADE TERMINA EM BECO SEM SAÍDA.',
              next: 'antonio-como-navega',
            },
            'antonio-como-navega': {
              speakerId: 'agente-j',
              text: 'COMO NAVEGO SEM PERDER TEMPO EM BECOS?',
              next: 'luna-dfs',
            },
            'luna-dfs': {
              speakerId: 'controller',
              text: 'BUSCA EM PROFUNDIDADE — DFS. VOCÊ VAI ATÉ O FIM DE UM CORREDOR. SE FOR BECO, RETROCEDE ATÉ O ÚLTIMO NÓ COM ALTERNATIVA NÃO VISITADA.',
              choices: [
                { label: 'E se eu esquecer onde estive?', next: 'luna-marcar' },
                { label: 'Por que não BFS aqui?', next: 'luna-bfs-aqui' },
              ],
            },
            'luna-marcar': {
              speakerId: 'controller',
              text: 'MARCA OS NÓS VISITADOS. ASSIM VOCÊ NUNCA ENTRA NO MESMO BECO DUAS VEZES. É A REGRA DE OURO DO LABIRINTO.',
              next: 'antonio-beco',
            },
            'antonio-beco': {
              speakerId: 'agente-j',
              text: 'LABIRINTO. JÁ TRABALHEI COM BUROCRACIA FEDERAL. MESMA COISA.',
              next: 'luna-ri',
            },
            'luna-ri': {
              speakerId: 'controller',
              text: 'PELO MENOS O LABIRINTO TEM SAÍDA.',
            },
            'luna-bfs-aqui': {
              speakerId: 'controller',
              text: 'BFS EXPLORA TODOS OS VIZINHOS ANTES DE IR FUNDO. AQUI OS CORREDORES SÃO LONGOS — DFS CHEGA MAIS RÁPIDO NO FIM DE CADA UM. SE FOR BECO, VOLTAMOS. SE NÃO FOR, SAÍMOS.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'fln-dfs-explore',
        title: 'Exploração em Profundidade',
        kind: 'graph',
        reward: 200,
        prompt: 'Explore os corredores até o fim. Quando encontrar um beco, retorne ao último vértice com alternativas.',
      },
      {
        id: 'fln-dfs-trace',
        title: 'Rastrear Profundidade da Rede',
        kind: 'chart',
        reward: 180,
        prompt: 'Registre a profundidade de cada nó. Nós mais profundos requerem mais recursos para alcançar.',
      },
      {
        id: 'fln-backtrack',
        title: 'Marcar Becos e Retroceder',
        kind: 'chart',
        reward: 165,
        prompt: 'Identifique os becos sem saída e elimine-os do mapa de rotas.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+30 COMBUSTÍVEL', amount: 30, cost: 160 },
        { label: '+65 COMBUSTÍVEL', amount: 65, cost: 305 },
      ],
    },
  },

  // ─── POA — O Caminho Mínimo ────────────────────────────────────────────────
  POA: {
    airportId: 'POA',
    title: 'AEROPORTO DE PORTO ALEGRE',
    status: 'ÚLTIMA REGIONAL — ROTA FINAL DO SUL',
    npcs: [
      {
        id: 'rosa',
        name: 'Capitã Rosa',
        role: 'Operações — Porto Alegre',
        sprite: 'controller',
        lines: [
          'Agente J. Porto Alegre é o último aeroporto da região Sul. Daqui, Brasília.',
          'Temos várias opções de rota. Mas combustível para uma tentativa. Calcule certo.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. PORTO ALEGRE É O FIM DA LINHA SUL. DAQUI, SÓ BRASÍLIA. MAS CADA ROTA TEM UM CUSTO DIFERENTE. COMBUSTÍVEL PARA UMA TENTATIVA.',
              next: 'antonio-calcula',
            },
            'antonio-calcula': {
              speakerId: 'agente-j',
              text: 'COMO CALCULO O MELHOR CAMINHO?',
              next: 'rosa-dijkstra',
            },
            'rosa-dijkstra': {
              speakerId: 'controller',
              text: 'SEMPRE ESCOLHA O CAMINHO COM MENOR CUSTO ACUMULADO CONHECIDO ATÉ AGORA. NUNCA O MAIS CURTO EM SALTOS — O MAIS BARATO NO TOTAL. É O ALGORITMO DE DIJKSTRA.',
              choices: [
                { label: 'Como sei o custo acumulado?', next: 'rosa-custo' },
                { label: 'E se encontrar um caminho mais barato depois?', next: 'rosa-atualiza' },
              ],
            },
            'rosa-custo': {
              speakerId: 'controller',
              text: 'SOMA OS PESOS DE CADA ARESTA PERCORRIDA. CADA VEZ QUE CHEGA NUM NÓ, VERIFICA SE O CAMINHO ATÉ ELE É MAIS BARATO DO QUE O REGISTRADO. SE FOR, ATUALIZA.',
              next: 'antonio-burocracia-poa',
            },
            'antonio-burocracia-poa': {
              speakerId: 'agente-j',
              text: 'PARECE UM PROCESSO BUROCRÁTICO. REVISAR TUDO A CADA PASSO.',
              next: 'rosa-ri',
            },
            'rosa-ri': {
              speakerId: 'controller',
              text: 'HA. MAS FUNCIONA. E GARANTE O MÍNIMO.',
            },
            'rosa-atualiza': {
              speakerId: 'controller',
              text: 'VOCÊ ATUALIZA O REGISTRO. DIJKSTRA NÃO PARA ATÉ PROCESSAR TODOS OS NÓS ALCANÇÁVEIS. AO FINAL, CADA NÓ TEM O CUSTO MÍNIMO REAL.',
            },
          },
        },
      },
      {
        id: 'mecanico-poa',
        name: 'Mecânico Zé',
        role: 'Manutenção — Porto Alegre',
        sprite: 'passenger',
        lines: [
          'Abasteci uns cinco aviões que tentaram essa rota. Só um voltou.',
          'Os outros calcularam errado. Não é sobre qual rota é mais curta. É sobre qual custa menos.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'passenger',
              text: 'JÁ VI MUITA GENTE PEGAR O CAMINHO MAIS CURTO EM SALTOS E FICAR SEM COMBUSTÍVEL NO MEIO. DOIS SALTOS CURTOS PODEM CUSTAR MAIS QUE UM SALTO LONGO.',
              next: 'antonio-peso-vs-salto',
            },
            'antonio-peso-vs-salto': {
              speakerId: 'agente-j',
              text: 'PESO TOTAL DA ROTA, NÃO NÚMERO DE SALTOS.',
              next: 'ze-exato',
            },
            'ze-exato': {
              speakerId: 'passenger',
              text: 'EXATO. O AVIÃO QUE VOLTOU USOU O CAMINHO MAIS LONGO EM SALTOS, MAS TODOS OS TRECHOS TINHAM VENTO FAVORÁVEL. CUSTO FINAL: METADE.',
              next: 'antonio-vento-favoravel',
            },
            'antonio-vento-favoravel': {
              speakerId: 'agente-j',
              text: 'ANALOGIA BOA. VOU LEMBRAR DISSO.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'poa-minimum-path',
        title: 'Calcular Caminho Mínimo',
        kind: 'graph',
        reward: 230,
        prompt: 'Combustível para uma tentativa. Calcule o caminho de menor custo acumulado até o destino.',
      },
      {
        id: 'poa-path-weights',
        title: 'Calibrar Pesos das Rotas',
        kind: 'chart',
        reward: 200,
        prompt: 'As arestas têm pesos diferentes. Calibre os valores corretos antes de calcular o caminho.',
      },
      {
        id: 'poa-minimum-route',
        title: 'Otimizar Rota Final',
        kind: 'chart',
        reward: 185,
        prompt: 'Minimize o custo total da rota: combustível, tempo e saltos são as métricas a equilibrar.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+40 COMBUSTÍVEL', amount: 40, cost: 195 },
        { label: '+80 COMBUSTÍVEL', amount: 80, cost: 370 },
      ],
    },
  },

  // ─── PVH — Porto Velho ─────────────────────────────────────────────────────
  PVH: {
    airportId: 'PVH',
    title: 'AEROPORTO DE PORTO VELHO',
    status: 'ISOLADO — CONEXÃO CRÍTICA NORTE-NORTE',
    npcs: [
      {
        id: 'controlador-pvh',
        name: 'Controlador Marcos',
        role: 'Rodônia — Porto Velho',
        sprite: 'controller',
        lines: [
          'Porto Velho sempre foi o fim do mundo. Mas agora é o fim do mundo sem comunicação.',
          'Tem Rio Branco a Oeste. Daqui dá pra fechar o corredor Norte.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J. PORTO VELHO É O NÓ MAIS ISOLADO DO NORTE. SÓ TRÊS CONEXÕES ATIVAS. MAS SEM ELA, O CORREDOR DA AMAZÔNIA NÃO FECHA.',
              next: 'antonio-rio-branco',
            },
            'antonio-rio-branco': {
              speakerId: 'agente-j',
              text: 'RIO BRANCO ESTÁ A OESTE. CONSEGUE CONTATO?',
              next: 'marcos-sinal',
            },
            'marcos-sinal': {
              speakerId: 'controller',
              text: 'SINAL FRACO MAS PRESENTE. BEATRIZ LÁ É CONFIÁVEL. SE VOCÊ FECHAR RIO BRANCO, A MALHA NORTE INTEIRA FICA CONECTADA.',
              choices: [
                { label: 'Qual o status das conexões aqui?', next: 'marcos-status' },
                { label: 'Vou para Rio Branco em seguida.', next: 'marcos-bom' },
              ],
            },
            'marcos-status': {
              speakerId: 'controller',
              text: 'MANAUS, BELÉM E RIO BRANCO. TRÊS ARESTAS. É POUCO, MAS FECHO O TRIÂNGULO DO NORTE.',
            },
            'marcos-bom': {
              speakerId: 'controller',
              text: 'BOM. QUANDO VOLTAR PRA BRASÍLIA, PASSA A INFORMAÇÃO QUE O CORREDOR NORTE ESTÁ DE PÉ.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'pvh-north-corridor',
        title: 'Abrir Corredor Norte',
        kind: 'graph',
        reward: 170,
        prompt: 'Porto Velho é nó crítico do Norte. Identifique as conexões disponíveis para fechar o corredor.',
      },
      {
        id: 'pvh-border-clear',
        title: 'Limpar Fronteiras Digitais',
        kind: 'chart',
        reward: 155,
        prompt: 'Interferências na fronteira bloqueiam comunicação. Calibre as frequências de borda.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+25 COMBUSTÍVEL', amount: 25, cost: 130 },
        { label: '+55 COMBUSTÍVEL', amount: 55, cost: 270 },
      ],
    },
  },

  // ─── RBR — Rio Branco / Nó Final ───────────────────────────────────────────
  RBR: {
    airportId: 'RBR',
    title: 'AEROPORTO DE RIO BRANCO',
    status: 'EXTREMO NORTE — NÓ FINAL DA MALHA',
    npcs: [
      {
        id: 'controlador-rbr',
        name: 'Controladora Beatriz',
        role: 'Acre — Rio Branco',
        sprite: 'controller',
        lines: [
          'Você chegou no fim do mapa. Não tem mais aeroporto depois daqui.',
          'Mas se fechar esse nó, a malha Norte fica completa. E você pode voltar pra Brasília.',
        ],
        dialogue: {
          start: 'abertura',
          nodes: {
            abertura: {
              speakerId: 'controller',
              text: 'AGENTE J? NÃO ESPERAVA VER NINGUÉM AQUI. RIO BRANCO É O FIM DO MAPA.',
              next: 'antonio-fim-mapa',
            },
            'antonio-fim-mapa': {
              speakerId: 'agente-j',
              text: 'SEMPRE ACABO NAS BORDAS DAS COISAS.',
              next: 'beatriz-rede',
            },
            'beatriz-rede': {
              speakerId: 'controller',
              text: 'SE VOCÊ FECHAR ESTE NÓ, A MALHA DO NORTE FICA COMPLETA. TODOS OS AEROPORTOS DA REGIÃO CONECTADOS.',
              choices: [
                { label: 'E depois?', next: 'beatriz-depois' },
                { label: 'Quanto falta para completar?', next: 'beatriz-quanto' },
              ],
            },
            'beatriz-depois': {
              speakerId: 'controller',
              text: 'DEPOIS VOCÊ VOLTA PARA BRASÍLIA. O NORTE ESTÁ COBERTO. O PROTOCOLO-M PERDE MAIS UM SETOR.',
              next: 'antonio-vamos-terminar',
            },
            'antonio-vamos-terminar': {
              speakerId: 'agente-j',
              text: 'ENTÃO VAMOS TERMINAR ISSO.',
            },
            'beatriz-quanto': {
              speakerId: 'controller',
              text: 'SÓ ESTE NÓ. VOCÊ FEZ TODO O CAMINHO. O NORTE TODO.',
            },
          },
        },
      },
    ],
    tasks: [
      {
        id: 'rbr-close-network',
        title: 'Fechar Malha do Norte',
        kind: 'graph',
        reward: 180,
        prompt: 'Rio Branco é o último nó da malha Norte. Conecte-o para completar o grafo regional.',
      },
      {
        id: 'rbr-final-node',
        title: 'Ativar Nó Final',
        kind: 'chart',
        reward: 165,
        prompt: 'O nó final precisa de máxima potência. Calibre todos os sistemas para operação completa.',
      },
    ],
    shop: {
      fuelOptions: [
        { label: '+35 COMBUSTÍVEL', amount: 35, cost: 170 },
        { label: '+70 COMBUSTÍVEL', amount: 70, cost: 325 },
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
