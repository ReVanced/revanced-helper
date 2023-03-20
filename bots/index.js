import { readdirSync } from 'node:fs';

const botFolders = readdirSync('./', { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory())
	.map((dirent) => dirent.name);

const runBotOnly = process.argv[2] ? process.argv[2] : null;
for (const botFolder of botFolders) {
	if (botFolder === 'node_modules') continue;
	if (runBotOnly && runBotOnly !== botFolder) continue;
	const botIndex = await import(`./${botFolder}/index.js`);
	botIndex.default();
}
