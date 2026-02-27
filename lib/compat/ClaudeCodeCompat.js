/**
 * Backward Compatibility Layer for Claude Code
 *
 * Maintains compatibility with Claude Code workflows and configurations
 * during the transition period (3-6 months, versions 3.7.0 - 4.0.0)
 *
 * This layer provides:
 * - Automatic detection of Claude Code environments
 * - Configuration migration from Claude Code to OpenCode
 * - Command compatibility mapping
 * - Graceful deprecation warnings
 */

const fs = require('fs');
const path = require('path');
const ConfigManager = require('../config/ConfigManager');

class ClaudeCodeCompat {
  /**
   * Detect if running in Claude Code environment
   * 
   * @returns {boolean} True if in Claude Code environment
   */
  static isClaudeCode() {
    // Check for Claude Code environment variables
    const hasClaudeCodeEnv = process.env.CLAUDE_CODE === 'true';
    const hasAnthropicWorkspace = process.env.ANTHROPIC_WORKSPACE;
    
    // Check for Claude Code directory structure
    const hasClaudeCodeDir = fs.existsSync('.claude-code/');
    const hasClaudeDir = fs.existsSync('.claude/');
    
    return hasClaudeCodeEnv || hasAnthropicWorkspace || hasClaudeCodeDir || hasClaudeDir;
  }

  /**
   * Detect if running in OpenCode environment
   * 
   * @returns {boolean} True if in OpenCode environment
   */
  static isOpenCode() {
    // Check for OpenCode environment variables (prefer new ones)
    const isOpenCodeEnv = process.env.OPENCODE_ENV === 'true';
    const hasOpenCodeWorkspace = process.env.OPENCODE_WORKSPACE;
    
    // Check for OpenCode directory structure
    const hasOpenCodeDir = fs.existsSync('.opencode/');
    
    return isOpenCodeEnv || hasOpenCodeWorkspace || hasOpenCodeDir;
  }

  /**
   * Get detected environment
   * 
   * @returns {string} Environment name ('claude-code', 'opencode', or 'unknown')
   */
  static getEnvironment() {
    if (this.isOpenCode()) return 'opencode';
    if (this.isClaudeCode()) return 'claude-code';
    return 'unknown';
  }

  /**
   * Migrate Claude Code configuration to OpenCode
   * 
   * @param {Object} options - Migration options
   * @param {boolean} options.dryRun - Don't make changes, just report
   * @param {boolean} options.backup - Create backup before migrating
   * @returns {Object} Migration result
   */
  static migrateConfig(options = {}) {
    const { dryRun = false, backup = true } = options;
    const result = {
      success: false,
      migrated: [],
      errors: [],
      warnings: []
    };

    // Only migrate if in Claude Code environment
    if (!this.isClaudeCode()) {
      result.warnings.push('Not in Claude Code environment, no migration needed');
      return result;
    }

    try {
      // Check for .claude-code/ config
      const claudeCodeConfigPath = '.claude-code/config.json';
      const openCodeConfigPath = '.opencode/config.json';

      if (fs.existsSync(claudeCodeConfigPath)) {
        console.log('📋 Found Claude Code configuration');
        
        // Read old config
        const oldConfig = JSON.parse(fs.readFileSync(claudeCodeConfigPath, 'utf-8'));
        
        // Convert to OpenCode format
        const newConfig = this.convertConfig(oldConfig);
        
        if (dryRun) {
          result.warnings.push('Dry run: Would migrate configuration');
          result.migrated.push(claudeCodeConfigPath);
          return result;
        }

        // Create backup
        if (backup && fs.existsSync(openCodeConfigPath)) {
          const backupPath = `${openCodeConfigPath}.backup.${Date.now()}`;
          fs.copyFileSync(openCodeConfigPath, backupPath);
          result.warnings.push(`Created backup: ${backupPath}`);
        }

        // Ensure .opencode/ directory exists
        fs.mkdirSync('.opencode/', { recursive: true });

        // Write new config
        fs.writeFileSync(
          openCodeConfigPath,
          JSON.stringify(newConfig, null, 2)
        );

        result.migrated.push(claudeCodeConfigPath);
        result.success = true;

        console.log('✅ Migrated configuration from Claude Code to OpenCode');
      }

      // Check for environment variables in .env file
      const envPath = '.env';
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const envVars = this.migrateEnvVars(envContent);
        
        if (envVars.changed) {
          if (dryRun) {
            result.warnings.push('Dry run: Would migrate environment variables');
            return result;
          }

          if (backup) {
            fs.writeFileSync(`${envPath}.backup`, envContent);
          }

          fs.writeFileSync(envPath, envVars.content);
          result.migrated.push(envPath);
          result.success = true;

          console.log('✅ Migrated environment variables');
        }
      }

    } catch (error) {
      result.errors.push(error.message);
      console.error('❌ Migration failed:', error.message);
    }

    return result;
  }

  /**
   * Convert Claude Code config to OpenCode format
   * 
   * @param {Object} oldConfig - Claude Code configuration
   * @returns {Object} OpenCode configuration
   */
  static convertConfig(oldConfig) {
    const newConfig = {
      version: '1.12.2',
      execution_strategy: {
        mode: oldConfig.execution_strategy?.mode || 'hybrid-parallel',
        max_agents: oldConfig.execution_strategy?.max_agents || 5,
        context_isolation: oldConfig.execution_strategy?.context_isolation ?? true,
        token_limit: oldConfig.execution_strategy?.token_limit || 100000,
        parallel_threshold: oldConfig.execution_strategy?.parallel_threshold || 'medium',
        resource_monitoring: true
      },
      features: oldConfig.features || {},
      docker: oldConfig.docker || {},
      kubernetes: oldConfig.kubernetes || {},
      github_actions: oldConfig.github_actions || {},
      exceptions: oldConfig.exceptions || {}
    };

    return newConfig;
  }

  /**
   * Migrate environment variables from Claude Code to OpenCode
   * 
   * @param {string} envContent - Environment file content
   * @returns {Object} Migration result with content and changed flag
   */
  static migrateEnvVars(envContent) {
    const migrations = [
      [/CLAUDE_PARALLEL_ENABLED/g, 'OPENCODE_PARALLEL_ENABLED'],
      [/CLAUDE_MAX_AGENTS/g, 'OPENCODE_MAX_AGENTS'],
      [/CLAUDE_CONTEXT_ISOLATION/g, 'OPENCODE_CONTEXT_ISOLATION'],
      [/CLAUDE_TOKEN_LIMIT/g, 'OPENCODE_TOKEN_LIMIT'],
      [/CLAUDE_CODE/g, 'OPENCODE_ENV'],
      [/ANTHROPIC_WORKSPACE/g, 'OPENCODE_WORKSPACE']
    ];

    let newContent = envContent;
    let changed = false;

    for (const [pattern, replacement] of migrations) {
      if (pattern.test(newContent)) {
        newContent = newContent.replace(pattern, replacement);
        changed = true;
      }
    }

    // Add deprecation notice comment
    if (changed) {
      const notice = '# Migrated from Claude Code environment variables\n';
      newContent = notice + newContent;
    }

    return { content: newContent, changed };
  }

  /**
   * Maintain command compatibility
   * Maps old Claude Code commands to new OpenCode commands
   * 
   * @param {string} oldCommand - Old command name
   * @returns {string} New command name
   */
  static getCompatibleCommand(oldCommand) {
    const commandMap = {
      'claude-code': 'opencode',
      'claude-autopm': 'opencode-autopm',
      'open-autopm': 'opencode-autopm',
      'autopm': 'opencode-autopm'
    };

    const newCommand = commandMap[oldCommand];
    if (newCommand && newCommand !== oldCommand) {
      console.warn(`⚠️  Command '${oldCommand}' is deprecated. Use '${newCommand}' instead.`);
      console.warn(`   Support for '${oldCommand}' will be removed in v4.0.0`);
    }

    return newCommand || oldCommand;
  }

  /**
   * Show deprecation notice for Claude Code features
   * 
   * @param {string} feature - Feature name
   */
  static showDeprecationNotice(feature) {
    console.warn('');
    console.warn('⚠️  DEPRECATION NOTICE');
    console.warn('════════════════════');
    console.warn(`The Claude Code version of '${feature}' is deprecated.`);
    console.warn('');
    console.warn('Please migrate to OpenCode:');
    console.warn('  1. Install opencode-autopm: npm install -g opencode-autopm');
    console.warn('  2. Update environment variables (CLAUDE_* → OPENCODE_*)');
    console.warn('  3. Update directory references (.claude/ → .opencode/)');
    console.warn('');
    console.warn('Support for Claude Code features will be removed in v4.0.0');
    console.warn('For migration guide, see: https://github.com/rafeekpro/OpenCodeAutoPM');
    console.warn('');
  }

  /**
   * Validate compatibility and show warnings
   * 
   * @returns {Object} Validation result
   */
  static validateCompatibility() {
    const result = {
      environment: this.getEnvironment(),
      deprecatedVars: [],
      deprecatedDirs: [],
      migrationNeeded: false
    };

    // Check for deprecated environment variables
    const deprecatedEnvVars = [
      'CLAUDE_PARALLEL_ENABLED',
      'CLAUDE_MAX_AGENTS',
      'CLAUDE_CONTEXT_ISOLATION',
      'CLAUDE_TOKEN_LIMIT',
      'CLAUDE_CODE',
      'ANTHROPIC_WORKSPACE'
    ];

    deprecatedEnvVars.forEach(varName => {
      if (process.env[varName]) {
        result.deprecatedVars.push(varName);
        result.migrationNeeded = true;
      }
    });

    // Check for deprecated directories
    if (fs.existsSync('.claude-code/')) {
      result.deprecatedDirs.push('.claude-code/');
      result.migrationNeeded = true;
    }

    if (fs.existsSync('.claude/')) {
      result.deprecatedDirs.push('.claude/');
      result.migrationNeeded = true;
    }

    return result;
  }

  /**
   * Display compatibility status
   */
  static displayCompatibilityStatus() {
    const validation = this.validateCompatibility();

    console.log('');
    console.log('🔍 OpenCode Compatibility Status');
    console.log('═════════════════════════════════');
    console.log(`Environment: ${validation.environment}`);
    console.log('');

    if (validation.migrationNeeded) {
      console.log('⚠️  Migration Recommended:');
      console.log('');

      if (validation.deprecatedVars.length > 0) {
        console.log('Deprecated Environment Variables:');
        validation.deprecatedVars.forEach(varName => {
          const newVal = varName.replace('CLAUDE', 'OPENCODE').replace('ANTHROPIC_WORKSPACE', 'OPENCODE_WORKSPACE');
          console.log(`  - ${varName} → ${newVal}`);
        });
        console.log('');
      }

      if (validation.deprecatedDirs.length > 0) {
        console.log('Deprecated Directories:');
        validation.deprecatedDirs.forEach(dir => {
          const newDir = dir.replace('.claude-code', '.opencode').replace('.claude', '.opencode');
          console.log(`  - ${dir} → ${newDir}`);
        });
        console.log('');
      }

      console.log('To migrate, run:');
      console.log('  node lib/compat/migrate-config.js');
    } else {
      console.log('✅ No migration needed - fully compatible with OpenCode!');
    }

    console.log('');
  }
}

module.exports = ClaudeCodeCompat;
