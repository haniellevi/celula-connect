#!/usr/bin/env node
/**
 * Script para configurar fontes Geist locais usando Google Fonts Helper
 * Uso: node scripts/setup-local-fonts.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const FONTS_DIR = 'public/fonts';
const CSS_FILE = 'src/app/fonts.css';

// CSS gerado pelo Google Fonts Helper para Geist
const GEIST_CSS = `/* Geist Sans */
@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 100;
  font-display: swap;
  src: url('/fonts/geist-sans-thin.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 200;
  font-display: swap;
  src: url('/fonts/geist-sans-extralight.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('/fonts/geist-sans-light.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/geist-sans-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/geist-sans-medium.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/geist-sans-semibold.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/geist-sans-bold.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url('/fonts/geist-sans-extrabold.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('/fonts/geist-sans-black.woff2') format('woff2');
}

/* Geist Mono */
@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 100;
  font-display: swap;
  src: url('/fonts/geist-mono-thin.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 200;
  font-display: swap;
  src: url('/fonts/geist-mono-extralight.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('/fonts/geist-mono-light.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/geist-mono-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/geist-mono-medium.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/geist-mono-semibold.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/geist-mono-bold.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url('/fonts/geist-mono-extrabold.woff2') format('woff2');
}

@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('/fonts/geist-mono-black.woff2') format('woff2');
}`;

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function main() {
  console.log('🚀 Configurando fontes Geist locais...\n');
  
  // Criar diretório de fontes
  await ensureDir(FONTS_DIR);
  
  // Criar arquivo CSS das fontes
  await fs.writeFile(CSS_FILE, GEIST_CSS);
  
  console.log('✅ Configuração concluída!');
  console.log(`📁 Diretório de fontes: ${FONTS_DIR}`);
  console.log(`📄 CSS das fontes: ${CSS_FILE}`);
  console.log('\n📝 Próximos passos:');
  console.log('1. Baixe os arquivos .woff2 das fontes Geist');
  console.log('2. Coloque-os na pasta public/fonts/');
  console.log('3. Atualize o layout.tsx para usar fontes locais');
  console.log('\n🔗 Links para download:');
  console.log('• Geist Sans: https://fonts.google.com/specimen/Geist');
  console.log('• Geist Mono: https://fonts.google.com/specimen/Geist+Mono');
  console.log('\n💡 Use o Google Fonts Helper: https://google-webfonts-helper.herokuapp.com/fonts/geist');
}

main().catch(console.error);
