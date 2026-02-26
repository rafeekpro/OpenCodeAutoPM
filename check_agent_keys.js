const fs = require('fs');
const execSync = require('child_process').execSync;

const files = execSync('find packages -name "*.md" | grep "/agents/"').toString().split('\n').filter(Boolean);
const keys = new Set();
for (const f of files) {
    try {
        const txt = fs.readFileSync(f, 'utf8');
        if (txt.startsWith('---')) {
            const parts = txt.split('---');
            if (parts.length >= 3) {
                const lines = parts[1].split('\n');
                for (const line of lines) {
                    if (line.includes(':') && !line.trim().startsWith('#')) {
                        keys.add(line.split(':')[0].trim());
                    }
                }
            }
        }
    } catch (e) { }
}
console.log(Array.from(keys));
