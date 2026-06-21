/** 
* ---- Builder for javasript web app -----
* This builder read index.html file, take all the script sources and merge them in one obfuscated inline script
* then output the result in "dist" folder as index.html file with the inlined scripts
*
* Needs nodeJS with cheerio and terser.
* Can be launched with :
* - npm install cheerio terser
* - node build.js
*/

//Dependencies
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { minify } = require('terser');

//Const
const APP_ROOT = path.join(__dirname, '../');

//Build behavior
async function build() {
  // Chemins d'entrée et de sortie
  const inputHtmlPath = path.join(APP_ROOT, 'index.html');
  const outputDir = path.join(APP_ROOT, 'dist');
  const outputHtmlPath = path.join(outputDir, '../index.html');

  // Créer le dossier dist s'il n'existe pas
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // ==========================================
  // 1. GESTION DES FICHIERS PWA (Manifest, SW, etc.)
  // ==========================================
  // Liste des fichiers spécifiques à copier à la racine de dist
  const pwaFiles = ['manifest.json', 'sw.js'];

  pwaFiles.forEach(fileName => {
    const srcPath = path.join(__dirname, fileName);
    const destPath = path.join(outputDir, fileName);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`📦 PWA : ${fileName} a été copié dans dist/`);
    }
  });

  // (Optionnel) Si tu as un dossier d'icônes pour ta PWA, tu peux aussi le copier ici
  // const iconsDir = path.join(__dirname, 'icons');
  // if (fs.existsSync(iconsDir)) { ... logique pour copier le dossier ... }


  // ==========================================
  // 2. TRAITEMENT DU HTML ET DES SCRIPTS JS
  // ==========================================
  const html = fs.readFileSync(inputHtmlPath, 'utf-8');
  const $ = cheerio.load(html);
  
  let combinedJs = '';

  // Trouver et concaténer les scripts en respectant l'ordre
  $('script[src]').each((index, element) => {
    const src = $(element).attr('src');
    
    // Ignorer le service worker s'il est appelé via une balise script standard
    if (src === 'sw.js') return;

    const jsFilePath = path.join(__dirname, src);
    
    if (fs.existsSync(jsFilePath)) {
      combinedJs += fs.readFileSync(jsFilePath, 'utf-8') + '\n';
      $(element).remove(); // Enlever l'ancienne balise
    } else {
      console.warn(`⚠️ Attention: Le fichier ${src} est introuvable.`);
    }
  });

  // Obfusquer et minifier le JS combiné
  if (combinedJs.trim().length > 0) {
    const minifiedResult = await minify(combinedJs, {
      compress: true,
      mangle: true
    });

    if (minifiedResult.error) {
      console.error('❌ Erreur lors de la minification:', minifiedResult.error);
      process.exit(1);
    }

    // Injecter le code inline à la fin du body
    $('body').append(`<script>${minifiedResult.code}</script>`);
  }

  // Sauvegarder le fichier HTML final
  fs.writeFileSync(outputHtmlPath, $.html());
  console.log('🚀 Build terminé avec succès ! Tout est prêt dans ./dist');
}

build();
