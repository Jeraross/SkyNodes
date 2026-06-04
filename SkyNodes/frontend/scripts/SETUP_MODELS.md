# Setup de Modelos 3D

Os modelos 3D são grandes demais para o repositório e estão hospedados no Google Drive.
Rode o script abaixo para baixá-los automaticamente antes de iniciar o projeto.

## Pré-requisito: Google API Key

1. Acesse [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Crie um projeto (ou use um existente)
3. Ative a **Google Drive API** no projeto
4. Clique em **Criar credenciais → Chave de API**
5. Em restrições, selecione **Google Drive API** e **Nenhum** para tipo de aplicativo

Crie o arquivo `MixGraph/frontend/.env` com:

```
GOOGLE_API_KEY=sua_chave_aqui
```

> O `.env` está no `.gitignore` — nunca commite a chave.

## Baixar os modelos

```bash
cd MixGraph/frontend
npm run setup-models
```

O script:
- Baixa cada modelo do Drive para a pasta correta
- Pula arquivos que já existem localmente
- Funciona em Windows, Mac e Linux

## Modelos incluídos

| Modelo | Destino |
|--------|---------|
| Eiffel Tower | `public/models/` |
| Clock Tower (Big Ben) | `src/assets/modelos_3d/clock_tower_big_ben/` |
| Greek Temple | `src/assets/modelos_3d/greek_temple/` |
| Pikachu | `src/assets/pikachu/` |
| Subnautica Aurora | `src/assets/modelos_3d/subnautica_aurora/` |
| D20 Gold Edition | `src/assets/modelos_3d/d20-gold_edition_free/` |
| Empire State Building | `src/assets/modelos_3d/empire_state_building/` |
| Minecraft Grass Block | `src/assets/modelos_3d/minecraft_grass_block/` |
| Pokéball | `src/assets/modelos_3d/pokemon_basic_pokeball/` |

## Adicionar um novo modelo

1. Faça upload da pasta do modelo no Google Drive (acesso: "Qualquer pessoa com o link")
2. Copie o ID da pasta (parte após `/folders/` no link)
3. Adicione uma entrada no array `MODELS` em `scripts/download-models.mjs`
