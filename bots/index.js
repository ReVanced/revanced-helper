import { readdirSync } from 'node:fs';

const botFolders = readdirSync('./', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

for (const botFolder of botFolders) {
    if (botFolder === 'node_modules') continue;
    const botIndex = await import(`./${botFolder}/index.js`);
    botIndex.default();
}