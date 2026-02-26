const fs = require('fs');
const path = require('path');

function getFrontmatterKeys() {
  const execSync = require('child_process').execSync;
  const files = execSync('find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*"').toString().split('\n').filter(Boolean);
  
  const keys = new Set();
  const unsupportedFiles = [];

  for (const f of files) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      if (content.trim().startsWith('---')) {
        const parts = content.split('---');
        if (parts.length >= 3) {
          const yaml = parts[1].trim();
          const lines = yaml.split('\n');
          const currentKeys = [];
          for (const line of lines) {
            if (line.includes(':') && !line.trim().startsWith('#')) {
              const key = line.split(':')[0].trim();
              if (key && !key.includes(' ')) {
                currentKeys.push(key);
                keys.add(key);
              }
            }
          }
          
          const badKeys = ['allowed-tools', 'author', 'version', 'type', 'agent', 'tags', 'dependencies'];
          const foundBadKeys = currentKeys.filter(k => badKeys.includes(k));
          if (foundBadKeys.length > 0) {
            unsupportedFiles.push({ file: f, badKeys: foundBadKeys });
          }
        }
      }
    } catch (e) {}
  }
  console.log('Unique keys found in MD frontmatters:');
  console.log(Array.from(keys).join(', '));
  console.log('\nFiles with potentially unsupported frontmatter fields (like allowed-tools):');
  unsupportedFiles.forEach(uf => console.log(`${uf.file}: ${uf.badKeys.join(', ')}`));
}
getFrontmatterKeys();
