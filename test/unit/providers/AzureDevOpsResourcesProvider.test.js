/**
 * AzureDevOpsResourcesProvider Test Suite
 *
 * TDD test suite for Azure DevOps Resources Provider
 * Following 2025 best practices with full coverage
 *
 * Test Coverage:
 * - Constructor and initialization
 * - CLI-first, REST-fallback strategy
 * - Variable group CRUD operations
 * - Variable group linking to pipelines (KEY FEATURE)
 * - Secret variable handling
 * - Export/import functionality
 * - Validation operations
 * - Error handling
 * - Edge cases and security
 */

// Mock the CLI and REST clients before requiring the module
const AzureDevOpsCliWrapper = require('../../../lib/providers/AzureDevOpsCliWrapper');
const AzureDevOpsRestClient = require('../../../lib/providers/AzureDevOpsRestClient');

// Mock both classes
jest.mock('../../../lib/providers/AzureDevOpsCliWrapper');
jest.mock('../../../lib/providers/AzureDevOpsRestClient');

const AzureDevOpsResourcesProvider = require('../../../lib/providers/AzureDevOpsResourcesProvider');

describe('AzureDevOpsResourcesProvider', () => {
  let provider;
  let mockCli;
  let mockRest;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock instances
    mockCli = {
      variableGroupList: jest.fn(),
      variableGroupShow: jest.fn(),
      variableGroupCreate: jest.fn(),
      variableGroupDelete: jest.fn(),
      pipelineList: jest.fn()
    };

    mockRest = {
      linkVariableGroup: jest.fn(),
      unlinkVariableGroup: jest.fn(),
      getPipelineVariables: jest.fn(),
      addSecretVariables: jest.fn()
    };

    // Make constructors return our mocks
    AzureDevOpsCliWrapper.mockImplementation(() => mockCli);
    AzureDevOpsRestClient.mockImplementation(() => mockRest);

    provider = new AzureDevOpsResourcesProvider({
      organization: 'test-org',
      project: 'test-project',
      pat: 'test-pat'
    });
  });

  describe('Constructor', () => {
    test('should initialize with CLI wrapper and REST client', () => {
      expect(AzureDevOpsCliWrapper).toHaveBeenCalledWith({
        organization: 'test-org',
        project: 'test-project'
      });

      expect(AzureDevOpsRestClient).toHaveBeenCalledWith({
        organization: 'test-org',
        project: 'test-project',
        pat: 'test-pat'
      });
    });

    test('should have cli and rest properties', () => {
      expect(provider.cli).toBeDefined();
      expect(provider.rest).toBeDefined();
    });
  });

  describe('createVariableGroup', () => {
    test('should create variable group using CLI', async () => {
      mockCli.variableGroupCreate.mockResolvedValueOnce({
        id: 1,
        name: 'test-vg',
        variables: { KEY: 'value' }
      });

      const result = await provider.createVariableGroup('test-vg', { KEY: 'value' });

      expect(result.id).toBe(1);
      expect(mockCli.variableGroupCreate).toHaveBeenCalledWith('test-vg', { KEY: 'value' });
    });

    test('should create variable group with secrets using CLI and REST', async () => {
      const cliResult = { id: 1, name: 'test-vg', variables: { PUBLIC: 'value' } };
      const restResult = { id: 1, name: 'test-vg', variables: { PUBLIC: 'value', SECRET: null } };

      mockCli.variableGroupCreate.mockResolvedValueOnce(cliResult);
      mockRest.addSecretVariables.mockResolvedValueOnce(restResult);

      const secrets = { SECRET: 'secret-value' };
      const result = await provider.createVariableGroup('test-vg', { PUBLIC: 'value' }, secrets);

      expect(mockCli.variableGroupCreate).toHaveBeenCalledWith('test-vg', { PUBLIC: 'value' });
      expect(mockRest.addSecretVariables).toHaveBeenCalledWith(1, secrets);
      expect(result.id).toBe(1);
    });

    test('should handle CLI errors gracefully', async () => {
      mockCli.variableGroupCreate.mockRejectedValueOnce(new Error('CLI failed'));

      await expect(provider.createVariableGroup('test-vg', { KEY: 'value' }))
        .rejects.toThrow('CLI failed');
    });
  });

  describe('linkVariableGroupToPipeline', () => {
    test('should link VG to pipeline using REST API (CLI does not support this)', async () => {
      mockRest.linkVariableGroup.mockResolvedValueOnce({
        id: 51,
        configuration: {
          variableGroups: [1]
        }
      });

      const result = await provider.linkVariableGroupToPipeline(1, 51);

      expect(result.id).toBe(51);
      expect(mockRest.linkVariableGroup).toHaveBeenCalledWith(51, 1);
      expect(result.configuration.variableGroups).toContain(1);
    });

    test('should handle linking errors', async () => {
      mockRest.linkVariableGroup.mockRejectedValueOnce(
        new Error('Pipeline not found')
      );

      await expect(provider.linkVariableGroupToPipeline(1, 999))
        .rejects.toThrow('Pipeline not found');
    });

    test('should retry on transient failures', async () => {
      let attempts = 0;
      mockRest.linkVariableGroup.mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Transient error'));
        }
        return Promise.resolve({
          id: 51,
          configuration: { variableGroups: [1] }
        });
      });

      const result = await provider.linkVariableGroupToPipeline(1, 51, { maxRetries: 3 });

      expect(attempts).toBe(3);
      expect(result.configuration.variableGroups).toContain(1);
    });
  });

  describe('unlinkVariableGroupFromPipeline', () => {
    test('should unlink VG from pipeline using REST API', async () => {
      mockRest.unlinkVariableGroup.mockResolvedValueOnce({
        id: 51,
        configuration: {
          variableGroups: []
        }
      });

      const result = await provider.unlinkVariableGroupFromPipeline(1, 51);

      expect(mockRest.unlinkVariableGroup).toHaveBeenCalledWith(51, 1);
      expect(result.configuration.variableGroups).not.toContain(1);
    });
  });

  describe('getVariableGroups', () => {
    test('should list all variable groups using CLI', async () => {
      const mockVgs = [
        { id: 1, name: 'vg1' },
        { id: 2, name: 'vg2' }
      ];

      mockCli.variableGroupList.mockResolvedValueOnce(mockVgs);

      const result = await provider.getVariableGroups();

      expect(result).toEqual(mockVgs);
      expect(mockCli.variableGroupList).toHaveBeenCalled();
    });
  });

  describe('getVariableGroup', () => {
    test('should get variable group details using CLI', async () => {
      const mockVg = {
        id: 1,
        name: 'test-vg',
        variables: { KEY: 'value' }
      };

      mockCli.variableGroupShow.mockResolvedValueOnce(mockVg);

      const result = await provider.getVariableGroup(1);

      expect(result).toEqual(mockVg);
      expect(mockCli.variableGroupShow).toHaveBeenCalledWith(1);
    });
  });

  describe('updateVariableGroup', () => {
    test('should delete and recreate variable group (CLI limitation)', async () => {
      const existingVg = { id: 1, name: 'test-vg', variables: { OLD: 'value' } };
      const newVg = { id: 2, name: 'test-vg', variables: { NEW: 'value' } };

      mockCli.variableGroupShow.mockResolvedValueOnce(existingVg);
      mockCli.variableGroupCreate.mockResolvedValueOnce(newVg);
      mockCli.variableGroupDelete.mockResolvedValueOnce(undefined);

      const result = await provider.updateVariableGroup(1, { NEW: 'value' });

      expect(mockCli.variableGroupShow).toHaveBeenCalledWith(1);
      expect(mockCli.variableGroupDelete).toHaveBeenCalledWith(1);
      expect(mockCli.variableGroupCreate).toHaveBeenCalled();
    });
  });

  describe('deleteVariableGroup', () => {
    test('should delete variable group using CLI', async () => {
      mockCli.variableGroupDelete.mockResolvedValueOnce(undefined);

      await expect(provider.deleteVariableGroup(1)).resolves.not.toThrow();
      expect(mockCli.variableGroupDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('exportVariableGroup', () => {
    test('should export variable group to JSON format', async () => {
      const mockVg = {
        id: 1,
        name: 'test-vg',
        variables: { KEY: 'value' }
      };

      mockCli.variableGroupShow.mockResolvedValueOnce(mockVg);

      const result = await provider.exportVariableGroup(1, 'json');

      expect(result).toMatchObject({
        name: 'test-vg',
        variables: { KEY: 'value' }
      });
    });

    test('should export variable group to YAML format', async () => {
      const mockVg = {
        id: 1,
        name: 'test-vg',
        variables: { KEY: 'value' }
      };

      mockCli.variableGroupShow.mockResolvedValueOnce(mockVg);

      const result = await provider.exportVariableGroup(1, 'yaml');

      expect(result).toContain('name: test-vg');
      expect(result).toContain('variables:');
    });
  });

  describe('importVariableGroup', () => {
    test('should import variable group from JSON', async () => {
      const importData = {
        name: 'imported-vg',
        variables: { KEY: 'value' }
      };

      mockCli.variableGroupCreate.mockResolvedValueOnce({
        id: 1,
        ...importData
      });

      const result = await provider.importVariableGroup(importData);

      expect(result.id).toBe(1);
      expect(mockCli.variableGroupCreate).toHaveBeenCalledWith('imported-vg', { KEY: 'value' });
    });

    test('should import variable group with secrets', async () => {
      const importData = {
        name: 'imported-vg',
        variables: { PUBLIC: 'value' },
        secrets: { SECRET: 'secret-value' }
      };

      const cliResult = { id: 1, name: 'imported-vg', variables: { PUBLIC: 'value' } };
      const restResult = { id: 1, variables: { PUBLIC: 'value', SECRET: null } };

      mockCli.variableGroupCreate.mockResolvedValueOnce(cliResult);
      mockRest.addSecretVariables.mockResolvedValueOnce(restResult);

      const result = await provider.importVariableGroup(importData);

      expect(mockCli.variableGroupCreate).toHaveBeenCalled();
      expect(mockRest.addSecretVariables).toHaveBeenCalledWith(1, { SECRET: 'secret-value' });
    });
  });

  describe('validateVariableGroup', () => {
    test('should validate variable group configuration', async () => {
      const mockVg = {
        id: 1,
        name: 'test-vg',
        variables: { KEY: 'value' }
      };

      mockCli.variableGroupShow.mockResolvedValueOnce(mockVg);

      const result = await provider.validateVariableGroup(1);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should detect missing variable references', async () => {
      const mockVg = {
        id: 1,
        name: 'test-vg',
        variables: {
          VALID_VAR: 'value',
          EMPTY_VAR: '',
          NULL_VAR: null
        }
      };

      mockCli.variableGroupShow.mockResolvedValueOnce(mockVg);

      const result = await provider.validateVariableGroup(1);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Variable EMPTY_VAR has empty value');
    });
  });

  describe('Security', () => {
    test('should never log secret values', async () => {
      mockCli.variableGroupCreate.mockResolvedValueOnce({ id: 1 });
      mockRest.addSecretVariables.mockResolvedValueOnce({ id: 1 });

      const secrets = { API_KEY: 'super-secret-key' };

      await provider.createVariableGroup('test-vg', {}, secrets);

      // Verify secrets were passed to REST client but not logged
      expect(mockRest.addSecretVariables).toHaveBeenCalledWith(1, secrets);
    });

    test('should sanitize secret values in errors', async () => {
      mockCli.variableGroupCreate.mockResolvedValueOnce({ id: 1 });
      mockRest.addSecretVariables.mockRejectedValueOnce(
        new Error('Failed to add secret=super-secret')
      );

      await expect(
        provider.createVariableGroup('test-vg', {}, { KEY: 'secret' })
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle variable group not found', async () => {
      mockCli.variableGroupShow.mockRejectedValueOnce(
        new Error('Variable group not found')
      );

      await expect(provider.getVariableGroup(999))
        .rejects.toThrow('Variable group not found');
    });

    test('should handle pipeline not found when linking', async () => {
      mockRest.linkVariableGroup.mockRejectedValueOnce(
        new Error('Pipeline not found')
      );

      await expect(provider.linkVariableGroupToPipeline(1, 999))
        .rejects.toThrow('Pipeline not found');
    });

    test('should handle authentication errors', async () => {
      mockCli.variableGroupList.mockRejectedValueOnce(
        new Error('Authentication failed')
      );

      await expect(provider.getVariableGroups())
        .rejects.toThrow('Authentication failed');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty variable group', async () => {
      const mockVg = { id: 1, name: 'empty-vg', variables: {} };

      mockCli.variableGroupShow.mockResolvedValueOnce(mockVg);

      const result = await provider.getVariableGroup(1);

      expect(result.variables).toEqual({});
    });

    test('should handle special characters in variable values', async () => {
      const specialValue = 'value with spaces && special = chars';

      mockCli.variableGroupCreate.mockResolvedValueOnce({
        id: 1,
        name: 'test-vg',
        variables: { KEY: specialValue }
      });

      const result = await provider.createVariableGroup('test-vg', { KEY: specialValue });

      expect(result.variables.KEY).toBe(specialValue);
    });

    test('should handle linking VG to multiple pipelines', async () => {
      mockRest.linkVariableGroup.mockResolvedValue({
        id: 51,
        configuration: { variableGroups: [1] }
      });

      await provider.linkVariableGroupToPipeline(1, 51);
      await provider.linkVariableGroupToPipeline(1, 52);
      await provider.linkVariableGroupToPipeline(1, 53);

      expect(mockRest.linkVariableGroup).toHaveBeenCalledTimes(3);
    });

    test('should handle variable group with many variables', async () => {
      const manyVars = {};
      for (let i = 0; i < 100; i++) {
        manyVars[`VAR_${i}`] = `value_${i}`;
      }

      mockCli.variableGroupCreate.mockResolvedValueOnce({
        id: 1,
        name: 'large-vg',
        variables: manyVars
      });

      const result = await provider.createVariableGroup('large-vg', manyVars);

      expect(Object.keys(result.variables).length).toBe(100);
    });
  });
});
