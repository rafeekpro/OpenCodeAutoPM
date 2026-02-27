/**
 * OpenCode MCP Enhancements
 * 
 * This module extends the MCPHandler class with OpenCode-specific features:
 * - OpenCode server discovery
 * - Server compatibility validation
 * - Recommended servers for OpenCode
 * 
 * To integrate these methods, add them to the MCPHandler class in mcp-handler.js
 */

/**
 * Discover OpenCode-specific MCP servers
 * Returns servers that are optimized or designed for OpenCode
 * 
 * @returns {Array<Object>} List of OpenCode-compatible servers
 */
async discoverOpenCodeServers() {
  const openCodeServers = [
    {
      name: '@opencodemodelcontextprotocol/server-filesystem',
      version: await this.getLatestVersion('@opencodemodelcontextprotocol/server-filesystem'),
      openCodeCompatible: true,
      recommended: true,
      metadata: {
        category: 'core',
        description: 'Filesystem access for OpenCode with enhanced security',
        command: 'npx',
        args: ['-y', '@opencodemodelcontextprotocol/server-filesystem'],
        env: {
          OPENCODE_FS_ROOT: process.cwd(),
          OPENCODE_FS_ALLOW: '.'
        }
      }
    },
    {
      name: '@opencodemodelcontextprotocol/server-github',
      version: await this.getLatestVersion('@opencodemodelcontextprotocol/server-github'),
      openCodeCompatible: true,
      recommended: true,
      metadata: {
        category: 'development',
        description: 'GitHub integration for OpenCode with PR/issue management',
        command: 'npx',
        args: ['-y', '@opencodemodelcontextprotocol/server-github'],
        env: {
          GITHUB_TOKEN: 'YOUR_GITHUB_TOKEN_HERE'
        }
      }
    },
    {
      name: '@opencodemodelcontextprotocol/server-memory',
      version: await this.getLatestVersion('@opencodemodelcontextprotocol/server-memory'),
      openCodeCompatible: true,
      recommended: false,
      metadata: {
        category: 'utility',
        description: 'Persistent memory for OpenCode sessions',
        command: 'npx',
        args: ['-y', '@opencodemodelcontextprotocol/server-memory']
      }
    },
    {
      name: '@opencodemodelcontextprotocol/server-sequential-thinking',
      version: await this.getLatestVersion('@opencodemodelcontextprotocol/server-sequential-thinking'),
      openCodeCompatible: true,
      recommended: true,
      metadata: {
        category: 'ai',
        description: 'Sequential thinking protocols for OpenCode agents',
        command: 'npx',
        args: ['-y', '@opencodemodelcontextprotocol/server-sequential-thinking']
      }
    },
    {
      name: '@opencodemodelcontextprotocol/server-postgres',
      version: await this.getLatestVersion('@opencodemodelcontextprotocol/server-postgres'),
      openCodeCompatible: true,
      recommended: false,
      metadata: {
        category: 'database',
        description: 'PostgreSQL database integration for OpenCode',
        command: 'npx',
        args: ['-y', '@opencodemodelcontextprotocol/server-postgres'],
        env: {
          POSTGRES_CONNECTION_STRING: 'postgresql://user:password@localhost:5432/dbname'
        }
      }
    }
  ];

  return openCodeServers;
}

/**
 * Validate if an MCP server is OpenCode-compatible
 * Checks for OpenCode-specific features and requirements
 * 
 * @param {string} serverName - Name of the MCP server
 * @returns {Object} Compatibility validation result
 */
async validateServerCompatibility(serverName) {
  const server = this.getServer(serverName);
  
  if (!server) {
    return {
      compatible: false,
      server: serverName,
      error: 'Server not found in registry',
      recommendations: []
    };
  }

  const validation = {
    compatible: true,
    server: serverName,
    version: server.metadata?.version || 'unknown',
    checks: [],
    recommendations: [],
    warnings: []
  };

  // Check 1: OpenCode package naming
  if (serverName.includes('opencodemodelcontextprotocol')) {
    validation.checks.push({
      check: 'Package naming',
      status: 'pass',
      message: 'Uses official OpenCode MCP package naming'
    });
  } else if (serverName.includes('@modelcontextprotocol')) {
    validation.checks.push({
      check: 'Package naming',
      status: 'warn',
      message: 'Generic MCP package, may not be OpenCode-optimized'
    });
    validation.recommendations.push('Consider using OpenCode-specific alternatives if available');
  }

  // Check 2: Environment variable naming
  const hasOpenCodeEnvVars = Object.keys(server.metadata?.env || {}).some(key => 
    key.startsWith('OPENCODE_')
  );

  if (hasOpenCodeEnvVars) {
    validation.checks.push({
      check: 'Environment variables',
      status: 'pass',
      message: 'Uses OpenCode-specific environment variables'
    });
  }

  // Check 3: Command compatibility
  const command = server.metadata?.command || '';
  if (command.includes('npx') || command.includes('node')) {
    validation.checks.push({
      check: 'Command type',
      status: 'pass',
      message: 'Uses Node.js runtime (compatible with OpenCode)'
    });
  } else {
    validation.checks.push({
      check: 'Command type',
      status: 'warn',
      message: `Uses custom command: ${command}`,
      recommendation: 'Verify Node.js compatibility'
    });
  }

  // Check 4: Resource limits
  const args = server.metadata?.args || [];
  if (args.some(arg => arg.includes('--max-tokens') || arg.includes('--context-limit'))) {
    validation.checks.push({
      check: 'Resource management',
      status: 'pass',
      message: 'Implements resource limits (good for OpenCode context isolation)'
    });
  } else {
    validation.recommendations.push('Consider adding --max-tokens argument for better resource management');
  }

  // Check 5: Security features
  if (server.metadata?.env?.ALLOW_WRITE === 'false' || 
      server.metadata?.env?.READONLY === 'true') {
    validation.checks.push({
      check: 'Security',
      status: 'pass',
      message: 'Implements read-only mode (secure)'
    });
  }

  // Overall compatibility assessment
  const failedChecks = validation.checks.filter(c => c.status === 'fail');
  const warningChecks = validation.checks.filter(c => c.status === 'warn');

  if (failedChecks.length > 0) {
    validation.compatible = false;
  } else if (warningChecks.length > 0) {
    validation.compatible = true;
    validation.warnings.push('Server compatible with some warnings');
  } else {
    validation.compatible = true;
  }

  return validation;
}

/**
 * Get recommended MCP servers for OpenCode
 * Returns servers optimized for OpenCode workflows
 * 
 * @param {Object} options - Options for filtering recommendations
 * @returns {Array<Object>} Recommended servers
 */
async getOpenCodeRecommendedServers(options = {}) {
  const {
    category = null,
    includeExperimental = false,
    maxResults = 10
  } = options;

  // Core recommended servers for OpenCode
  const coreRecommendations = [
    {
      name: 'filesystem',
      package: '@opencodemodelcontextprotocol/server-filesystem',
      priority: 'essential',
      category: 'core',
      reason: 'Essential for file operations in OpenCode',
      setup: 'opencode-autopm mcp enable filesystem'
    },
    {
      name: 'memory',
      package: '@opencodemodelcontextprotocol/server-memory',
      priority: 'high',
      category: 'utility',
      reason: 'Enables persistent context across OpenCode sessions',
      setup: 'opencode-autopm mcp enable memory'
    },
    {
      name: 'github',
      package: '@opencodemodelcontextprotocol/server-github',
      priority: 'high',
      category: 'development',
      reason: 'GitHub integration for PR/issue management in OpenCode',
      setup: 'opencode-autopm mcp enable github'
    },
    {
      name: 'sequential-thinking',
      package: '@opencodemodelcontextprotocol/server-sequential-thinking',
      priority: 'medium',
      category: 'ai',
      reason: 'Enhances reasoning for OpenCode agents',
      setup: 'opencode-autopm mcp enable sequential-thinking'
    }
  ];

  // Optional/enhanced servers
  const optionalRecommendations = [
    {
      name: 'postgres',
      package: '@opencodemodelcontextprotocol/server-postgres',
      priority: 'low',
      category: 'database',
      reason: 'Database integration for data-intensive projects',
      setup: 'opencode-autopm mcp enable postgres'
    },
    {
      name: 'brave-search',
      package: '@opencodemodelcontextprotocol/server-brave-search',
      priority: 'low',
      category: 'web',
      reason: 'Web search capabilities for OpenCode agents',
      experimental: true,
      setup: 'opencode-autopm mcp enable brave-search'
    },
    {
      name: 'puppeteer',
      package: '@opencodemodelcontextprotocol/server-puppeteer',
      priority: 'low',
      category: 'testing',
      reason: 'Browser automation for testing in OpenCode',
      experimental: true,
      setup: 'opencode-autopm mcp enable puppeteer'
    }
  ];

  let recommendations = [...coreRecommendations];

  if (includeExperimental) {
    recommendations = recommendations.concat(optionalRecommendations);
  }

  // Filter by category if specified
  if (category) {
    recommendations = recommendations.filter(r => r.category === category);
  }

  // Sort by priority and limit results
  const priorityOrder = { essential: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations.slice(0, maxResults);
}

/**
 * Get the latest version of an npm package
 * 
 * @param {string} packageName - Name of the npm package
 * @returns {Promise<string>} Latest version
 */
async getLatestVersion(packageName) {
  try {
    const { execSync } = require('child_process');
    const version = execSync(
      `npm view ${packageName} version`,
      { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    return version;
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Show OpenCode-specific MCP recommendations
 * Displays recommended servers for OpenCode workflows
 */
async showOpenCodeRecommendations() {
  console.log('🚀 Recommended MCP Servers for OpenCode\n');
  console.log('═══════════════════════════════════════════\n');

  const recommended = await this.getOpenCodeRecommendedServers({
    includeExperimental: false
  });

  recommended.forEach((server, index) => {
    const priorityIcon = {
      essential: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '⚪'
    }[server.priority];

    console.log(`${priorityIcon} ${index + 1}. ${server.name}`);
    console.log(`   Package: ${server.package}`);
    console.log(`   Category: ${server.category}`);
    console.log(`   Priority: ${server.priority}`);
    console.log(`   Reason: ${server.reason}`);
    console.log(`   Setup: ${server.setup}`);
    console.log();
  });

  console.log('💡 Tip: Essential and High priority servers are recommended for most OpenCode projects');
  console.log('📖 Full server list: opencode-autopm mcp list');
}

/**
 * Validate all active servers for OpenCode compatibility
 * Checks all currently enabled MCP servers
 */
async validateActiveServersCompatibility() {
  const config = this.loadConfig();
  const activeServers = config.mcp?.activeServers || [];

  if (activeServers.length === 0) {
    console.log('ℹ️  No active MCP servers to validate');
    return;
  }

  console.log('🔍 Validating OpenCode Compatibility\n');
  console.log('═════════════════════════════════════\n');

  const results = [];

  for (const serverName of activeServers) {
    const validation = await this.validateServerCompatibility(serverName);
    results.push(validation);

    const statusIcon = validation.compatible ? '✅' : '❌';
    console.log(`${statusIcon} ${serverName}`);

    if (!validation.compatible) {
      console.log(`   Error: ${validation.error}`);
      continue;
    }

    validation.checks.forEach(check => {
      const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
      console.log(`   ${icon} ${check.check}: ${check.message}`);
    });

    if (validation.recommendations.length > 0) {
      console.log('   💡 Recommendations:');
      validation.recommendations.forEach(rec => {
        console.log(`      • ${rec}`);
      });
    }

    if (validation.warnings.length > 0) {
      console.log('   ⚠️  Warnings:');
      validation.warnings.forEach(warn => {
        console.log(`      • ${warn}`);
      });
    }

    console.log();
  }

  const compatible = results.filter(r => r.compatible).length;
  const total = results.length;

  console.log(`\n📊 Results: ${compatible}/${total} servers compatible with OpenCode`);

  if (compatible < total) {
    console.log('\n💡 Consider replacing incompatible servers with OpenCode-optimized alternatives');
  }
}

// Export methods for integration
module.exports = {
  discoverOpenCodeServers,
  validateServerCompatibility,
  getOpenCodeRecommendedServers,
  showOpenCodeRecommendations,
  validateActiveServersCompatibility,
  getLatestVersion
};
