const fs = require('fs');
const execSync = require('child_process').execSync;
const files = execSync('find . -type f \\( -name "*.js" -o -name "*.md" \\) -not -path "*/node_modules/*" -not -path "*/.git/*"').toString().split('\n').filter(Boolean);
for (const f of files) {
    try {
        let content = fs.readFileSync(f, 'utf8');
        if (content.includes('opencode-templates')) {
            content = content.replace(/opencode-templates/g, 'opencode-templates');
            fs.writeFileSync(f, content);
            console.log('Updated ' + f);
        }
    } catch (e) { }
}
