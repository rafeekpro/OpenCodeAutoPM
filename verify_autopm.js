const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');

const files = execSync('find autopm -name "*.md" -type f').toString().split('\n').filter(Boolean);

let issues = 0;

for (const f of files) {
    try {
        const txt = fs.readFileSync(f, 'utf8');
        if (txt.startsWith('---')) {
            const parts = txt.split('---');
            if (parts.length >= 3) {
                const yaml = parts[1];
                const lines = yaml.split('\n');

                let hasColor = false;
                let hasToolsStr = false;
                let hasBadDesc = false;
                let isAgent = f.includes('/agents/');
                let isCommand = f.includes('/commands/');
                let hasCommandKey = false;
                let hasDescKey = false;

                for (const line of lines) {
                    if (line.trim().startsWith('color:')) hasColor = true;
                    if (line.trim() === 'tools:' || line.match(/^tools:\s*$/)) hasToolsStr = true; // String tools
                    if (line.match(/^description:\s*##/)) hasBadDesc = true;
                    if (line.startsWith('command:')) hasCommandKey = true;
                    if (line.startsWith('description:')) hasDescKey = true;
                }

                if (hasColor) { console.log(`[Error] ${f}: Contains 'color:'`); issues++; }
                if (hasToolsStr && isAgent) { console.log(`[Error] ${f}: Contains invalid 'tools:' string`); issues++; }
                if (hasBadDesc) { console.log(`[Error] ${f}: Contains 'description: ##'`); issues++; }
                if (isCommand && !hasCommandKey) { console.log(`[Error] ${f}: Command missing 'command:' key`); issues++; }
                if (isCommand && !hasDescKey) { console.log(`[Error] ${f}: Command missing 'description:' key`); issues++; }
            }
        } else {
            if (f.includes('/commands/') && !f.includes('README')) {
                console.log(`[Error] ${f}: Command missing frontmatter entirely`);
                issues++;
            }
        }
    } catch (e) {
        console.error(e);
    }
}

if (issues === 0) {
    console.log("SUCCESS: All checked markdown files in autopm/ are correctly formatted!");
} else {
    console.log(`Found ${issues} issues in autopm/`);
}
