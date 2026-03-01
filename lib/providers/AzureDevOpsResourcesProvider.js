/**
 * Azure DevOps Resources Provider
 *
 * Integrates CLI and REST API for Azure DevOps resource management.
 * Implements CLI-first strategy with REST API fallback for operations not supported by CLI.
 *
 * KEY FEATURE: Variable group linking to pipelines (REST API only - CLI does not support this!)
 *
 * Features:
 * - Variable group CRUD operations
 * - Variable group linking/unlinking to pipelines
 * - Secret variable management
 * - Export/import functionality
 * - Validation operations
 * - CLI-first, REST-fallback strategy
 * - Retry logic for transient failures
 *
 * @module lib/providers/AzureDevOpsResourcesProvider
 */

const AzureDevOpsCliWrapper = require('./AzureDevOpsCliWrapper');
const AzureDevOpsRestClient = require('./AzureDevOpsRestClient');

/**
 * Azure DevOps Resources Provider Class
 *
 * Manages Azure DevOps resources using CLI and REST API
 *
 * @class AzureDevOpsResourcesProvider
 */
class AzureDevOpsResourcesProvider {
  /**
   * Creates a new resources provider instance
   *
   * @param {Object} options - Configuration options
   * @param {string} options.organization - Azure DevOps organization name
   * @param {string} options.project - Azure DevOps project name
   * @param {string} options.pat - Personal Access Token
   * @param {number} [options.maxRetries=3] - Maximum retries for transient failures
   */
  constructor(options = {}) {
    this.organization = options.organization;
    this.project = options.project;
    this.pat = options.pat;
    this.maxRetries = options.maxRetries || 3;

    // Initialize CLI wrapper (no PAT needed for CLI)
    this.cli = new AzureDevOpsCliWrapper({
      organization: this.organization,
      project: this.project
    });

    // Initialize REST client (requires PAT for operations not supported by CLI)
    this.rest = new AzureDevOpsRestClient({
      organization: this.organization,
      project: this.project,
      pat: this.pat
    });
  }

  /**
   * Creates a new variable group
   *
   * Uses CLI for creation, REST API for adding secrets
   *
   * @async
   * @param {string} name - Variable group name
   * @param {Object} variables - Key-value pairs of non-secret variables
   * @param {Object} [secrets={}] - Key-value pairs of secret variables
   * @returns {Promise<Object>} Created variable group
   */
  async createVariableGroup(name, variables = {}, secrets = {}) {
    // Create variable group using CLI
    const vg = await this.cli.variableGroupCreate(name, variables);

    // Add secrets using REST API (CLI doesn't support secrets)
    if (Object.keys(secrets).length > 0) {
      await this.rest.addSecretVariables(vg.id, secrets);
    }

    return vg;
  }

  /**
   * Links a variable group to a pipeline
   *
   * **KEY FEATURE**: This operation is NOT available in Azure CLI!
   * Uses REST API exclusively.
   *
   * This solves the user's immediate problem of manually linking variable groups.
   *
   * @async
   * @param {number} variableGroupId - Variable group ID
   * @param {number} pipelineId - Pipeline ID
   * @param {Object} [options={}] - Options
   * @param {number} [options.maxRetries] - Override default max retries
   * @returns {Promise<Object>} Updated pipeline
   */
  async linkVariableGroupToPipeline(variableGroupId, pipelineId, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    let attempts = 0;

    while (attempts <= maxRetries) {
      try {
        return await this.rest.linkVariableGroup(pipelineId, variableGroupId);
      } catch (error) {
        attempts++;

        // Don't retry if it's a permanent error
        if (error.message.includes('not found') || error.message.includes('Authentication failed')) {
          throw error;
        }

        // Retry on transient errors
        if (attempts <= maxRetries && error.message.includes('Transient')) {
          await this._delay(Math.pow(2, attempts) * 1000); // Exponential backoff
          continue;
        }

        throw error;
      }
    }
  }

  /**
   * Unlinks a variable group from a pipeline
   *
   * Uses REST API exclusively
   *
   * @async
   * @param {number} variableGroupId - Variable group ID
   * @param {number} pipelineId - Pipeline ID
   * @returns {Promise<Object>} Updated pipeline
   */
  async unlinkVariableGroupFromPipeline(variableGroupId, pipelineId) {
    return await this.rest.unlinkVariableGroup(pipelineId, variableGroupId);
  }

  /**
   * Lists all variable groups in the project
   *
   * Uses CLI
   *
   * @async
   * @returns {Promise<Array>} Array of variable groups
   */
  async getVariableGroups() {
    return await this.cli.variableGroupList();
  }

  /**
   * Gets details of a specific variable group
   *
   * Uses CLI
   *
   * @async
   * @param {number} id - Variable group ID
   * @returns {Promise<Object>} Variable group details
   */
  async getVariableGroup(id) {
    return await this.cli.variableGroupShow(id);
  }

  /**
   * Updates a variable group
   *
   * CLI doesn't support updating, so we delete and recreate
   *
   * @async
   * @param {number} id - Variable group ID
   * @param {Object} variables - New variables
   * @param {Object} [secrets={}] - New secrets
   * @returns {Promise<Object>} Updated variable group
   */
  async updateVariableGroup(id, variables, secrets = {}) {
    // Get current variable group
    const currentVg = await this.cli.variableGroupShow(id);
    const name = currentVg.name;

    // Delete old variable group
    await this.cli.variableGroupDelete(id);

    // Create new variable group with updated values
    return await this.createVariableGroup(name, variables, secrets);
  }

  /**
   * Deletes a variable group
   *
   * Uses CLI
   *
   * @async
   * @param {number} id - Variable group ID
   * @returns {Promise<void>}
   */
  async deleteVariableGroup(id) {
    await this.cli.variableGroupDelete(id);
  }

  /**
   * Exports a variable group to JSON or YAML format
   *
   * @async
   * @param {number} id - Variable group ID
   * @param {string} [format='json'] - Export format ('json' or 'yaml')
   * @returns {Promise<string|Object>} Exported data (string for YAML, object for JSON)
   */
  async exportVariableGroup(id, format = 'json') {
    const vg = await this.cli.variableGroupShow(id);

    if (format === 'yaml') {
      return this._toYaml(vg);
    }

    return {
      name: vg.name,
      variables: { ...vg.variables },
      description: vg.description || ''
    };
  }

  /**
   * Imports a variable group from data
   *
   * @async
   * @param {Object} data - Import data
   * @param {string} data.name - Variable group name
   * @param {Object} [data.variables] - Variables
   * @param {Object} [data.secrets] - Secrets
   * @returns {Promise<Object>} Created variable group
   */
  async importVariableGroup(data) {
    const { name, variables = {}, secrets = {} } = data;

    return await this.createVariableGroup(name, variables, secrets);
  }

  /**
   * Validates a variable group configuration
   *
   * @async
   * @param {number} id - Variable group ID
   * @returns {Promise<Object>} Validation result
   */
  async validateVariableGroup(id) {
    const vg = await this.cli.variableGroupShow(id);
    const errors = [];

    // Check for empty variables
    for (const [key, value] of Object.entries(vg.variables)) {
      if (value === '' || value === null || value === undefined) {
        errors.push(`Variable ${key} has empty value`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      variableGroup: vg
    };
  }

  /**
   * Converts object to YAML string
   *
   * @param {Object} obj - Object to convert
   * @returns {string} YAML string
   * @private
   */
  _toYaml(obj) {
    let yaml = '';

    if (obj.name) {
      yaml += `name: ${obj.name}\n`;
    }

    if (obj.variables) {
      yaml += 'variables:\n';
      for (const [key, value] of Object.entries(obj.variables)) {
        if (value === null || value === undefined) {
          yaml += `  ${key}: null\n`;
        } else {
          yaml += `  ${key}: ${value}\n`;
        }
      }
    }

    return yaml;
  }

  /**
   * Delays execution for specified milliseconds
   *
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   * @private
   */
  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AzureDevOpsResourcesProvider;
