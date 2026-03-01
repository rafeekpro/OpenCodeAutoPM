/**
 * Azure DevOps REST API Client
 *
 * Provides REST API client for Azure DevOps operations that are not
 * supported by Azure CLI. Uses Basic Authentication with PAT.
 *
 * Key Feature: Variable group linking to pipelines (CLI doesn't support this!)
 *
 * Features:
 * - REST API requests with Basic Auth
 * - Variable group linking/unlinking to pipelines
 * - Pipeline variable retrieval
 * - Secret variable management
 * - JSON Patch operations
 * - Error handling (401, 403, 404)
 *
 * @module lib/providers/AzureDevOpsRestClient
 */

/**
 * Azure DevOps REST API Client Class
 *
 * Handles REST API operations for Azure DevOps
 *
 * @class AzureDevOpsRestClient
 */
class AzureDevOpsRestClient {
  /**
   * Creates a new REST API client instance
   *
   * @param {Object} options - Configuration options
   * @param {string} options.organization - Azure DevOps organization name
   * @param {string} options.project - Azure DevOps project name
   * @param {string} options.pat - Personal Access Token
   * @param {string} [options.apiVersion='6.0-preview'] - API version
   */
  constructor(options = {}) {
    this.organization = options.organization;
    this.project = options.project;
    this.pat = options.pat;
    this.apiVersion = options.apiVersion || '6.0-preview';
    this.baseUrl = `https://dev.azure.com/${this.organization}`;
  }

  /**
   * Makes a REST API request
   *
   * @async
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
   * @param {Object} [body=null] - Request body
   * @returns {Promise<Object>} Response data
   * @throws {Error} If request fails
   * @private
   */
  async _request(endpoint, method, body = null) {
    const url = `${this.baseUrl}${endpoint}?api-version=${this.apiVersion}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this._getAuthHeader()
    };

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      await this._handleError(response);
    }

    // Try to parse as JSON, fallback to text
    if (response.headers && typeof response.headers.get === 'function') {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
    }

    // Default to JSON parsing if we can't determine content type
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  }

  /**
   * Generates Basic Auth header from PAT
   *
   * @returns {Object} Authorization header
   * @private
   */
  _getAuthHeader() {
    const auth = Buffer.from(`:${this.pat}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`
    };
  }

  /**
   * Handles HTTP errors
   *
   * @async
   * @param {Response} response - Fetch response object
   * @throws {Error} With appropriate error message
   * @private
   */
  async _handleError(response) {
    const { status, statusText } = response;

    switch (status) {
      case 401:
        throw new Error('Authentication failed - check PAT token');
      case 403:
        throw new Error('Access denied - check PAT permissions');
      case 404:
        throw new Error('Resource not found');
      default:
        throw new Error(`Request failed: ${status} ${statusText}`);
    }
  }

  /**
   * Links a variable group to a pipeline
   *
   * **KEY FEATURE**: This operation is NOT available in Azure CLI!
   * Must use REST API.
   *
   * @async
   * @param {number} pipelineId - Pipeline ID
   * @param {number} variableGroupId - Variable group ID
   * @returns {Promise<Object>} Updated pipeline
   */
  async linkVariableGroup(pipelineId, variableGroupId) {
    const patchDoc = [
      {
        op: 'add',
        path: '/configuration/variableGroups/-1',
        value: variableGroupId
      }
    ];

    return await this._request(
      `/_apis/pipelines/${pipelineId}`,
      'PATCH',
      patchDoc
    );
  }

  /**
   * Unlinks a variable group from a pipeline
   *
   * @async
   * @param {number} pipelineId - Pipeline ID
   * @param {number} variableGroupId - Variable group ID
   * @returns {Promise<Object>} Updated pipeline
   */
  async unlinkVariableGroup(pipelineId, variableGroupId) {
    const patchDoc = {
      op: 'remove',
      path: `/configuration/variableGroups/[value=${variableGroupId}]`,
      value: variableGroupId
    };

    return await this._request(
      `/_apis/pipelines/${pipelineId}`,
      'PATCH',
      [patchDoc]
    );
  }

  /**
   * Gets variable groups linked to a pipeline
   *
   * @async
   * @param {number} pipelineId - Pipeline ID
   * @returns {Promise<Array<number>>} Array of variable group IDs
   */
  async getPipelineVariables(pipelineId) {
    const pipeline = await this._request(`/_apis/pipelines/${pipelineId}`, 'GET');

    if (pipeline.configuration && pipeline.configuration.variableGroups) {
      return pipeline.configuration.variableGroups;
    }

    return [];
  }

  /**
   * Adds secret variables to a variable group
   *
   * Secret variables must be added via REST API (CLI doesn't support secrets)
   *
   * @async
   * @param {number} variableGroupId - Variable group ID
   * @param {Object} secrets - Key-value pairs of secret variables
   * @returns {Promise<Object>} Updated variable group
   */
  async addSecretVariables(variableGroupId, secrets) {
    const variableGroup = await this._request(
      `/_apis/distributedtask/variablegroups/${variableGroupId}`,
      'GET'
    );

    // Add secrets to existing variables
    const updatedVariables = {
      ...variableGroup.variables
    };

    for (const [key, value] of Object.entries(secrets)) {
      updatedVariables[key] = {
        isSecret: true,
        value: value
      };
    }

    const patchDoc = {
      variables: updatedVariables
    };

    return await this._request(
      `/_apis/distributedtask/variablegroups/${variableGroupId}`,
      'PATCH',
      patchDoc
    );
  }
}

module.exports = AzureDevOpsRestClient;
