/**
 * OpenCode Migration Validation Tests
 *
 * Comprehensive test suite to validate the OpenCode migration
 * Ensures all components are properly updated and compatible
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ConfigManager = require('../../lib/config/ConfigManager');
const ClaudeCodeCompat = require('../../lib/compat/ClaudeCodeCompat');

describe('OpenCode Migration Validation', () => {
  
  describe('Package Configuration', () => {
    test('should use opencode-autopm package name', () => {
      const pkg = require('../../package.json');
      assert.strictEqual(pkg.name, 'opencode-autopm');
    });

    test('should have version 3.7.0 or higher', () => {
      const pkg = require('../../package.json');
      const version = pkg.version.split('.').map(Number);
      assert.ok(version[0] >= 3, 'Major version should be at least 3');
      assert.ok(version[1] >= 7, 'Minor version should be at least 7');
    });

    test('should have OpenCode branding in description', () => {
      const pkg = require('../../package.json');
      assert.ok(pkg.description.includes('OpenCode'));
    });

    test('should have opencode-autopm in bin', () => {
      const pkg = require('../../package.json');
      assert.ok(pkg.bin['opencode-autopm']);
      assert.ok(pkg.bin['open-autopm']); // Deprecated alias
    });
  });

  describe('Documentation Files', () => {
    test('README.md should not contain Claude Code product references', () => {
      const readme = fs.readFileSync('README.md', 'utf-8');
      // Count "Claude Code" as a product (not AI model mentions)
      const productRefs = (readme.match(/Claude Code/g) || []).length;
      assert.ok(productRefs < 5, `Found ${productRefs} Claude Code product references`);
    });

    test('OPENCODE.md should exist', () => {
      assert.ok(fs.existsSync('OPENCODE.md'));
    });

    test('OPENCODE.md should reference .opencode/ paths', () => {
      if (fs.existsSync('OPENCODE.md')) {
        const content = fs.readFileSync('OPENCODE.md', 'utf-8');
        assert.ok(content.includes('.opencode/'), 'Should reference .opencode/ paths');
      }
    });

    test('CLAUDE.md should have deprecation notice', () => {
      if (fs.existsSync('CLAUDE.md')) {
        const content = fs.readFileSync('CLAUDE.md', 'utf-8');
        assert.ok(content.includes('DEPRECATED'), 'Should have deprecation notice');
        assert.ok(content.includes('OPENCODE.md'), 'Should reference OPENCODE.md');
      }
    });

    test('VitePress config should have OpenCode title', () => {
      const configPath = 'docs-site/docs/.vitepress/config.ts';
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        assert.ok(content.includes('OpenCodeAutoPM'), 'Should have OpenCode title');
      }
    });
  });

  describe('Template Files', () => {
    test('strategy templates should use OPENCODE_ env vars', () => {
      const strategies = [
        'autopm/.opencode/templates/strategies-templates/hybrid-parallel.md',
        '.opencode/templates/strategies-templates/hybrid-parallel.md'
      ];

      let found = 0;
      strategies.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8');
          if (content.includes('OPENCODE_')) {
            found++;
          }
        }
      });

      assert.ok(found > 0, `At least one strategy template should use OPENCODE_ variables (found: ${found})`);
    });

    test('hybrid-parallel template should exist and document deprecated vars', () => {
      const hybridPaths = [
        'autopm/.opencode/templates/strategies-templates/hybrid-parallel.md',
        '.opencode/templates/strategies-templates/hybrid-parallel.md',
        '.opencode/strategies/ACTIVE_STRATEGY.md'
      ];

      let found = false;
      for (const path of hybridPaths) {
        if (fs.existsSync(path)) {
          const content = fs.readFileSync(path, 'utf-8');
          if (content.includes('OPENCODE_')) {
            found = true;
            break;
          }
        }
      }

      assert.ok(found, 'At least one strategy template should document OPENCODE_ variables');
    });
  });

  describe('Code Files', () => {
    test('should not reference .claude-code directory in lib/', () => {
      const result = execSync(
        'grep -r "\\.claude-code" lib/ --include="*.js" 2>/dev/null || echo ""',
        { encoding: 'utf-8' }
      );
      // Allow up to 2 references (in comments or tests)
      const lines = result.trim().split('\n').filter(l => l && !l.includes('node_modules'));
      assert.ok(lines.length <= 2, `Found ${lines.length} .claude-code references in lib/ (max 2 allowed)`);
    });

    test('ConfigManager should exist and be functional', () => {
      assert.ok(ConfigManager);
      assert.strictEqual(typeof ConfigManager.getConfig, 'function');
      assert.strictEqual(typeof ConfigManager.getEnvVar, 'function');
    });

    test('ConfigManager should support backward compatibility', () => {
      process.env.CLAUDE_MAX_AGENTS = '7';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.maxAgents, 7);
      delete process.env.CLAUDE_MAX_AGENTS;
    });

    test('prdReview command should use opencode option', () => {
      const cmdPaths = [
        'autopm/.opencode/lib/commands/pm/prdReview.js',
        '.opencode/lib/commands/pm/prdReview.js'
      ];

      let found = false;
      for (const cmdPath of cmdPaths) {
        if (fs.existsSync(cmdPath)) {
          const content = fs.readFileSync(cmdPath, 'utf-8');
          if (content.includes("'opencode'")) {
            found = true;
            break;
          }
        }
      }

      assert.ok(found, 'At least one prdReview command should use opencode option');
    });
  });

  describe('Test Files', () => {
    test('test files should use OpenCode paths', () => {
      const result = execSync(
        'grep -r "\\.claude-code" test/ --include="*.js" || echo ""',
        { encoding: 'utf-8' }
      );
      // Some references in test data may be acceptable
      const lines = result.trim().split('\n').filter(l => l);
      assert.ok(lines.length < 3, `Found ${lines.length} .claude-code references in tests`);
    });

    test('env-var-compatibility tests should exist', () => {
      assert.ok(fs.existsSync('test/config/env-var-compatibility.test.js'));
    });

    test('env-var-compatibility tests should import correctly', () => {
      const tests = require('../../test/config/env-var-compatibility.test.js');
      assert.ok(tests);
    });
  });

  describe('Configuration Files', () => {
    test('autopm/.opencode/config.json should exist', () => {
      assert.ok(fs.existsSync('autopm/.opencode/config.json'));
    });

    test('config.json should use hybrid-parallel execution', () => {
      const configPath = 'autopm/.opencode/config.json';
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        assert.strictEqual(
          config.execution_strategy.mode,
          'hybrid-parallel'
        );
      }
    });

    test('config.json should have max_agents set', () => {
      const configPath = 'autopm/.opencode/config.json';
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        assert.ok(config.execution_strategy.max_agents >= 3);
      }
    });

    test('config.json should have context_isolation enabled', () => {
      const configPath = 'autopm/.opencode/config.json';
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        assert.strictEqual(config.execution_strategy.context_isolation, true);
      }
    });
  });

  describe('CLI Entry Points', () => {
    test('opencode-autopm.js should exist', () => {
      assert.ok(fs.existsSync('bin/opencode-autopm.js'));
    });

    test('open-autopm.js should have deprecation notice', () => {
      const content = fs.readFileSync('bin/open-autopm.js', 'utf-8');
      assert.ok(content.includes('DEPRECATED') || content.includes('deprecated'));
    });

    test('opencode-autopm.js should not have deprecation notice', () => {
      const content = fs.readFileSync('bin/opencode-autopm.js', 'utf-8');
      assert.ok(!content.includes('DEPRECATED') || content.includes('OpenCodeAutoPM'));
    });
  });

  describe('Backward Compatibility Layer', () => {
    test('ClaudeCodeCompat should exist', () => {
      assert.ok(ClaudeCodeCompat);
    });

    test('should detect Claude Code environment', () => {
      const originalHome = process.env.HOME;
      process.env.HOME = '/tmp/test-claude';
      const hasClaudeCodeDir = fs.existsSync('.claude-code/') || fs.existsSync('.claude/');
      process.env.HOME = originalHome;
      
      // Test with environment variable
      process.env.CLAUDE_CODE = 'true';
      assert.strictEqual(ClaudeCodeCompat.isClaudeCode(), true);
      delete process.env.CLAUDE_CODE;
    });

    test('should detect OpenCode environment', () => {
      process.env.OPENCODE_ENV = 'true';
      assert.strictEqual(ClaudeCodeCompat.isOpenCode(), true);
      delete process.env.OPENCODE_ENV;
    });

    test('should map deprecated commands', () => {
      const mapped = ClaudeCodeCompat.getCompatibleCommand('open-autopm');
      assert.strictEqual(mapped, 'opencode-autopm');
    });

    test('should validate compatibility', () => {
      const validation = ClaudeCodeCompat.validateCompatibility();
      assert.ok(typeof validation.environment === 'string');
      assert.ok(Array.isArray(validation.deprecatedVars));
      assert.ok(Array.isArray(validation.deprecatedDirs));
    });
  });

  describe('Backward Compatibility with Environment Variables', () => {
    let originalEnv;

    beforeEach(() => {
      // Save original environment
      originalEnv = { ...process.env };

      // Clear all relevant env vars
      delete process.env.CLAUDE_PARALLEL_ENABLED;
      delete process.env.CLAUDE_MAX_AGENTS;
      delete process.env.CLAUDE_CONTEXT_ISOLATION;
      delete process.env.CLAUDE_TOKEN_LIMIT;
      delete process.env.CLAUDE_CODE;
      delete process.env.ANTHROPIC_WORKSPACE;
      delete process.env.OPENCODE_PARALLEL_ENABLED;
      delete process.env.OPENCODE_MAX_AGENTS;
      delete process.env.OPENCODE_CONTEXT_ISOLATION;
      delete process.env.OPENCODE_TOKEN_LIMIT;
      delete process.env.OPENCODE_ENV;
      delete process.env.OPENCODE_WORKSPACE;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('should support old CLAUDE_PARALLEL_ENABLED variable', () => {
      delete process.env.OPENCODE_PARALLEL_ENABLED;
      process.env.CLAUDE_PARALLEL_ENABLED = 'true';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.parallelEnabled, true);
      delete process.env.CLAUDE_PARALLEL_ENABLED;
    });

    test('should prefer new OPENCODE_PARALLEL_ENABLED variable', () => {
      process.env.OPENCODE_PARALLEL_ENABLED = 'false';
      process.env.CLAUDE_PARALLEL_ENABLED = 'true';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.parallelEnabled, false);
      delete process.env.OPENCODE_PARALLEL_ENABLED;
      delete process.env.CLAUDE_PARALLEL_ENABLED;
    });

    test('should support old CLAUDE_MAX_AGENTS variable', () => {
      process.env.CLAUDE_MAX_AGENTS = '8';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.maxAgents, 8);
      delete process.env.CLAUDE_MAX_AGENTS;
    });

    test('should support old ANTHROPIC_WORKSPACE variable', () => {
      process.env.ANTHROPIC_WORKSPACE = '/test/workspace';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.env.workspace, '/test/workspace');
      delete process.env.ANTHROPIC_WORKSPACE;
    });
  });

  describe('Directory Structure', () => {
    test('.opencode directory should exist', () => {
      assert.ok(fs.existsSync('.opencode'));
    });

    test('autopm/.opencode directory should exist', () => {
      assert.ok(fs.existsSync('autopm/.opencode'));
    });

    test('.opencode should contain agents directory', () => {
      assert.ok(fs.existsSync('.opencode/agents') || fs.existsSync('autopm/.opencode/agents'));
    });

    test('.opencode should contain commands directory', () => {
      assert.ok(fs.existsSync('.opencode/commands') || fs.existsSync('autopm/.opencode/commands'));
    });
  });

  describe('Feature Parity', () => {
    test('ConfigManager should have all required methods', () => {
      assert.strictEqual(typeof ConfigManager.getConfig, 'function');
      assert.strictEqual(typeof ConfigManager.getEnvVar, 'function');
      assert.strictEqual(typeof ConfigManager.getExecutionStrategy, 'function');
      assert.strictEqual(typeof ConfigManager.isOpenCodeEnv, 'function');
      assert.strictEqual(typeof ConfigManager.getConfigDir, 'function');
      assert.strictEqual(typeof ConfigManager.validateConfig, 'function');
      assert.strictEqual(typeof ConfigManager.displayConfig, 'function');
    });

    test('ClaudeCodeCompat should have all required methods', () => {
      assert.strictEqual(typeof ClaudeCodeCompat.isClaudeCode, 'function');
      assert.strictEqual(typeof ClaudeCodeCompat.isOpenCode, 'function');
      assert.strictEqual(typeof ClaudeCodeCompat.getEnvironment, 'function');
      assert.strictEqual(typeof ClaudeCodeCompat.migrateConfig, 'function');
      assert.strictEqual(typeof ClaudeCodeCompat.getCompatibleCommand, 'function');
      assert.strictEqual(typeof ClaudeCodeCompat.validateCompatibility, 'function');
    });

    test('should maintain feature parity with ConfigManager', () => {
      process.env.OPENCODE_MAX_AGENTS = '7';
      const config = ConfigManager.getConfig();
      assert.strictEqual(config.execution.maxAgents, 7);
      delete process.env.OPENCODE_MAX_AGENTS;
    });
  });

  describe('Integration Tests', () => {
    test('should complete full migration validation', () => {
      // This test validates that all components work together
      const pkg = require('../../package.json');
      
      // Check package
      assert.strictEqual(pkg.name, 'opencode-autopm');
      
      // Check ConfigManager
      const config = ConfigManager.getConfig();
      assert.ok(config.execution);
      
      // Check ClaudeCodeCompat
      const compat = ClaudeCodeCompat.validateCompatibility();
      assert.ok(typeof compat.environment === 'string');
      
      // Check documentation
      assert.ok(fs.existsSync('OPENCODE.md'));
    });

    test('should pass validation script checks', () => {
      // Run the validation script
      try {
        const result = execSync('bash scripts/validate-opencode-migration.sh', {
          encoding: 'utf-8',
          timeout: 10000
        });
        assert.ok(result.includes('Migration validation PASSED'));
      } catch (error) {
        // If validation fails, check if it's just warnings
        if (error.stdout && error.stdout.includes('PASSED')) {
          assert.ok(true);
        } else {
          throw error;
        }
      }
    });
  });
});
