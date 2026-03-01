/**
 * Azure DevOps CLI Wrapper
 *
 * Provides a wrapper around Azure CLI (az) commands for Azure DevOps operations.
 * Includes retry logic with exponential backoff for resilience.
 *
 * Features:
 * - Azure CLI command execution
 * - Automatic retry with exponential backoff
 * - Output parsing (JSON)
 * - Error handling
 * - Variable group operations (CLI)
 * - Service connection operations (CLI)
 * - Pipeline operations (CLI)
 *
 * @module lib/providers/AzureDevOpsCliWrapper
 */

const { exec } = require('child_process');
const util = require('util');

/**
 * Azure DevOps CLI Wrapper Class
 *
 * Wraps Azure CLI commands for Azure DevOps resource management
 *
 * @class AzureDevOpsCliWrapper
 */
class AzureDevOpsCliWrapper {
  /**
   * Creates a new Azure CLI wrapper instance
   *
   * @param {Object} options - Configuration options
   * @param {string} options.organization - Azure DevOps organization name
   * @param {string} options.project - Azure DevOps project name
   * @param {number} [options.maxRetries=3] - Maximum number of retries
   * @param {number} [options.retryDelay=1000] - Initial retry delay in ms
   */
  constructor(options = {}) {
    this.organization = options.organization;
    this.project = options.project;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * Executes an Azure CLI command
   *
   * @param {string} command - CLI command to execute (without 'az' prefix)
   * @param {Function} callback - Callback function (error, stdout)
   */
  execute(command, callback) {
    const fullCommand = this._buildCommand(command);

    exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        return callback(error, stdout);
      }

      callback(null, stdout);
    });
  }

  /**
   * Executes an Azure CLI command with retry logic
   *
   * Implements exponential backoff: 1s, 2s, 4s, ...
   *
   * @param {string} command - CLI command to execute
   * @param {number} maxRetries - Maximum number of retries
   * @param {Function} callback - Callback function (error, stdout)
   */
  executeWithRetry(command, maxRetries, callback) {
    let attempts = 0;
    const retry = (delay) => {
      this.execute(command, (error, stdout) => {
        if (error && attempts < maxRetries) {
          attempts++;
          const nextDelay = delay * 2;
          setTimeout(() => retry(nextDelay), delay);
        } else {
          callback(error, stdout);
        }
      });
    };

    retry(this.retryDelay);
  }

  /**
   * Lists all variable groups in the project
   *
   * @async
   * @returns {Promise<Array>} Array of variable groups
   */
  async variableGroupList() {
    return new Promise((resolve, reject) => {
      this.execute('pipelines variable-group list', (error, stdout) => {
        if (error) {
          return reject(error);
        }

        try {
          const vgs = JSON.parse(stdout);
          resolve(vgs);
        } catch (parseError) {
          reject(new Error(`Failed to parse variable groups: ${parseError.message}`));
        }
      });
    });
  }

  /**
   * Shows details of a specific variable group
   *
   * @async
   * @param {number} id - Variable group ID
   * @returns {Promise<Object>} Variable group details
   */
  async variableGroupShow(id) {
    return new Promise((resolve, reject) => {
      this.execute(`pipelines variable-group show --id ${id}`, (error, stdout) => {
        if (error) {
          return reject(new Error(`Variable group not found: ${id}`));
        }

        try {
          const vg = JSON.parse(stdout);
          resolve(vg);
        } catch (parseError) {
          reject(new Error(`Failed to parse variable group: ${parseError.message}`));
        }
      });
    });
  }

  /**
   * Creates a new variable group
   *
   * @async
   * @param {string} name - Variable group name
   * @param {Object} variables - Key-value pairs of variables
   * @returns {Promise<Object>} Created variable group
   */
  async variableGroupCreate(name, variables = {}) {
    const varsString = Object.entries(variables)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    return new Promise((resolve, reject) => {
      this.execute(
        `pipelines variable-group create --name ${name} --variables ${varsString}`,
        (error, stdout) => {
          if (error) {
            return reject(error);
          }

          try {
            const vg = JSON.parse(stdout);
            resolve(vg);
          } catch (parseError) {
            reject(new Error(`Failed to parse variable group: ${parseError.message}`));
          }
        }
      );
    });
  }

  /**
   * Deletes a variable group
   *
   * @async
   * @param {number} id - Variable group ID
   * @returns {Promise<void>}
   */
  async variableGroupDelete(id) {
    return new Promise((resolve, reject) => {
      this.execute(`pipelines variable-group delete --id ${id} --yes`, (error, stdout) => {
        if (error) {
          return reject(new Error(`Failed to delete variable group: ${error.message}`));
        }

        resolve();
      });
    });
  }

  /**
   * Lists all service connections
   *
   * @async
   * @returns {Promise<Array>} Array of service connections
   */
  async serviceEndpointList() {
    return new Promise((resolve, reject) => {
      this.execute('pipelines service-endpoint list', (error, stdout) => {
        if (error) {
          return reject(error);
        }

        try {
          const endpoints = JSON.parse(stdout);
          resolve(endpoints);
        } catch (parseError) {
          reject(new Error(`Failed to parse service endpoints: ${parseError.message}`));
        }
      });
    });
  }

  /**
   * Lists all pipelines in the project
   *
   * @async
   * @param {Object} [options={}] - Filter options
   * @param {string} [options.name] - Filter by name (substring match)
   * @returns {Promise<Array>} Array of pipelines
   */
  async pipelineList(options = {}) {
    let command = 'pipelines list';

    if (options.name) {
      command += ` --name ${options.name}`;
    }

    return new Promise((resolve, reject) => {
      this.execute(command, (error, stdout) => {
        if (error) {
          return reject(error);
        }

        try {
          const pipelines = JSON.parse(stdout);
          resolve(pipelines);
        } catch (parseError) {
          reject(new Error(`Failed to parse pipelines: ${parseError.message}`));
        }
      });
    });
  }

  /**
   * Builds a full Azure CLI command with organization and project
   *
   * @param {string} command - Command to execute
   * @returns {string} Full command with organization and project
   * @private
   */
  _buildCommand(command) {
    return `az ${command} --organization ${this.organization} --project ${this.project}`;
  }
}

module.exports = AzureDevOpsCliWrapper;
