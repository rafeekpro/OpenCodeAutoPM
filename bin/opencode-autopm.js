#!/usr/bin/env node

/**
 * OpenCodeAutoPM CLI - Refactored with yargs
 * This is the main CLI entry point using yargs for command management
 */

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const fs = require('fs-extra');

// Get package info for version
const packageJson = require('../package.json');
const VERSION = packageJson.version;

// Main CLI function
function main() {
  const cli = yargs(hideBin(process.argv));

  cli
    // Main commands
    .command('install [preset]', 'Install OpenCodeAutoPM framework in current project directory',
      (yargs) => {
        return yargs
          .positional('preset', {
            describe: 'Installation preset (1-5)',
            type: 'number'
          });
      },
      (argv) => {
        // Delegate to the install script
        const { execSync } = require('child_process');
        const installPath = path.join(__dirname, '..', 'install', 'install.sh');
        try {
          execSync(`bash ${installPath}`, {
            stdio: 'inherit',
            env: { ...process.env, AUTOPM_PRESET: argv.preset || '' }
          });
        } catch (error) {
          console.error('Installation failed:', error.message);
          process.exit(1);
        }
      }
    )
    .command('update', 'Update OpenCodeAutoPM framework to latest version in current project',
      (yargs) => {
        return yargs
          .option('force', {
            describe: 'Force update even if project structure differs',
            type: 'boolean',
            default: false
          })
          .option('backup', {
            describe: 'Create backup before updating',
            type: 'boolean',
            default: true
          })
          .option('preserve-config', {
            describe: 'Preserve existing configuration files',
            type: 'boolean',
            default: true
          })
          .example('open-autopm update', 'Update to latest version')
          .example('open-autopm update --force', 'Force update ignoring conflicts')
          .example('open-autopm update --no-backup', 'Update without creating backup');
      },
      (argv) => {
        // Delegate to the update script
        const { execSync } = require('child_process');
        const updatePath = path.join(__dirname, '..', 'install', 'update.sh');
        try {
          const env = {
            ...process.env,
            AUTOPM_FORCE: argv.force ? '1' : '0',
            AUTOPM_BACKUP: argv.backup ? '1' : '0',
            AUTOPM_PRESERVE_CONFIG: argv.preserveConfig ? '1' : '0'
          };
          execSync(`bash ${updatePath}`, {
            stdio: 'inherit',
            env
          });
        } catch (error) {
          console.error('Update failed:', error.message);
          process.exit(1);
        }
      }
    )
    .command('guide [action]', 'Interactive setup guide and documentation generator (deprecated: use --help)',
      (yargs) => {
        return yargs
          .positional('action', {
            describe: 'Guide action (default: show enhanced help)',
            type: 'string',
            choices: ['quickstart', 'install', 'config', 'tutorial', 'examples', 'faq'],
            default: 'quickstart'
          })
          .option('platform', {
            describe: 'Target platform for installation guide',
            type: 'string',
            choices: ['node', 'docker', 'kubernetes'],
            default: 'node'
          })
          .option('topic', {
            describe: 'Tutorial topic',
            type: 'string'
          })
          .example('open-autopm --help', 'Show comprehensive usage guide (recommended)')
          .example('open-autopm guide', 'Show enhanced help (same as --help)')
          .example('open-autopm guide config', 'Generate configuration documentation');
      },
      async (argv) => {
        try {
          if (argv.action && argv.action !== 'quickstart') {
            // Legacy documentation generation for specific actions
            const GuideManager = require('../lib/guide/manager');
            const manager = new GuideManager();

            console.log('\n🎯 OpenCodeAutoPM Documentation Generator');
            console.log('=====================================\n');

            switch (argv.action) {
              case 'install':
                console.log(`📦 Generating Installation Guide for ${argv.platform}...\n`);
                const installResult = await manager.generateInstallationGuide(argv.platform, argv);
                console.log(`✅ Installation guide created: ${installResult.path}`);
                console.log(`🖥️  Platform: ${installResult.platform}\n`);
                break;

              case 'config':
                console.log('⚙️  Generating Configuration Guide...\n');
                const configResult = await manager.generateConfigGuide(argv);
                console.log(`✅ Configuration guide created: ${configResult.path}\n`);
                break;

              case 'tutorial':
                const topic = argv.topic || 'basics';
                console.log(`🎓 Creating ${topic} Tutorial...\n`);
                const tutorialResult = await manager.createTutorial(topic, argv);
                console.log(`✅ Tutorial created: ${tutorialResult.path}\n`);
                break;

              case 'examples':
                console.log('💡 Generating Code Examples...\n');
                const examplesResult = await manager.generateExamples(argv.category || 'general', argv);
                console.log(`✅ Examples created: ${examplesResult.path}\n`);
                break;

              case 'faq':
                console.log('❓ Generating FAQ Document...\n');
                const faqResult = await manager.generateFAQ(argv);
                console.log(`✅ FAQ created: ${faqResult.path}\n`);
                break;

              default:
                console.log('❌ Unknown guide action. Use: open-autopm guide --help');
            }
          } else {
            // Backward compatibility: redirect to enhanced help
            console.log('💡 The interactive guide has been replaced with enhanced help.\n');
            console.log('📖 For comprehensive usage information, use: open-autopm --help\n');
            console.log('🔧 For specific documentation generation, use:');
            console.log('   open-autopm guide config    # Generate configuration docs');
            console.log('   open-autopm guide tutorial  # Create tutorials');
            console.log('   open-autopm guide examples  # Generate examples\n');

            // Show the enhanced help
            process.argv = ['node', 'autopm', '--help'];
            cli.showHelp();
          }
        } catch (error) {
          console.error(`❌ Guide error: ${error.message}`);
          process.exit(1);
        }
      }
    )
    // Team management command
    .command(require('./commands/team'))
    // Config management command
    .command(require('./commands/config'))
    // MCP management command
    .command(require('./commands/mcp'))
    // Plugin management command
    .command(require('./commands/plugin'))
    // Epic management command (STANDALONE)
    .command(require('../lib/cli/commands/epic'))
    // Issue management command (STANDALONE)
    .command(require('../lib/cli/commands/issue'))
    // PM workflow commands (STANDALONE)
    .command(require('../lib/cli/commands/pm'))
    // PRD management command (STANDALONE)
    .command(require('../lib/cli/commands/prd'))
    // Task management command (STANDALONE)
    .command(require('../lib/cli/commands/task'))
    // Agent management command (STANDALONE)
    .command(require('../lib/cli/commands/agent'))
    // Context management command (STANDALONE)
    .command(require('../lib/cli/commands/context'))
    // Validation command
    .command('validate', 'Validate OpenCodeAutoPM configuration and setup',
      (yargs) => {
        return yargs
          .example('open-autopm validate', 'Check all configuration requirements')
          .example('open-autopm validate --verbose', 'Show detailed validation info');
      },
      async (argv) => {
        const PostInstallChecker = require('../install/post-install-check.js');
        const checker = new PostInstallChecker();

        try {
          await checker.runAllChecks();
          process.exit(0);
        } catch (error) {
          console.error(`❌ Validation error: ${error.message}`);
          if (argv.debug) {
            console.error(error.stack);
          }
          process.exit(1);
        }
      }
    )
    // Global options
    .option('verbose', {
      type: 'boolean',
      description: 'Run with verbose logging'
    })
    .option('debug', {
      type: 'boolean',
      description: 'Run with debug output'
    })
    // Help and version
    .version(VERSION)
    .alias('version', 'v')
    .help()
    .alias('help', 'h')
    // Error handling and requirements
    .demandCommand(1, 'You must provide a command. Use --help to see available options.')
    .recommendCommands()
    .strictCommands()
    .wrap(cli.terminalWidth())
    // Enhanced help epilogue
    .epilogue(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    OpenCodeAutoPM v${VERSION} - Quick Reference                    ║
║         AI-Powered Project Management for OpenCode Code                      ║
╚════════════════════════════════════════════════════════════════════════════╝

🚀 Quick Start (3 Steps):
   1. open-autopm install                    # Install framework in project
   2. open-autopm config set provider github # Configure your provider
   3. claude --dangerously-skip-permissions .  # Open OpenCode Code

🆕 NEW in v2.1.0 - STANDALONE Commands:
   open-autopm prd parse <name>              # Parse PRD without AI overhead
   open-autopm prd extract-epics <name>      # Extract epics from PRD
   open-autopm prd summarize <name>          # Generate PRD summary
   open-autopm prd validate <name>           # Validate PRD structure

   open-autopm task list <epic>              # List tasks from epic
   open-autopm task prioritize <epic>        # AI-powered prioritization

   open-autopm agent list                    # List available agents
   open-autopm agent search <keyword>        # Search agents
   open-autopm agent invoke <name> <task>    # Invoke agent directly

📋 Common Commands:
   open-autopm validate                      # Check configuration status
   open-autopm update                        # Update to latest version
   open-autopm team load fullstack           # Load development agents
   open-autopm mcp enable context7           # Enable documentation access
   open-autopm config show                   # View current configuration

🔧 Configuration Setup:
   # View current configuration
   open-autopm config show

   # Configure GitHub provider
   open-autopm config set provider github
   open-autopm config set github.owner <username>
   open-autopm config set github.repo <repository>

   # Add token to .opencode/.env (recommended)
   echo "GITHUB_TOKEN=ghp_your_token_here" >> .opencode/.env

   # Or export as environment variable
   export GITHUB_TOKEN=ghp_your_token_here

   # Configure Azure DevOps provider
   open-autopm config set provider azure
   open-autopm config set azure.organization <org>
   open-autopm config set azure.project <project>

   # Add token to .opencode/.env (recommended)
   echo "AZURE_DEVOPS_PAT=your_azure_pat" >> .opencode/.env

   # Or export as environment variable
   export AZURE_DEVOPS_PAT=your_azure_pat

   # Quick switch between providers
   open-autopm config switch github
   open-autopm config switch azure

   # Validate configuration
   open-autopm config validate

🔌 MCP (Model Context Protocol) Management:
   # List and manage MCP servers
   open-autopm mcp list                  # List all available MCP servers
   open-autopm mcp enable context7  # Enable documentation server
   open-autopm mcp sync                  # Sync configuration to .opencode/mcp-servers.json

   # Agent Analysis
   open-autopm mcp agents                # List agents using MCP
   open-autopm mcp agent react-frontend-engineer  # Show MCP config for agent
   open-autopm mcp usage                 # Show MCP usage statistics
   open-autopm mcp tree                  # Show agent-MCP dependency tree

   # Configuration & Diagnostics
   open-autopm mcp setup                 # Interactive API key setup
   open-autopm mcp diagnose              # Run comprehensive diagnostics
   open-autopm mcp test context7    # Test MCP server connection
   open-autopm mcp status                # Show all MCP servers status

🔑 Token Setup:
   # RECOMMENDED: Store tokens in .opencode/.env file
   echo "GITHUB_TOKEN=ghp_your_token" >> .opencode/.env
   echo "AZURE_DEVOPS_PAT=your_pat" >> .opencode/.env

   # The .env file is automatically loaded during validation
   open-autopm config validate

   # GitHub PAT (Settings → Developer settings → Personal access tokens)
   Scopes: repo, workflow, admin:repo_hook

   # Azure DevOps PAT (User settings → Personal access tokens)
   Scopes: Work Items (read/write), Code (read/write)

🤖 Team Management:
   open-autopm team list                 # See all available agent teams
   open-autopm team load <name>          # Load specific team (frontend/backend/fullstack/devops)
   open-autopm team current              # Check currently active team

📊 Epic Status (Read-Only Utilities):
   open-autopm epic list                 # List all available epics
   open-autopm epic status <name>        # Show epic progress and metrics
   open-autopm epic breakdown <name>     # Show detailed task breakdown

   💡 Note: To CREATE or MODIFY epics, use OpenCode Code /pm:* commands

💡 OpenCode Code PM Commands (AI-Powered):
   /pm:what-next                    # ⭐ Smart suggestions for what to do next
   /pm:status                       # Project overview and health
   /pm:prd-new <name>               # Create new PRD
   /pm:epic-decompose <name>        # Break PRD into tasks
   /pm:epic-sync <name>             # Sync to GitHub/Azure
   /pm:next                         # Get next priority task
   /pm:issue-start <id>             # Start working on task
   /pm:issue-close <id>             # Complete task
   /pm:standup                      # Generate daily summary

📋 Quick Workflow Examples:

   SIMPLE FEATURE (Use this for most tasks):
   1. /pm:prd-new user-login        # Create PRD
   2. /pm:epic-decompose user-login # Break into tasks
   3. /pm:epic-sync user-login      # Push to GitHub/Azure
   4. /pm:next                      # Start working

   COMPLEX PROJECT (Multiple epics):
   1. /pm:prd-new ecommerce         # Create PRD
   2. /pm:epic-split ecommerce      # Split into multiple epics
   3. /pm:epic-decompose ecommerce/01-backend  # Decompose each epic
   4. /pm:epic-sync ecommerce       # Sync all epics

🔍 Using STANDALONE Commands:

   # Parse PRD without AI (fast, deterministic)
   open-autopm prd parse my-feature

   # AI-powered parsing with streaming output
   open-autopm prd parse my-feature --ai --stream

   # Extract and validate
   open-autopm prd extract-epics my-feature
   open-autopm prd validate my-feature --fix

   # Task management
   open-autopm task list epic-001
   open-autopm task prioritize epic-001

   # Agent invocation
   open-autopm agent search kubernetes
   open-autopm agent invoke aws-architect "Design VPC" --stream

🛠️  Troubleshooting:
   open-autopm validate                  # Check installation & config
   open-autopm validate --fix            # Auto-fix common issues
   open-autopm mcp diagnose              # Check MCP server health
   open-autopm install --force           # Reinstall framework

📚 Resources & Help:
   📖 Documentation:  https://github.com/rafeekpro/OpenCodeAutoPM
   🐛 Report Issues:  https://github.com/rafeekpro/OpenCodeAutoPM/issues
   💬 Discussions:    https://github.com/rafeekpro/OpenCodeAutoPM/discussions
   📦 npm Package:    https://www.npmjs.com/package/open-autopm

💡 Pro Tips:
   • Use \`open-autopm --help\` to see this guide anytime
   • Run \`open-autopm validate\` after configuration changes
   • Use \`--stream\` flag for real-time AI responses
   • Check \`open-autopm mcp status\` to verify documentation access
   • Load appropriate team before starting work (frontend/backend/fullstack)

╔════════════════════════════════════════════════════════════════════════════╗
║  Need more help? Run: open-autopm <command> --help for detailed command docs   ║
╚════════════════════════════════════════════════════════════════════════════╝
`)
    .fail((msg, err, yargs) => {
      if (err) {
        console.error('Error:', err.message);
        if (process.env.DEBUG) {
          console.error(err.stack);
        }
      } else {
        console.error(msg);
      }
      console.error('\nRun "open-autopm --help" for usage information');
      process.exit(1);
    })
    .argv;
}

// Run the CLI
try {
  main();
} catch (error) {
  console.error('Fatal error:', error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
}