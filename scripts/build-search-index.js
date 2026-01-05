const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(__dirname, '../static/search-index.json');

function extractPreview(content, maxLength = 150) {
  // Remove markdown syntax and clean up whitespace
  let text = content
    .replace(/\r\n/g, ' ')
    .replace(/#{1,6}\s+/g, '')
    .replace(/:\w+-[\w-]+:/g, '') // Remove emoji shortcodes
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\*\*([^\*]+)\*\*/g, '$1')
    .replace(/\*([^\*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/\$\$[\s\S]*?\$\$/g, '') // Remove LaTeX blocks
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + '...';
  }

  return text || 'No preview available';
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.md')) {
      callback(filePath);
    }
  }
}

function buildSearchIndex() {
  const documents = [];
  let docId = 0;

  walkDir(DOCS_DIR, (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(DOCS_DIR, filePath);
    
    // Extract title from first heading or filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
    
    // Convert file path to URL
    const urlPath = relativePath
      .replace(/\\/g, '/')
      .replace(/\.md$/, '')
      .replace(/\/index$/, '');
    
    const url = `/site1000/docs/${urlPath}`;
    const preview = extractPreview(content);

    documents.push({
      id: String(docId++),
      title,
      url,
      content,
      preview,
    });
  });

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ documents }, null, 2));

  console.log(`✓ Built search index with ${documents.length} documents`);
  console.log(`✓ Output: ${OUTPUT_FILE}`);
}

buildSearchIndex();
