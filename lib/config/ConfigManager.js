/**
 * OpenCodeAutoPM Configuration Manager
 *
 * Manages environment variable migration from Claude Code to OpenCode
 * with backward compatibility support during transition period (v3.7.0 - v4.0.0)
 *
 * Migration Map:
 *   CLAUDE_PARALLEL_ENABLED → OPENCODE_PARALLEL_ENABLED
 *   CLAUDE_MAX_AGENTS → OPENCODE_MAX_AGENTS
 *   CLAUDE_CONTEXT_ISOLATION → OPENCODE_CONTEXT_ISOLATION
 *   CLAUDE_TOKEN_LIMIT → OPENCODE_TOKEN_LIMIT
 *   CLAUDE_CODE → OPENCODE_ENV
 *   ANTHROPIC_WORKSPACE → OPENCODE_WORKSPACE
 */

class ConfigManager {
  /**
   * Get environment variable with backward compatibility
   * Prefers new OPENCODE_* variables, falls back to CLAUDE_* variables
   *
   * @param {string} oldName - Old environment variable name
   * @param {string} newName - New environment variable name
   * @returns {string|undefined} Environment variable value
   */
  static getEnvVar(oldName, newName) {
    const newValue = process.env[newName];
    const oldValue = process.env[oldName];

    // Warn if using old variable
    if (oldValue && !newValue) {
      console.warn(`⚠️  ${oldName} is deprecated. Use ${newName} instead.`);
      console.warn(`   Support for ${oldName} will be removed in v4.0.0`);
      return oldValue;
    }

    // Warn if both are set
    if (oldValue && newValue) {
      console.warn(`⚠️  Both ${oldName} and ${newName} are set.`);
      console.warn(`   Using ${newName} (ignoring ${oldName})`);
      console.warn(`   Please remove ${oldName} from your environment`);
      return newValue;
    }

    return newValue;
  }

  /**
   * Get complete configuration object
   * Merges all environment variables with backward compatibility
   *
   * @returns {Object} Configuration object
   */
  static getConfig() {
    return {
      // Execution Strategy
      execution: {
        parallelEnabled: this.getEnvVar(
          'CLAUDE_PARALLEL_ENABLED',
          'OPENCODE_PARALLEL_ENABLED'
        ) === 'true',
        maxAgents: parseInt(this.getEnvVar(
          'CLAUDE_MAX_AGENTS',
          'OPENCODE_MAX_AGENTS'
        ) || '5', 10),
        contextIsolation: this.getEnvVar(
          'CLAUDE_CONTEXT_ISOLATION',
          'OPENCODE_CONTEXT_ISOLATION'
        ) === 'true',
        tokenLimit: parseInt(this.getEnvVar(
          'CLAUDE_TOKEN_LIMIT',
          'OPENCODE_TOKEN_LIMIT'
        ) || '100000', 10),
        parallelThreshold: this.getEnvVar(
          'CLAUDE_PARALLEL_THRESHOLD',
          'OPENCODE_PARALLEL_THRESHOLD'
        ) || 'medium'
      },

      // Environment Detection
      env: {
        isOpenCode: this.getEnvVar(
          'CLAUDE_CODE',
          'OPENCODE_ENV'
        ) === 'true' || this.getEnvVar(
          'ANTHROPIC_WORKSPACE',
          'OPENCODE_WORKSPACE'
        ),
        workspace: this.getEnvVar(
          'ANTHROPIC_WORKSPACE',
          'OPENCODE_WORKSPACE'
        )
      },

      // Feature Flags
      features: {
        dockerFirst: process.env.AUTOPM_DOCKER_FIRST === 'true',
        enforceDockerTests: process.env.AUTOPM_ENFORCE_DOCKER_TESTS === 'true',
        kubernetesDevOps: process.env.AUTOPM_KUBERNETES_DEVOPS === 'true',
        githubActionsK8s: process.env.AUTOPM_GITHUB_ACTIONS_K8S === 'true'
      },

      // Paths
      paths: {
        configDir: this.getEnvVar(
          'CLAUDE_CONFIG_DIR',
          'OPENCODE_CONFIG_DIR'
        ) || '.opencode',
        templatesDir: '.opencode/templates',
        agentsDir: '.opencode/agents',
        commandsDir: '.opencode/commands'
      }
    };
  }

  /**
   * Get execution strategy configuration
   *
   * @returns {Object} Execution strategy config
   */
  static getExecutionStrategy() {
    const config = this.getConfig();
    return {
      mode: process.env.AUTOPM_EXECUTION_MODE || 'hybrid-parallel',
      maxAgents: config.execution.maxAgents,
      contextIsolation: config.execution.contextIsolation,
      tokenLimit: config.execution.tokenLimit,
      parallelThreshold: config.execution.parallelThreshold
    };
  }

  /**
   * Check if running in OpenCode environment
   *
   * @returns {boolean} True if in OpenCode environment
   */
  static isOpenCodeEnv() {
    const config = this.getConfig();
    return config.env.isOpenCode;
  }

  /**
   * Get configuration directory path
   *
   * @returns {string} Path to configuration directory
   */
  static getConfigDir() {
    const config = this.getConfig();
    return config.paths.configDir;
  }

  /**
   * Validate configuration
   * Checks for conflicting or invalid settings
   *
   * @returns {Object} Validation result with errors and warnings
   */
  static validateConfig() {
    const config = this.getConfig();
    const errors = [];
    const warnings = [];

    // Check for deprecated variables
    const deprecatedVars = [
      'CLAUDE_PARALLEL_ENABLED',
      'CLAUDE_MAX_AGENTS',
      'CLAUDE_CONTEXT_ISOLATION',
      'CLAUDE_TOKEN_LIMIT',
      'CLAUDE_CODE',
      'ANTHROPIC_WORKSPACE'
    ];

    deprecatedVars.forEach(varName => {
      if (process.env[varName] && !warnings.includes(varName)) {
        warnings.push(`Deprecated environment variable: ${varName}`);
      }
    });

    // Validate execution strategy
    if (config.execution.maxAgents < 1 || config.execution.maxAgents > 10) {
      errors.push('OPENCODE_MAX_AGENTS must be between 1 and 10');
    }

    if (config.execution.tokenLimit < 10000 || config.execution.tokenLimit > 200000) {
      errors.push('OPENCODE_TOKEN_LIMIT must be between 10000 and 200000');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Display configuration summary
   * Useful for debugging and verification
   */
  static displayConfig() {
    const config = this.getConfig();
    const validation = this.validateConfig();

    console.log('\n📋 OpenCodeAutoPM Configuration:');
    console.log('================================');

    console.log('\n🚀 Execution Strategy:');
    console.log(`   Mode: ${process.env.AUTOPM_EXECUTION_MODE || 'hybrid-parallel'}`);
    console.log(`   Parallel: ${config.execution.parallelEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   Max Agents: ${config.execution.maxAgents}`);
    console.log(`   Context Isolation: ${config.execution.contextIsolation ? 'Enabled' : 'Disabled'}`);
    console.log(`   Token Limit: ${config.execution.tokenLimit}`);

    console.log('\n🌍 Environment:');
    console.log(`   OpenCode: ${config.env.isOpenCode ? 'Yes' : 'No'}`);
    console.log(`   Workspace: ${config.env.workspace || 'Not set'}`);

    console.log('\n🔧 Features:');
    console.log(`   Docker-First: ${config.features.dockerFirst ? 'Enabled' : 'Disabled'}`);
    console.log(`   K8s DevOps: ${config.features.kubernetesDevOps ? 'Enabled' : 'Disabled'}`);

    console.log('\n📁 Paths:');
    console.log(`   Config: ${config.paths.configDir}`);
    console.log(`   Templates: ${config.paths.templatesDir}`);
    console.log(`   Agents: ${config.paths.agentsDir}`);

    if (validation.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      validation.warnings.forEach(w => console.log(`   - ${w}`));
    }

    if (validation.errors.length > 0) {
      console.log('\n❌ Errors:');
      validation.errors.forEach(e => console.log(`   - ${e}`));
    }

    console.log('\n');
  }
}

module.exports = ConfigManager;
