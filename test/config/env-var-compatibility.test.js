/**
 * TDD Tests for Environment Variable Backward Compatibility
 *
 * Tests migration from CLAUDE_* to OPENCODE_* environment variables
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const ConfigManager = require('../../lib/config/ConfigManager');

describe('Environment Variable Compatibility', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear all relevant env vars
    delete process.env.CLAUDE_PARALLEL_ENABLED;
    delete process.env.CLAUDE_MAX_AGENTS;
    delete process.env.CLAUDE_CONTEXT_ISOLATION;
    delete process.env.CLAUDE_TOKEN_LIMIT;
    delete process.env.OPENCODE_ENV;
    delete process.env.ANTHROPIC_WORKSPACE;
    delete process.env.OPENCODE_PARALLEL_ENABLED;
    delete process.env.OPENCODE_MAX_AGENTS;
    delete process.env.OPENCODE_CONTEXT_ISOLATION;
    delete process.env.OPENCODE_TOKEN_LIMIT;
    delete process.env.OPENCODE_ENV;
    delete process.env.OPENCODE_WORKSPACE;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Old CLAUDE_* variables', () => {
    test('should support old CLAUDE_PARALLEL_ENABLED variable', () => {
      process.env.CLAUDE_PARALLEL_ENABLED = 'true';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.parallelEnabled, true);
    });

    test('should support old CLAUDE_MAX_AGENTS variable', () => {
      process.env.CLAUDE_MAX_AGENTS = '7';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.maxAgents, 7);
    });

    test('should support old CLAUDE_CONTEXT_ISOLATION variable', () => {
      process.env.CLAUDE_CONTEXT_ISOLATION = 'false';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.contextIsolation, false);
    });

    test('should support old CLAUDE_TOKEN_LIMIT variable', () => {
      process.env.CLAUDE_TOKEN_LIMIT = '150000';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.tokenLimit, 150000);
    });

    test('should support old OPENCODE_ENV variable', () => {
      process.env.OPENCODE_ENV = 'true';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.env.isOpenCode, true);
    });

    test('should support old ANTHROPIC_WORKSPACE variable', () => {
      process.env.ANTHROPIC_WORKSPACE = '/test/workspace';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.env.workspace, '/test/workspace');
    });
  });

  describe('New OPENCODE_* variables', () => {
    test('should support new OPENCODE_PARALLEL_ENABLED variable', () => {
      process.env.OPENCODE_PARALLEL_ENABLED = 'true';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.parallelEnabled, true);
    });

    test('should support new OPENCODE_MAX_AGENTS variable', () => {
      process.env.OPENCODE_MAX_AGENTS = '8';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.maxAgents, 8);
    });

    test('should support new OPENCODE_CONTEXT_ISOLATION variable', () => {
      process.env.OPENCODE_CONTEXT_ISOLATION = 'true';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.contextIsolation, true);
    });

    test('should support new OPENCODE_TOKEN_LIMIT variable', () => {
      process.env.OPENCODE_TOKEN_LIMIT = '120000';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.tokenLimit, 120000);
    });

    test('should support new OPENCODE_ENV variable', () => {
      process.env.OPENCODE_ENV = 'true';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.env.isOpenCode, true);
    });

    test('should support new OPENCODE_WORKSPACE variable', () => {
      process.env.OPENCODE_WORKSPACE = '/new/workspace';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.env.workspace, '/new/workspace');
    });
  });

  describe('Priority: New over Old', () => {
    test('should prefer OPENCODE_PARALLEL_ENABLED over CLAUDE_PARALLEL_ENABLED', () => {
      process.env.CLAUDE_PARALLEL_ENABLED = 'false';
      process.env.OPENCODE_PARALLEL_ENABLED = 'true';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.parallelEnabled, true);
    });

    test('should prefer OPENCODE_MAX_AGENTS over CLAUDE_MAX_AGENTS', () => {
      process.env.CLAUDE_MAX_AGENTS = '3';
      process.env.OPENCODE_MAX_AGENTS = '9';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.maxAgents, 9);
    });

    test('should prefer OPENCODE_CONTEXT_ISOLATION over CLAUDE_CONTEXT_ISOLATION', () => {
      process.env.CLAUDE_CONTEXT_ISOLATION = 'false';
      process.env.OPENCODE_CONTEXT_ISOLATION = 'true';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.contextIsolation, true);
    });

    test('should prefer OPENCODE_TOKEN_LIMIT over CLAUDE_TOKEN_LIMIT', () => {
      process.env.CLAUDE_TOKEN_LIMIT = '50000';
      process.env.OPENCODE_TOKEN_LIMIT = '180000';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.tokenLimit, 180000);
    });
  });

  describe('Default Values', () => {
    test('should use default maxAgents when no env var set', () => {
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.maxAgents, 5);
    });

    test('should use default tokenLimit when no env var set', () => {
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.tokenLimit, 100000);
    });

    test('should use default parallelThreshold when no env var set', () => {
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.parallelThreshold, 'medium');
    });

    test('should use default configDir when no env var set', () => {
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.paths.configDir, '.opencode');
    });
  });

  describe('Configuration Validation', () => {
    test('should validate correct configuration', () => {
      process.env.OPENCODE_MAX_AGENTS = '5';
      process.env.OPENCODE_TOKEN_LIMIT = '100000';
      const validation = ConfigManager.validateConfig();
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.errors.length, 0);
    });

    test('should detect invalid maxAgents', () => {
      process.env.OPENCODE_MAX_AGENTS = '15'; // Too high
      const validation = ConfigManager.validateConfig();
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.includes('OPENCODE_MAX_AGENTS')));
    });

    test('should detect invalid tokenLimit', () => {
      process.env.OPENCODE_TOKEN_LIMIT = '5000'; // Too low
      const validation = ConfigManager.validateConfig();
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.includes('OPENCODE_TOKEN_LIMIT')));
    });

    test('should warn about deprecated variables', () => {
      process.env.CLAUDE_MAX_AGENTS = '5';
      const validation = ConfigManager.validateConfig();
      assert.ok(validation.warnings.length > 0);
      assert.ok(validation.warnings.some(w => w.includes('CLAUDE_MAX_AGENTS')));
    });
  });

  describe('Helper Methods', () => {
    test('should return execution strategy config', () => {
      process.env.OPENCODE_MAX_AGENTS = '7';
      process.env.AUTOPM_EXECUTION_MODE = 'adaptive';
      const strategy = ConfigManager.getExecutionStrategy();
      assert.strictEqual(strategy.mode, 'adaptive');
      assert.strictEqual(strategy.maxAgents, 7);
    });

    test('should detect OpenCode environment', () => {
      process.env.OPENCODE_ENV = 'true';
      assert.strictEqual(ConfigManager.isOpenCodeEnv(), true);
    });

    test('should return config directory', () => {
      process.env.OPENCODE_CONFIG_DIR = '.custom-opencode';
      assert.strictEqual(ConfigManager.getConfigDir(), '.custom-opencode');
    });
  });

  describe('Backward Compatibility Edge Cases', () => {
    test('should handle string "true" correctly', () => {
      process.env.OPENCODE_PARALLEL_ENABLED = 'true';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.parallelEnabled, true);
    });

    test('should handle string "false" correctly', () => {
      process.env.OPENCODE_PARALLEL_ENABLED = 'false';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.parallelEnabled, false);
    });

    test('should handle missing values gracefully', () => {
      process.env.OPENCODE_MAX_AGENTS = '';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.maxAgents, 5); // Falls back to default
    });

    test('should handle NaN values gracefully', () => {
      process.env.OPENCODE_MAX_AGENTS = 'invalid';
      const config = ConfigManager.getConfig();
      assert.strictEqual(Number.isNaN(config.execution.maxAgents), true);
    });
  });
});
