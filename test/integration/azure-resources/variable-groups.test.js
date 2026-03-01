/**
 * Azure DevOps Variable Groups Integration Tests
 *
 * Integration tests for variable group operations
 * Requires real Azure DevOps environment with TEST credentials
 *
 * Prerequisites:
 * - AZURE_DEVOPS_TEST_PAT: Valid PAT with variable group permissions
 * - AZURE_DEVOPS_TEST_ORG: Test organization
 * - AZURE_DEVOPS_TEST_PROJECT: Test project
 * - At least one pipeline in the project
 *
 * @module test/integration/azure-resources/variable-groups
 */

const { AzureDevOpsResourcesProvider } = require('../../../lib/providers/AzureDevOpsResourcesProvider');

describe('Azure DevOps Variable Groups Integration Tests', () => {
  let provider;

  const TEST_CONFIG = {
    organization: process.env.AZURE_DEVOPS_TEST_ORG,
    project: process.env.AZURE_DEVOPS_TEST_PROJECT,
    pat: process.env.AZURE_DEVOPS_TEST_PAT
  };

  beforeAll(() => {
    // Skip tests if test credentials not provided
    if (!TEST_CONFIG.pat || !TEST_CONFIG.organization || !TEST_CONFIG.project) {
      console.warn('⚠️  Azure DevOps integration tests skipped');
      console.warn('Set AZURE_DEVOPS_TEST_PAT, AZURE_DEVOPS_TEST_ORG, AZURE_DEVOPS_TEST_PROJECT');
      return;
    }

    provider = new AzureDevOpsResourcesProvider(TEST_CONFIG);
  });

  describe('Variable Group CRUD Operations', () => {
    let testVgId;
    const timestamp = Date.now();
    const testVgName = `autopm-test-vg-${timestamp}`;

    test('should create variable group with regular variables', async () => {
      const variables = {
        APP_ENV: 'test',
        API_URL: 'https://api.example.com',
        DEBUG: 'false'
      };

      const vg = await provider.createVariableGroup(testVgName, variables);

      expect(vg).toBeDefined();
      expect(vg.id).toBeDefined();
      expect(vg.name).toBe(testVgName);
      expect(vg.variables.APP_ENV).toBe('test');

      testVgId = vg.id;
    }, 30000);

    test('should get variable group details', async () => {
      if (!testVgId) {
        pending('No test VG created');
      }

      const vg = await provider.getVariableGroup(testVgId);

      expect(vg).toBeDefined();
      expect(vg.id).toBe(testVgId);
      expect(vg.name).toBe(testVgName);
      expect(vg.variables).toBeDefined();
    }, 10000);

    test('should list variable groups', async () => {
      const vgs = await provider.getVariableGroups();

      expect(Array.isArray(vgs)).toBe(true);
      expect(vgs.length).toBeGreaterThan(0);

      // Find our test VG
      const testVg = vgs.find(vg => vg.name === testVgName);
      expect(testVg).toBeDefined();
    }, 10000);

    test('should update variable group', async () => {
      if (!testVgId) {
        pending('No test VG created');
      }

      const updatedVg = await provider.updateVariableGroup(testVgId, {
        APP_ENV: 'updated',
        NEW_VAR: 'new-value'
      });

      expect(updatedVg).toBeDefined();
      expect(updatedVg.variables.APP_ENV).toBe('updated');
      expect(updatedVg.variables.NEW_VAR).toBe('new-value');
    }, 30000);

    test('should delete variable group', async () => {
      if (!testVgId) {
        pending('No test VG created');
      }

      await expect(provider.deleteVariableGroup(testVgId)).resolves.not.toThrow();
    }, 10000);
  });

  describe('Variable Group with Secrets', () => {
    let testVgId;
    const timestamp = Date.now();
    const testVgName = `autopm-secrets-${timestamp}`;

    test('should create variable group with secrets', async () => {
      const variables = {
        PUBLIC_VAR: 'public-value'
      };

      const secrets = {
        SECRET_VAR: 'secret-value',
        API_KEY: 'test-api-key-123'
      };

      const vg = await provider.createVariableGroup(testVgName, variables, secrets);

      expect(vg).toBeDefined();
      expect(vg.id).toBeDefined();
      expect(vg.name).toBe(testVgName);

      testVgId = vg.id;
    }, 30000);

    test('should not expose secrets in VG details', async () => {
      if (!testVgId) {
        pending('No test VG created');
      }

      const vg = await provider.getVariableGroup(testVgId);

      expect(vg).toBeDefined();

      // Secrets should be null or not present in regular output
      if (vg.variables.SECRET_VAR) {
        expect(vg.variables.SECRET_VAR.isSecret).toBe(true);
        expect(vg.variables.SECRET_VAR.value).toBeNull();
      }
    }, 10000);

    // Cleanup
    afterAll(async () => {
      if (testVgId) {
        try {
          await provider.deleteVariableGroup(testVgId);
        } catch (error) {
          console.warn(`Failed to cleanup test VG ${testVgId}:`, error.message);
        }
      }
    });
  });

  describe('Variable Group Linking to Pipelines', () => {
    let testVgId;
    let testPipelineId;
    const timestamp = Date.now();
    const testVgName = `autopm-link-test-${timestamp}`;

    beforeAll(async () => {
      if (!TEST_CONFIG.pat) return;

      // Create test VG
      const vg = await provider.createVariableGroup(testVgName, {
        TEST_VAR: 'test-value'
      });
      testVgId = vg.id;

      // Get first available pipeline
      const pipelines = await provider.cli.pipelineList();
      if (pipelines && pipelines.length > 0) {
        testPipelineId = pipelines[0].id;
      }
    });

    test('should link variable group to pipeline', async () => {
      if (!testVgId || !testPipelineId) {
        pending('Test VG or pipeline not available');
      }

      const result = await provider.linkVariableGroupToPipeline(testVgId, testPipelineId);

      expect(result).toBeDefined();
      expect(result.id).toBe(testPipelineId);
      expect(result.configuration.variableGroups).toContain(testVgId);
    }, 30000);

    test('should get pipeline variables', async () => {
      if (!testPipelineId) {
        pending('Test pipeline not available');
      }

      const variables = await provider.rest.getPipelineVariables(testPipelineId);

      expect(Array.isArray(variables)).toBe(true);
    }, 10000);

    test('should unlink variable group from pipeline', async () => {
      if (!testVgId || !testPipelineId) {
        pending('Test VG or pipeline not available');
      }

      const result = await provider.unlinkVariableGroupFromPipeline(testVgId, testPipelineId);

      expect(result).toBeDefined();
      expect(result.id).toBe(testPipelineId);
    }, 30000);

    // Cleanup
    afterAll(async () => {
      if (testVgId) {
        try {
          await provider.deleteVariableGroup(testVgId);
        } catch (error) {
          console.warn(`Failed to cleanup test VG ${testVgId}:`, error.message);
        }
      }
    });
  });

  describe('Variable Group Export/Import', () => {
    let testVgId;
    const timestamp = Date.now();
    const testVgName = `autopm-export-test-${timestamp}`;
    const exportFile = `/tmp/autopm-test-export-${timestamp}.json`;

    test('should export variable group to JSON', async () => {
      if (!TEST_CONFIG.pat) return;

      // Create test VG
      const vg = await provider.createVariableGroup(testVgName, {
        EXPORT_VAR: 'export-value'
      });
      testVgId = vg.id;

      // Export
      const exported = await provider.exportVariableGroup(testVgId, 'json');

      expect(exported).toBeDefined();
      expect(exported.name).toBe(testVgName);
      expect(exported.variables).toBeDefined();
      expect(exported.variables.EXPORT_VAR).toBe('export-value');
    }, 30000);

    test('should import variable group from JSON', async () => {
      if (!TEST_CONFIG.pat) return;

      const importData = {
        name: `autopm-import-${timestamp}`,
        variables: {
          IMPORTED_VAR: 'imported-value'
        }
      };

      const vg = await provider.importVariableGroup(importData);

      expect(vg).toBeDefined();
      expect(vg.name).toBe(`autopm-import-${timestamp}`);
      expect(vg.variables.IMPORTED_VAR).toBe('imported-value');

      // Cleanup
      await provider.deleteVariableGroup(vg.id);
    }, 30000);

    // Cleanup
    afterAll(async () => {
      if (testVgId) {
        try {
          await provider.deleteVariableGroup(testVgId);
          // Also remove export file if it exists
          const fs = require('fs');
          if (fs.existsSync(exportFile)) {
            fs.unlinkSync(exportFile);
          }
        } catch (error) {
          console.warn(`Failed to cleanup:`, error.message);
        }
      }
    });
  });

  describe('Variable Group Validation', () => {
    let testVgId;
    const timestamp = Date.now();
    const testVgName = `autopm-validate-${timestamp}`;

    test('should validate healthy variable group', async () => {
      if (!TEST_CONFIG.pat) return;

      const vg = await provider.createVariableGroup(testVgName, {
        VALID_VAR: 'value',
        ANOTHER_VAR: 'another-value'
      });
      testVgId = vg.id;

      const validation = await provider.validateVariableGroup(testVgId);

      expect(validation).toBeDefined();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    }, 30000);

    test('should detect unhealthy variable group', async () => {
      if (!TEST_CONFIG.pat) return;

      const vg = await provider.createVariableGroup(testVgName, {
        VALID_VAR: 'value',
        EMPTY_VAR: '',
        NULL_VAR: null
      });
      testVgId = vg.id;

      const validation = await provider.validateVariableGroup(testVgId);

      expect(validation).toBeDefined();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    }, 30000);

    // Cleanup
    afterAll(async () => {
      if (testVgId) {
        try {
          await provider.deleteVariableGroup(testVgId);
        } catch (error) {
          console.warn(`Failed to cleanup test VG ${testVgId}:`, error.message);
        }
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent variable group', async () => {
      if (!TEST_CONFIG.pat) return;

      await expect(provider.getVariableGroup(999999))
        .rejects.toThrow();
    }, 10000);

    test('should handle invalid pipeline linking', async () => {
      if (!TEST_CONFIG.pat) return;

      await expect(provider.linkVariableGroupToPipeline(1, 999999))
        .rejects.toThrow();
    }, 30000);
  });

  describe('Edge Cases', () => {
    test('should handle linking VG to multiple pipelines', async () => {
      if (!TEST_CONFIG.pat) return;

      // Create test VG
      const vg = await provider.createVariableGroup(`autopm-multi-${Date.now()}`, {
        MULTI_VAR: 'multi-value'
      });

      // Get multiple pipelines
      const pipelines = await provider.cli.pipelineList();
      if (pipelines.length >= 2) {
        const pipelineIds = pipelines.slice(0, 2).map(p => p.id);

        // Link to multiple pipelines
        for (const pipelineId of pipelineIds) {
          await provider.linkVariableGroupToPipeline(vg.id, pipelineId);
        }

        // Verify all links
        for (const pipelineId of pipelineIds) {
          const variables = await provider.rest.getPipelineVariables(pipelineId);
          expect(variables).toContain(vg.id);
        }

        // Cleanup
        for (const pipelineId of pipelineIds) {
          await provider.unlinkVariableGroupFromPipeline(vg.id, pipelineId);
        }
      }

      // Cleanup
      await provider.deleteVariableGroup(vg.id);
    }, 60000);
  });
});
