#!/usr/bin/env node
/**
 * Baixa os modelos 3D do Google Drive via Drive API v3.
 *
 * Pré-requisito: uma API key do Google Cloud com Drive API habilitada.
 *   1. Acesse: https://console.cloud.google.com/apis/credentials
 *   2. Crie um projeto → Ative "Google Drive API" → Crie uma "API key"
 *   3. Crie o arquivo MixGraph/frontend/.env com:
 *        GOOGLE_API_KEY=sua_chave_aqui
 *
 * Uso:
 *   npm run setup-models
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = join(__dirname, '..');

// ─── Modelos ──────────────────────────────────────────────────────────────────
const MODELS = [
  {
    name: 'Eiffel Tower',
    folderId: '1wsTHNUIdp5DYh9MW9dSMsLx7j0sm_vmL',
    dest: 'public/models',
  },
  {
    name: 'Clock Tower (Big Ben)',
    folderId: '16v7LdXXnG3riagNmNRZJBmvV2Dnlwf_V',
    dest: 'src/assets/modelos_3d/clock_tower_big_ben',
  },
  {
    name: 'Greek Temple',
    folderId: '1JUKhqC9Kshx7A16XGpSn5HXcE5eYebEe',
    dest: 'src/assets/modelos_3d/greek_temple',
  },
  {
    name: 'Pikachu',
    folderId: '1_oCDeNwrKvjllyDpBDLcu1DSvR8ZFtOi',
    dest: 'src/assets/pikachu',
  },
  {
    name: 'Subnautica Aurora',
    folderId: '1pGEXUhH3VqbnvWRnk66J8q6YjoIVQPJQ',
    dest: 'src/assets/modelos_3d/subnautica_aurora',
  },
  {
    name: 'D20 Gold Edition',
    folderId: '1ATI6T7-OC3-ifY54GZbDNKKpWiWvkXCY',
    dest: 'src/assets/modelos_3d/d20-gold_edition_free',
  },
  {
    name: 'Empire State Building',
    folderId: '1NjuBzhkl0gZRJqVHR6p282ZZAfleZViO',
    dest: 'src/assets/modelos_3d/empire_state_building',
  },
  {
    name: 'Minecraft Grass Block',
    folderId: '1iS6oegPFGOrIkr3vbdrNJ85E7fyMS25Q',
    dest: 'src/assets/modelos_3d/minecraft_grass_block',
  },
  {
    name: 'Pokéball',
    folderId: '1q-tr7vtCwlf0MyvinmnHoHIsjJv8ZIOZ',
    dest: 'src/assets/modelos_3d/pokemon_basic_pokeball',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function loadApiKey() {
  if (process.env.GOOGLE_API_KEY) return process.env.GOOGLE_API_KEY;

  const envPath = join(FRONTEND_ROOT, '.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^GOOGLE_API_KEY\s*=\s*(.+)/);
      if (match) return match[1].trim();
    }
  }

  return null;
}

async function listFolder(folderId, apiKey) {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents`,
    fields: 'files(id,name,mimeType)',
    pageSize: '1000',
    key: apiKey,
  });
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Drive API ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.files ?? [];
}

async function downloadFile(fileId, destPath, apiKey) {
  const params = new URLSearchParams({ alt: 'media', key: apiKey });
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?${params}`);
  if (!res.ok) throw new Error(`Falha ao baixar ${fileId}: HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  writeFileSync(destPath, Buffer.from(buffer));
}

async function downloadFolder(folderId, destDir, apiKey, indent = '    ') {
  mkdirSync(destDir, { recursive: true });
  const files = await listFolder(folderId, apiKey);

  for (const file of files) {
    const filePath = join(destDir, file.name);
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      await downloadFolder(file.id, filePath, apiKey, indent + '  ');
    } else {
      if (existsSync(filePath)) {
        console.log(`${indent}✓ ${file.name} (já existe)`);
        continue;
      }
      process.stdout.write(`${indent}⬇  ${file.name}...`);
      await downloadFile(file.id, filePath, apiKey);
      process.stdout.write(' ✓\n');
    }
  }
}

async function main() {
  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error('❌ GOOGLE_API_KEY não encontrada.');
    console.error('');
    console.error('   1. Acesse: https://console.cloud.google.com/apis/credentials');
    console.error('   2. Crie um projeto → Ative "Google Drive API" → Crie uma "API key"');
    console.error('   3. Crie o arquivo MixGraph/frontend/.env com:');
    console.error('        GOOGLE_API_KEY=sua_chave_aqui');
    process.exit(1);
  }

  console.log('🎮 Configurando modelos 3D...\n');

  for (const model of MODELS) {
    const destDir = join(FRONTEND_ROOT, model.dest);
    const sentinel = join(destDir, 'scene.gltf');

    if (existsSync(sentinel)) {
      console.log(`  ✓ ${model.name} já instalado.`);
      continue;
    }

    console.log(`  ⬇  ${model.name}`);
    try {
      await downloadFolder(model.folderId, destDir, apiKey);
    } catch (err) {
      console.error(`  ❌ Erro em ${model.name}: ${err.message}`);
    }
  }

  console.log('\n✅ Modelos 3D prontos!');
}

main().catch((err) => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
