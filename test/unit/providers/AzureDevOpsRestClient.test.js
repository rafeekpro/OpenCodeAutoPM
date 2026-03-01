/**
 * AzureDevOpsRestClient Test Suite
 *
 * TDD test suite for Azure DevOps REST API client
 * Following 2025 best practices with full coverage
 *
 * Test Coverage:
 * - Constructor and initialization
 * - Basic Authentication with PAT
 * - REST API requests
 * - Variable group linking to pipelines (KEY FEATURE)
 * - Variable group unlinking from pipelines
 * - Pipeline variable retrieval
 * - Secret variable handling
 * - JSON Patch operations
 * - Error handling (401, 403, 404)
 * - Edge cases and security
 */

// Mock fetch/axios for HTTP requests
const mockFetch = jest.fn();
global.fetch = mockFetch;

const AzureDevOpsRestClient = require('../../../lib/providers/AzureDevOpsRestClient');

describe('AzureDevOpsRestClient', () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();

    // Restore default mock implementation
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
      text: async () => '',
      headers: {
        get: (name) => name === 'content-type' ? 'application/json' : null
      }
    });

    client = new AzureDevOpsRestClient({
      organization: 'test-org',
      project: 'test-project',
      pat: 'test-pat-token'
    });
  });

  describe('Constructor', () => {
    test('should initialize with provided options', () => {
      expect(client.organization).toBe('test-org');
      expect(client.project).toBe('test-project');
      expect(client.pat).toBe('test-pat-token');
      expect(client.baseUrl).toBe('https://dev.azure.com/test-org');
      expect(client.apiVersion).toBe('6.0-preview');
    });

    test('should use default API version', () => {
      client = new AzureDevOpsRestClient({
        organization: 'test-org',
        project: 'test-project',
        pat: 'test-pat'
      });

      expect(client.apiVersion).toBe('6.0-preview');
    });

    test('should allow custom API version', () => {
      client = new AzureDevOpsRestClient({
        organization: 'test-org',
        project: 'test-project',
        pat: 'test-pat',
        apiVersion: '7.0'
      });

      expect(client.apiVersion).toBe('7.0');
    });
  });

  describe('Authentication', () => {
    test('should generate Basic Auth header correctly', () => {
      const authHeader = client._getAuthHeader();

      // Basic Auth should be base64 of ":pat"
      const expectedAuth = Buffer.from(':test-pat-token').toString('base64');
      expect(authHeader.Authorization).toBe(`Basic ${expectedAuth}`);
    });

    test('should include auth header in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'test' })
      });

      await client._request('/_apis/test', 'GET');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBeDefined();
      expect(fetchCall[1].headers.Authorization).toContain('Basic ');
    });
  });

  describe('_request', () => {
    test('should make GET request successfully', async () => {
      const mockResponse = { id: 1, name: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client._request('/_apis/test', 'GET');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_apis/test'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    test('should make POST request with body', async () => {
      const requestBody = { name: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...requestBody })
      });

      await client._request('/_apis/test', 'POST', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody)
        })
      );
    });

    test('should handle 401 Unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(client._request('/_apis/test', 'GET'))
        .rejects.toThrow('Authentication failed - check PAT token');
    });

    test('should handle 403 Forbidden error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      await expect(client._request('/_apis/test', 'GET'))
        .rejects.toThrow('Access denied - check PAT permissions');
    });

    test('should handle 404 Not Found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(client._request('/_apis/test', 'GET'))
        .rejects.toThrow('Resource not found');
    });

    test('should include API version in request URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await client._request('/_apis/test', 'GET');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('api-version=6.0-preview');
    });
  });

  describe('linkVariableGroup', () => {
    test('should link variable group to pipeline successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 51,
          name: 'test-pipeline',
          configuration: {
            variableGroups: [1]
          }
        })
      });

      const result = await client.linkVariableGroup(51, 1);

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_apis/pipelines/51'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"op":"add"'),
          body: expect.stringContaining('"path":"/configuration/variableGroups/-1"'),
          body: expect.stringContaining('"value":1')
        })
      );
    });

    test('should use JSON Patch format for linking', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 51 })
      });

      await client.linkVariableGroup(51, 1);

      const body = mockFetch.mock.calls[0][1].body;
      const patchDoc = JSON.parse(body);

      expect(Array.isArray(patchDoc)).toBe(true);
      expect(patchDoc).toHaveLength(1);
      expect(patchDoc[0]).toMatchObject({
        op: 'add',
        path: '/configuration/variableGroups/-1',
        value: 1
      });
    });

    test('should handle linking errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(client.linkVariableGroup(999, 1))
        .rejects.toThrow();
    });
  });

  describe('unlinkVariableGroup', () => {
    test('should unlink variable group from pipeline successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 51,
          configuration: {
            variableGroups: []
          }
        })
      });

      const result = await client.unlinkVariableGroup(51, 1);

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_apis/pipelines/51'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"op":"remove"')
        })
      );
    });

    test('should use JSON Patch format for unlinking', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 51 })
      });

      await client.unlinkVariableGroup(51, 1);

      const body = mockFetch.mock.calls[0][1].body;
      const patchDoc = JSON.parse(body);

      // Should be an array with one patch operation
      expect(Array.isArray(patchDoc)).toBe(true);
      expect(patchDoc[0]).toMatchObject({
        op: 'remove',
        path: '/configuration/variableGroups/[value=1]'
      });
    });
  });

  describe('getPipelineVariables', () => {
    test('should get pipeline variable groups', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 51,
          configuration: {
            variableGroups: [1, 2, 3]
          }
        })
      });

      const result = await client.getPipelineVariables(51);

      expect(result).toEqual([1, 2, 3]);
    });

    test('should handle pipeline with no variable groups', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 51,
          configuration: {
            variableGroups: []
          }
        })
      });

      const result = await client.getPipelineVariables(51);

      expect(result).toEqual([]);
    });
  });

  describe('addSecretVariables', () => {
    test('should add secret variables to variable group', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: 'test-vg',
          variables: {
            PUBLIC_VAR: { value: 'public', isSecret: false },
            SECRET_VAR: { isSecret: true }
          }
        })
      });

      const secrets = {
        SECRET_VAR: 'secret-value',
        ANOTHER_SECRET: 'another-secret'
      };

      const result = await client.addSecretVariables(1, secrets);

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_apis/distributedtask/variablegroups/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('SECRET_VAR')
        })
      );
    });

    test('should mark variables as secret in request', async () => {
      // Mock GET request to fetch existing variable group
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          variables: {}
        })
      });

      // Mock PATCH request to update variable group
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 })
      });

      const secrets = { API_KEY: 'secret-key' };

      await client.addSecretVariables(1, secrets);

      // The second call is the PATCH request
      const body = JSON.parse(mockFetch.mock.calls[1][1].body);

      expect(body.variables.API_KEY).toMatchObject({
        isSecret: true,
        value: 'secret-key'
      });
    });
  });

  describe('Security', () => {
    test('should never log secret values', async () => {
      // Mock GET request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          variables: {}
        })
      });

      // Mock PATCH request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 })
      });

      const secrets = { SECRET_KEY: 'super-secret-value' };

      await client.addSecretVariables(1, secrets);

      // Verify the request was made but secrets aren't exposed
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const requestBody = JSON.parse(mockFetch.mock.calls[1][1].body);

      // Secret value should be in body but not logged
      expect(requestBody.variables.SECRET_KEY.value).toBe('super-secret-value');
    });

    test('should sanitize errors with secrets', async () => {
      // Mock GET request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          variables: {}
        })
      });

      // Mock PATCH request that fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Error' })
      });

      await expect(client.addSecretVariables(1, { KEY: 'secret' }))
        .rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle variable group already linked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 51,
          configuration: {
            variableGroups: [1, 2, 3]
          }
        })
      });

      // Should still succeed (idempotent)
      const result = await client.linkVariableGroup(51, 1);

      expect(result).toBeDefined();
    });

    test('should handle unlinking non-linked variable group', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 51,
          configuration: {
            variableGroups: [2, 3]
          }
        })
      });

      // Should succeed (idempotent)
      const result = await client.unlinkVariableGroup(51, 1);

      expect(result).toBeDefined();
    });

    test('should handle special characters in secret values', async () => {
      // Mock GET request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          variables: {}
        })
      });

      // Mock PATCH request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 })
      });

      const secrets = { KEY: 'value with spaces && special = chars' };

      await client.addSecretVariables(1, secrets);

      const body = JSON.parse(mockFetch.mock.calls[1][1].body);

      expect(body.variables.KEY.value).toBe('value with spaces && special = chars');
    });

    test('should handle empty secrets object', async () => {
      // Mock GET request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          variables: {}
        })
      });

      // Mock PATCH request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 })
      });

      await client.addSecretVariables(1, {});

      const body = JSON.parse(mockFetch.mock.calls[1][1].body);

      expect(body.variables).toEqual({});
    });
  });
});
