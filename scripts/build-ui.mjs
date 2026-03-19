import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const rootDir = process.cwd();
const sourceHtmlPath = path.join(rootDir, 'ui.source.html');
const sourceCssPath = path.join(rootDir, 'ui.css');
const sourceJsPath = path.join(rootDir, 'ui', 'main.js');
const outputHtmlPath = path.join(rootDir, 'ui.html');

const sourceHtml = await fs.readFile(sourceHtmlPath, 'utf8');
const sourceCss = await fs.readFile(sourceCssPath, 'utf8');

const jsBundle = await build({
  entryPoints: [sourceJsPath],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['chrome58'],
  write: false,
  charset: 'utf8',
  logLevel: 'silent',
});

const bundledJs = jsBundle.outputFiles[0]?.text;

if (!bundledJs) {
  throw new Error('Failed to bundle ui/main.js');
}

if (!sourceHtml.includes('<link rel="stylesheet" href="./ui.css">')) {
  throw new Error('Expected ui.source.html to reference ./ui.css');
}

if (!sourceHtml.includes('<script type="module" src="./ui/main.js"></script>')) {
  throw new Error('Expected ui.source.html to reference ./ui/main.js');
}

const builtHtml = sourceHtml
  .replace(
    '<link rel="stylesheet" href="./ui.css">',
    () => `<style>\n${sourceCss}\n</style>`
  )
  .replace(
    '<script type="module" src="./ui/main.js"></script>',
    () => `<script>\n${bundledJs}\n</script>`
  );

await fs.writeFile(outputHtmlPath, builtHtml);

console.log(`Built ${path.basename(outputHtmlPath)} from split UI sources.`);
