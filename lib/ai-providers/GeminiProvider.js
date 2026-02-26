/**
 * GeminiProvider - Google Gemini API Integration
 *
 * Extends AbstractAIProvider to provide Gemini-specific AI capabilities
 * with full backward compatibility for existing code.
 *
 * @extends AbstractAIProvider
 */

const { GoogleGenAI } = require('@google/genai');
const AbstractAIProvider = require('./AbstractAIProvider');
const AIProviderError = require('../errors/AIProviderError');

class GeminiProvider extends AbstractAIProvider {
  constructor(config = {}) {
    if (typeof config === 'string') {
      config = { apiKey: config };
    }

    super(config);

    if (!this.apiKey) {
      throw new Error(
        'API key is required for GeminiProvider. ' +
        'Provide it via constructor or set GEMINI_API_KEY environment variable.'
      );
    }

    this.client = new GoogleGenAI({ apiKey: this.apiKey });
  }

  getDefaultModel() {
    return 'gemini-2.5-flash';
  }

  getApiKeyEnvVar() {
    return 'GEMINI_API_KEY';
  }

  async complete(prompt, options = {}) {
    return this._withRateLimit(async () => {
      const finalOptions = this._mergeOptions(options);

      try {
        const response = await this.client.models.generateContent({
          model: finalOptions.model,
          contents: prompt,
          config: {
            maxOutputTokens: finalOptions.maxTokens,
            temperature: finalOptions.temperature,
          }
        });

        return response.text || '';
      } catch (error) {
        throw this.formatError(error);
      }
    });
  }

  async *stream(prompt, options = {}) {
    if (this.rateLimiter) {
      await this.rateLimiter.removeTokens(1);
    }

    const finalOptions = this._mergeOptions(options);

    try {
      const stream = await this.client.models.generateContentStream({
        model: finalOptions.model,
        contents: prompt,
        config: {
          maxOutputTokens: finalOptions.maxTokens,
          temperature: finalOptions.temperature,
        }
      });

      for await (const chunk of stream) {
        yield chunk.text;
      }
    } catch (error) {
      throw this.formatError(error);
    }
  }

  supportsStreaming() {
    return true;
  }

  supportsFunctionCalling() {
    return true;
  }

  supportsChat() {
    return true;
  }

  supportsVision() {
    return true;
  }

  formatError(error) {
    if (error instanceof AIProviderError) {
      return error;
    }

    if (error.status) {
      switch (error.status) {
        case 401:
        case 403:
          return new AIProviderError(
            AIProviderError.INVALID_API_KEY,
            'Invalid Google API key or authentication failed',
            true,
            error.status
          );
        case 429:
          return new AIProviderError(
            AIProviderError.RATE_LIMIT,
            'Gemini API rate limit exceeded. Please retry after a delay.',
            true,
            429
          );
        case 500:
        case 502:
        case 503:
        case 504:
          return new AIProviderError(
            AIProviderError.SERVICE_UNAVAILABLE,
            `Gemini API service temporarily unavailable (${error.status})`,
            true,
            error.status
          );
        case 400:
          return new AIProviderError(
            AIProviderError.INVALID_REQUEST,
            error.message || 'Invalid request parameters',
            true,
            400
          );
        default:
          return new AIProviderError(
            'UNKNOWN_ERROR',
            `Gemini API error (${error.status}): ${error.message}`,
            true,
            error.status
          );
      }
    }

    return super.formatError(error);
  }

  async chat(messages, options = {}) {
    return this._withRateLimit(async () => {
      const finalOptions = this._mergeOptions(options);

      try {
        const geminiMessages = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const response = await this.client.models.generateContent({
          model: finalOptions.model,
          contents: geminiMessages,
          config: {
            maxOutputTokens: finalOptions.maxTokens,
            temperature: finalOptions.temperature,
          }
        });

        return response.text || '';
      } catch (error) {
        throw this.formatError(error);
      }
    });
  }

  async generate(prompt, options = {}) {
    return await this.complete(prompt, options);
  }

  getModel() {
    return this.getDefaultModel();
  }
}

module.exports = GeminiProvider;
