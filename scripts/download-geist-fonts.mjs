#!/usr/bin/env node
/**
 * Script para baixar as fontes Geist do Google Fonts
 * Uso: node scripts/download-geist-fonts.mjs
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

const execAsync = promisify(exec);

const FONTS_DIR = 'public/fonts';
const GEIST_FONTS = [
  {
    name: 'Geist',
    weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    styles: ['normal', 'italic']
  },
  {
    name: 'Geist Mono',
    weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    styles: ['normal', 'italic']
  }
];

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function downloadFont(fontName, weight, style = 'normal') {
  const styleParam = style === 'italic' ? ':ital,wght@1' : ':wght@0';
  const weightParam = weight;
  
  const url = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}${styleParam},${weightParam}&display=swap`;
  
  console.log(`Baixando ${fontName} ${weight} ${style}...`);
  
  try {
    // Baixar CSS
    const { stdout: css } = await execAsync(`curl -s "${url}"`);
    
    // Extrair URLs das fontes do CSS
    const fontUrls = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g);
    
    if (!fontUrls) {
      console.warn(`Nenhuma fonte encontrada para ${fontName} ${weight} ${style}`);
      return;
    }
    
    // Baixar cada arquivo de fonte
    for (const urlMatch of fontUrls) {
      const fontUrl = urlMatch.match(/url\(([^)]+)\)/)[1];
      const fileName = path.basename(fontUrl);
      const filePath = path.join(FONTS_DIR, fileName);
      
      console.log(`  Baixando ${fileName}...`);
      await execAsync(`curl -s "${fontUrl}" -o "${filePath}"`);
    }
    
    console.log(`✅ ${fontName} ${weight} ${style} baixado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao baixar ${fontName} ${weight} ${style}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando download das fontes Geist...\n');
  
  // Criar diretório de fontes
  await ensureDir(FONTS_DIR);
  
  // Baixar todas as variações
  for (const font of GEIST_FONTS) {
    for (const weight of font.weights) {
      for (const style of font.styles) {
        await downloadFont(font.name, weight, style);
      }
    }
  }
  
  console.log('\n✅ Download concluído!');
  console.log(`📁 Fontes salvas em: ${FONTS_DIR}`);
  console.log('\n📝 Próximos passos:');
  console.log('1. Configure as fontes locais no layout.tsx');
  console.log('2. Atualize o globals.css se necessário');
}

main().catch(console.error);
