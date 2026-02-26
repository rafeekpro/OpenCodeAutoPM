/**
 * MCP Command for open-autopm CLI
 * Manages Model Context Protocol servers, agents, and configuration
 */

const path = require('path');
const MCPHandler = require('../../scripts/mcp-handler.js');

module.exports = {
  command: 'mcp <action> [name]',
  describe: 'Manage MCP (Model Context Protocol) servers and configuration',

  builder: (yargs) => {
    return yargs
      .positional('action', {
        describe: 'MCP action to perform',
        type: 'string',
        choices: [
          'list', 'add', 'remove', 'enable', 'disable', 'sync', 'validate', 'info',
          'search', 'browse', 'install', 'uninstall',
          'agents', 'agent', 'usage', 'setup', 'check', 'diagnose', 'test', 'tree', 'status'
        ]
      })
      .positional('name', {
        describe: 'Server or agent name (for actions that require it)',
        type: 'string'
      })
      .option('server', {
        alias: 's',
        describe: 'Server name',
        type: 'string'
      })
      .option('agent', {
        alias: 'a',
        describe: 'Agent name',
        type: 'string'
      })
      .option('by-server', {
        describe: 'Group agents by MCP server',
        type: 'boolean',
        default: false
      })
      .option('enable', {
        describe: 'Enable server after installation',
        type: 'boolean',
        default: false
      })
      .option('force', {
        describe: 'Force operation (skip confirmations)',
        type: 'boolean',
        default: false
      })
      .option('keep-package', {
        describe: 'Keep npm package when uninstalling',
        type: 'boolean',
        default: false
      })
      .option('official', {
        describe: 'Show only official @modelcontextprotocol servers',
        type: 'boolean',
        default: false
      })
      .option('category', {
        describe: 'Filter by category',
        type: 'string'
      })
      .example('open-autopm mcp list', 'List all available MCP servers')
      .example('open-autopm mcp search filesystem', 'Search npm for MCP servers')
      .example('open-autopm mcp browse --official', 'Browse official MCP servers')
      .example('open-autopm mcp install @modelcontextprotocol/server-filesystem', 'Install MCP server from npm')
      .example('open-autopm mcp install @upstash/context7-mcp --enable', 'Install and enable immediately')
      .example('open-autopm mcp uninstall filesystem', 'Uninstall MCP server')
      .example('open-autopm mcp enable context7', 'Enable context7 documentation server')
      .example('open-autopm mcp agents', 'List all agents using MCP')
      .example('open-autopm mcp agent react-frontend-engineer', 'Show MCP config for specific agent')
      .example('open-autopm mcp usage', 'Show MCP usage statistics')
      .example('open-autopm mcp setup', 'Interactive API key setup')
      .example('open-autopm mcp check', 'Quick MCP configuration check')
      .example('open-autopm mcp diagnose', 'Run MCP diagnostics')
      .example('open-autopm mcp test context7', 'Test MCP server connection')
      .example('open-autopm mcp tree', 'Show agent-MCP dependency tree')
      .example('open-autopm mcp status', 'Show MCP servers status');
  },

  handler: async (argv) => {
    const handler = new MCPHandler();
    const action = argv.action;

    try {
      switch (action) {
        // Basic commands
        case 'list':
          handler.list();
          break;

        case 'add':
          await handler.add();
          break;

        case 'remove':
          if (!argv.name && !argv.server) {
            console.error('❌ Please specify a server name: open-autopm mcp remove <server-name>');
            process.exit(1);
          }
          handler.remove(argv.name || argv.server);
          break;

        case 'enable':
          if (!argv.name && !argv.server) {
            console.error('❌ Please specify a server name: open-autopm mcp enable <server-name>');
            process.exit(1);
          }
          handler.enable(argv.name || argv.server);
          break;

        case 'disable':
          if (!argv.name && !argv.server) {
            console.error('❌ Please specify a server name: open-autopm mcp disable <server-name>');
            process.exit(1);
          }
          handler.disable(argv.name || argv.server);
          break;

        case 'sync':
          handler.sync();
          break;

        case 'validate':
          handler.validate();
          break;

        case 'info':
          if (!argv.name && !argv.server) {
            console.error('❌ Please specify a server name: open-autopm mcp info <server-name>');
            process.exit(1);
          }
          handler.info(argv.name || argv.server);
          break;

        // Discovery and installation commands
        case 'search':
          if (!argv.name) {
            console.error('❌ Please specify a search query: open-autopm mcp search <query>');
            process.exit(1);
          }
          await handler.search(argv.name, argv);
          break;

        case 'browse':
          await handler.browse(argv);
          break;

        case 'install':
          if (!argv.name) {
            console.error('❌ Please specify a package name: open-autopm mcp install <package>');
            process.exit(1);
          }
          await handler.installFromNpm(argv.name, argv);
          break;

        case 'uninstall':
          if (!argv.name && !argv.server) {
            console.error('❌ Please specify a server name: open-autopm mcp uninstall <server-name>');
            process.exit(1);
          }
          await handler.uninstallServer(argv.name || argv.server, argv);
          break;

        // Agent analysis commands
        case 'agents':
          handler.mcpAgents(argv.byServer ? { groupBy: 'server' } : {});
          break;

        case 'agent':
          if (!argv.name && !argv.agent) {
            console.error('❌ Please specify an agent name: open-autopm mcp agent <agent-name>');
            process.exit(1);
          }
          handler.mcpAgent(argv.name || argv.agent);
          break;

        case 'usage':
          handler.mcpUsage();
          break;

        // Configuration commands
        case 'setup':
          await handler.setupWizard();
          break;

        case 'check':
          handler.check();
          break;

        case 'diagnose':
          handler.diagnose();
          break;

        case 'test':
          if (!argv.name && !argv.server) {
            console.error('❌ Please specify a server name: open-autopm mcp test <server-name>');
            process.exit(1);
          }
          const result = await handler.testServer(argv.name || argv.server);
          if (result.success) {
            console.log(`✅ ${result.message}`);
          } else {
            console.error(`❌ ${result.message}`);
            process.exit(1);
          }
          break;

        // Visualization commands
        case 'tree':
          handler.showTree();
          break;

        case 'status':
          handler.showStatus();
          break;

        default:
          console.error(`❌ Unknown action: ${action}`);
          console.log('\nAvailable actions:');
          console.log('  list, add, remove, enable, disable, sync, validate, info');
          console.log('  agents, agent, usage, setup, check, diagnose, test, tree, status');
          console.log('\nUse "open-autopm mcp --help" for more information');
          process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      if (argv.debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
};
