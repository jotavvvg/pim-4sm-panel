import { readFile, writeFile } from 'node:fs/promises';

const readInput = async (argument, fallback) => {
  const path = argument ?? fallback;
  const content = (await readFile(path, 'utf8')).trim();
  if (!content) {
    throw new Error(`O arquivo de entrada "${path}" está vazio.`);
  }
  return content;
};

const readmePath = 'README.md';
const tree = await readInput(process.argv[2], 'tree.txt');
const commit = await readInput(process.argv[3], 'commit.txt');
let readme = await readFile(readmePath, 'utf8');

const treePattern = /(<!-- START_TREE -->)([\s\S]*?)(<!-- END_TREE -->)/;
if (!treePattern.test(readme)) {
  throw new Error('README.md não contém as âncoras START_TREE e END_TREE.');
}

const treeBlock = `\n\`\`\`text\n${tree}\n\`\`\`\n`;
readme = readme.replace(
  treePattern,
  (_match, start, _content, end) => `${start}${treeBlock}${end}`,
);

const changelogPattern = /(<!-- START_CHANGELOG -->)([\s\S]*?)(<!-- END_CHANGELOG -->)/;
if (!changelogPattern.test(readme)) {
  throw new Error('README.md não contém as âncoras START_CHANGELOG e END_CHANGELOG.');
}

readme = readme.replace(changelogPattern, (match, start, history, end) => {
  if (history.split(/\r?\n/).some((line) => line.trim() === commit)) {
    return match;
  }
  return `${start}\n${commit}${history}${end}`;
});

await writeFile(readmePath, readme);
