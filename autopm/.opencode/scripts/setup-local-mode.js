const fs = require('fs').promises;
const path = require('path');

/**
 * Setup local mode directory structure
 * Creates .opencode/prds/, .opencode/epics/, .opencode/context/, .opencode/logs/
 *
 * @returns {Promise<void>}
 */
async function setupLocalDirectories() {
  const baseDir = path.join(process.cwd(), '.opencode');

  const directories = [
    'prds',       // Product Requirements Documents
    'epics',      // Epic definitions and task breakdowns
    'context',    // Project context files (NEW)
    'logs'        // Verification and operation logs (NEW)
  ];

  for (const dir of directories) {
    const dirPath = path.join(baseDir, dir);

    try {
      await fs.mkdir(dirPath, { recursive: true, mode: 0o755 });
      console.log(`✅ Created ${dirPath}`);
    } catch (err) {
      // EEXIST is OK - directory already exists
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
  }
}

/**
 * Update .gitignore with OpenCodeAutoPM local mode entries
 * Creates .gitignore if it doesn't exist
 * Appends entries if .gitignore exists (idempotent)
 *
 * @returns {Promise<void>}
 */
async function updateGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');

  const entries = [
    '# OpenCodeAutoPM Local Mode',
    '.opencode/logs/*.log',
    '.opencode/context/.context-version',
    '.opencode/prds/drafts/',
    ''
  ].join('\n');

  try {
    // Try to read existing .gitignore
    const existing = await fs.readFile(gitignorePath, 'utf8');

    // Check if our entries are already present
    if (!existing.includes('.opencode/logs/')) {
      // Append our entries
      await fs.appendFile(gitignorePath, '\n' + entries);
      console.log('✅ Updated .gitignore');
    } else {
      console.log('ℹ️  .gitignore already contains OpenCodeAutoPM entries');
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      // .gitignore doesn't exist, create it
      await fs.writeFile(gitignorePath, entries);
      console.log('✅ Created .gitignore');
    } else {
      throw err;
    }
  }
}

/**
 * Main setup function
 * Called during `open-autopm install` or standalone
 *
 * @returns {Promise<void>}
 */
async function setup() {
  console.log('🚀 Setting up OpenCodeAutoPM local mode...\n');

  try {
    await setupLocalDirectories();
    await updateGitignore();

    console.log('\n✅ Local mode setup complete!');
    console.log('\nCreated directories:');
    console.log('  - .opencode/prds/     (Product Requirements Documents)');
    console.log('  - .opencode/epics/    (Epic breakdowns and tasks)');
    console.log('  - .opencode/context/  (Project context files)');
    console.log('  - .opencode/logs/     (Operation logs)');
    console.log('\nUpdated .gitignore with exclusions for:');
    console.log('  - .opencode/logs/*.log');
    console.log('  - .opencode/context/.context-version');
    console.log('  - .opencode/prds/drafts/');
    console.log('\nYou can now use local mode commands:');
    console.log('  /pm:prd-new --local "Feature Name"');
    console.log('  /pm:epic-decompose --local <id>');
    console.log('  /pm:context-create');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);

    // Provide helpful error messages
    if (error.code === 'EACCES') {
      console.error('\nPermission denied. Try running with sudo or check directory permissions.');
    } else if (error.code === 'ENOSPC') {
      console.error('\nNo space left on device. Free up some space and try again.');
    }

    process.exit(1);
  }
}

// If run directly (not required as module)
if (require.main === module) {
  setup();
}

module.exports = {
  setupLocalDirectories,
  updateGitignore,
  setup
};
