const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const files = execSync('find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*"').toString().split('\n').filter(Boolean);

const invalidKeys = ['allowed-tools', 'agent', 'type', 'version'];
let foundIssues = false;

for (const f of files) {
    try {
        const content = fs.readFileSync(f, 'utf8');
        if (content.startsWith('---')) {
            const parts = content.split('---');
            if (parts.length >= 3) {
                const yaml = parts[1];
                const lines = yaml.split('\n');
                for (const line of lines) {
                    if (line.includes(':') && !line.trim().startsWith('#')) {
                        const key = line.split(':')[0].trim();
                        if (invalidKeys.includes(key) || key.includes(' ')) {
                            console.log(`Potential issue in ${f}: key "${key}" found.`);
                            foundIssues = true;
                        }
                    }
                }
            }
        }
    } catch (e) { }
}

if (!foundIssues) {
    console.log("All clear! No suspicious keys found.");
}
