# Configuração de Fontes Geist

Este documento explica como configurar as fontes Geist no projeto, tanto usando Google Fonts quanto fontes locais.

## Opção 1: Google Fonts (Atual - Recomendado)

O projeto já está configurado para usar as fontes Geist do Google Fonts através do Next.js:

```tsx
// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

**Vantagens:**
- ✅ Configuração automática
- ✅ Otimização automática pelo Next.js
- ✅ Sem necessidade de download manual
- ✅ Cache automático

## Opção 2: Fontes Locais (Self-hosted)

Se você quiser ter controle total sobre as fontes e não depender do Google Fonts:

### Passo 1: Configurar estrutura

```bash
npm run fonts:setup
```

Este comando criará:
- `public/fonts/` - Diretório para os arquivos de fonte
- `src/app/fonts.css` - CSS com as definições das fontes

### Passo 2: Baixar as fontes

**Opção A: Download automático (requer curl)**
```bash
npm run fonts:download
```

**Opção B: Download manual**
1. Acesse [Google Fonts Helper](https://google-webfonts-helper.herokuapp.com/fonts/geist)
2. Selecione as variações desejadas
3. Baixe os arquivos .woff2
4. Coloque-os na pasta `public/fonts/`

### Passo 3: Atualizar o layout

Substitua o conteúdo de `src/app/layout.tsx` pelo exemplo em `src/app/layout-local-fonts.tsx.example`:

```tsx
import "./fonts.css"; // Importar CSS das fontes locais

// Remover imports do Google Fonts
// import { Geist, Geist_Mono } from "next/font/google";

// Usar configuração local
const geistSans = {
  variable: "--font-geist-sans",
  className: "font-geist-sans",
};

const geistMono = {
  variable: "--font-geist-mono", 
  className: "font-geist-mono",
};
```

### Passo 4: Atualizar CSS

O arquivo `src/app/globals.css` já está configurado para usar as variáveis CSS:

```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
```

## Comparação das Opções

| Aspecto | Google Fonts | Fontes Locais |
|---------|--------------|---------------|
| **Performance** | ⚡ Otimizada automaticamente | ⚡ Controle total |
| **Confiabilidade** | 🌐 Depende do Google | 🏠 100% local |
| **Manutenção** | 🔄 Automática | 🔧 Manual |
| **Tamanho** | 📦 Apenas variações usadas | 📦 Todas as variações |
| **Privacidade** | 📊 Dados para Google | 🔒 Sem tracking |

## Recomendação

Para a maioria dos casos, **recomendamos manter o Google Fonts** (Opção 1) porque:

1. **Performance**: O Next.js otimiza automaticamente
2. **Simplicidade**: Não requer manutenção
3. **Confiabilidade**: Google tem excelente uptime
4. **Tamanho**: Apenas as variações usadas são carregadas

Use fontes locais apenas se:
- Você tem requisitos específicos de privacidade
- Quer controle total sobre o carregamento
- Está em um ambiente sem acesso à internet

## Troubleshooting

### Fontes não carregam
1. Verifique se os arquivos estão na pasta correta
2. Confirme se o CSS está sendo importado
3. Verifique o console do navegador para erros 404

### Performance lenta
1. Use apenas as variações necessárias
2. Considere usar `font-display: swap`
3. Verifique se os arquivos estão otimizados (.woff2)

### Fallbacks
O CSS já inclui fallbacks automáticos:
```css
font-family: var(--font-geist-sans), system-ui, -apple-system, sans-serif;
```
