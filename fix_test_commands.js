const fs = require('fs');
const execSync = require('child_process').execSync;
const files = execSync('find ../test/.opencode/commands -name "*.md" -type f').toString().split('\n').filter(Boolean);

for (const f of files) {
    try {
        let txt = fs.readFileSync(f, 'utf8');
        const filename = f.split('/').pop().replace('.md', '');

        if (txt.startsWith('---')) {
            const parts = txt.split('---');
            if (parts.length >= 3) {
                let yaml = parts[1];
                if (!yaml.includes('description:')) {
                    let desc = 'Command ' + filename;

                    // Try to find first H1 or paragraph
                    const bodyLines = parts.slice(2).join('---').split('\n');
                    for (let i = 0; i < bodyLines.length; i++) {
                        if (bodyLines[i].startsWith('# ') && bodyLines[i + 2] && bodyLines[i + 2].trim() !== '') {
                            desc = bodyLines[i + 2].replace(/["']/g, '').trim();
                            break;
                        }
                    }

                    yaml = yaml.trim() + '\ncommand: ' + filename + '\ndescription: "' + desc + '"\n';
                    parts[1] = '\n' + yaml + '\n';
                    fs.writeFileSync(f, parts.join('---'));
                    console.log('Fixed', f);
                }
            }
        } else {
            // no frontmatter
            const newFrontmatter = '---\ncommand: ' + filename + '\ndescription: "' + filename + '"\n---\n\n';
            fs.writeFileSync(f, newFrontmatter + txt);
            console.log('Added frontmatter to', f);
        }
    } catch (e) {
        console.error(e);
    }
}
