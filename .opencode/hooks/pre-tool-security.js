/**
 * OpenCode Security Layer - Pre-Tool Hook
 *
 * Enforces security policies before tool execution:
 * - Prompt injection prevention
 * - Input sanitization and validation
 * - Anomaly detection
 * - Rate limiting and throttling
 */

const fs = require('fs');
const path = require('path');

// Security patterns for prompt injection detection
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?instructions/i,
  /disregard\s+(all\s+)?(previous\s+)?instructions/i,
  /forget\s+(all\s+)?(previous\s+)?instructions/i,
  /override\s+(all\s+)?(security\s+)?protocols/i,
  /bypass\s+(security\s+)?measures/i,
  /execute\s+(malicious\s+)?command/i,
  /system\s*(\(|\{)/i,
  /\$\\(.*\)/,  // Shell command injection
  /`.*`/,       // Backtick command injection
  /;\s*(rm|curl|wget|nc|netcat)\s/i,
  /\|?\s*(curl|wget|nc)\s+.*\|?\s*sh/i,
  /(eval|exec)\s*\(/i,
  /(from\s+subprocess\s+import|import\s+os)/i,
  /__import__\(/i,
  /getattr\s*\(\s*__builtins__/i
];

// Anomaly detection thresholds
const ANOMALY_THRESHOLDS = {
  maxInputLength: 10000,
  maxNestingDepth: 10,
  maxRepetitionScore: 0.7,
  maxSpecialCharRatio: 0.5
};

// Rate limiting state
const rateLimitState = new Map();

/**
 * Detect prompt injection attempts in tool arguments
 *
 * @param {Object} toolArgs - Tool arguments to check
 * @returns {Object} Detection result
 */
function detectPromptInjection(toolArgs) {
  const argsString = JSON.stringify(toolArgs);
  
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(argsString)) {
      return {
        detected: true,
        pattern: pattern.toString(),
        severity: 'high',
        message: 'Potential prompt injection detected'
      };
    }
  }
  
  return { detected: false };
}

/**
 * Detect anomalous input patterns
 *
 * @param {Object} toolArgs - Tool arguments to check
 * @returns {Object} Anomaly detection result
 */
function detectAnomalies(toolArgs) {
  const argsString = JSON.stringify(toolArgs);
  const anomalies = [];
  
  // Check input length
  if (argsString.length > ANOMALY_THRESHOLDS.maxInputLength) {
    anomalies.push({
      type: 'excessive_length',
      severity: 'medium',
      message: `Input length (${argsString.length}) exceeds threshold (${ANOMALY_THRESHOLDS.maxInputLength})`
    });
  }
  
  // Check for excessive repetition
  const repetitionScore = calculateRepetitionScore(argsString);
  if (repetitionScore > ANOMALY_THRESHOLDS.maxRepetitionScore) {
    anomalies.push({
      type: 'excessive_repetition',
      severity: 'low',
      message: `Repetition score (${repetitionScore.toFixed(2)}) exceeds threshold`
    });
  }
  
  // Check for special character ratio (potential obfuscation)
  const specialCharRatio = calculateSpecialCharRatio(argsString);
  if (specialCharRatio > ANOMALY_THRESHOLDS.maxSpecialCharRatio) {
    anomalies.push({
      type: 'excessive_special_chars',
      severity: 'medium',
      message: `Special character ratio (${specialCharRatio.toFixed(2)}) exceeds threshold`
    });
  }
  
  return {
    detected: anomalies.length > 0,
    anomalies
  };
}

/**
 * Calculate repetition score in input
 * Higher score = more repetitive patterns
 *
 * @param {string} input - Input string
 * @returns {number} Repetition score (0-1)
 */
function calculateRepetitionScore(input) {
  if (input.length < 10) return 0;
  
  const chunks = input.match(/(.{1,10})/g) || [];
  const uniqueChunks = new Set(chunks);
  
  return 1 - (uniqueChunks.size / chunks.length);
}

/**
 * Calculate special character ratio
 *
 * @param {string} input - Input string
 * @returns {number} Special character ratio (0-1)
 */
function calculateSpecialCharRatio(input) {
  if (input.length === 0) return 0;
  
  const specialChars = input.match(/[^a-zA-Z0-9\s]/g) || [];
  return specialChars.length / input.length;
}

/**
 * Check rate limits for tool invocation
 *
 * @param {string} toolName - Name of the tool
 * @returns {Object} Rate limit check result
 */
function checkRateLimit(toolName) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = 100; // Max 100 requests per minute per tool
  
  if (!rateLimitState.has(toolName)) {
    rateLimitState.set(toolName, []);
  }
  
  const requests = rateLimitState.get(toolName);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < windowMs);
  rateLimitState.set(toolName, validRequests);
  
  if (validRequests.length >= maxRequests) {
    return {
      limited: true,
      message: `Rate limit exceeded for ${toolName} (${validRequests.length}/${maxRequests} per minute)`,
      retryAfter: Math.ceil((windowMs - (now - validRequests[0])) / 1000)
    };
  }
  
  // Add current request
  validRequests.push(now);
  
  return { limited: false };
}

/**
 * Sanitize input by removing dangerous patterns
 *
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
}

/**
 * Main security check function
 * Called before each tool invocation
 *
 * @param {string} toolName - Name of the tool being invoked
 * @param {Object} toolArgs - Arguments passed to the tool
 * @returns {Object} Security check result
 */
function preToolSecurityCheck(toolName, toolArgs) {
  const result = {
    allowed: true,
    warnings: [],
    errors: []
  };
  
  // Sanitize input
  try {
    toolArgs = JSON.parse(JSON.stringify(toolArgs, (key, value) => {
      return typeof value === 'string' ? sanitizeInput(value) : value;
    }));
  } catch (error) {
    result.errors.push(`Input sanitization failed: ${error.message}`);
  }
  
  // Check for prompt injection
  const injectionResult = detectPromptInjection(toolArgs);
  if (injectionResult.detected) {
    result.allowed = false;
    result.errors.push(`Security violation: ${injectionResult.message}`);
    result.errors.push(`Pattern matched: ${injectionResult.pattern}`);
  }
  
  // Check for anomalies
  const anomalyResult = detectAnomalies(toolArgs);
  if (anomalyResult.detected) {
    anomalyResult.anomalies.forEach(anomaly => {
      if (anomaly.severity === 'high' || anomaly.severity === 'medium') {
        result.allowed = false;
        result.errors.push(anomaly.message);
      } else {
        result.warnings.push(anomaly.message);
      }
    });
  }
  
  // Check rate limits
  const rateLimitResult = checkRateLimit(toolName);
  if (rateLimitResult.limited) {
    result.allowed = false;
    result.errors.push(rateLimitResult.message);
    result.retryAfter = rateLimitResult.retryAfter;
  }
  
  return result;
}

/**
 * Hook entry point
 * Export for use as a pre-tool hook
 *
 * @param {string} toolName - Tool being invoked
 * @param {Object} toolArgs - Tool arguments
 * @throws {Error} If security check fails
 */
function hook(toolName, toolArgs) {
  const result = preToolSecurityCheck(toolName, toolArgs);
  
  if (!result.allowed) {
    const errorMsg = [
      '🔒 Security Violation Detected',
      '═══════════════════════════',
      '',
      `Tool: ${toolName}`,
      '',
      'Errors:',
      ...result.errors.map(e => `  ❌ ${e}`),
      '',
    ];
    
    if (result.warnings.length > 0) {
      errorMsg.push('Warnings:');
      errorMsg.push(...result.warnings.map(w => `  ⚠️  ${w}`));
      errorMsg.push('');
    }
    
    errorMsg.push('This invocation has been blocked for security reasons.');
    errorMsg.push('If this is a legitimate use case, please contact support.');
    
    throw new Error(errorMsg.join('\n'));
  }
  
  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Security Warnings:');
    result.warnings.forEach(w => console.warn(`   ${w}`));
    console.log('');
  }
  
  return { toolName, toolArgs };
}

// Export for module use
module.exports = {
  preToolSecurityCheck,
  detectPromptInjection,
  detectAnomalies,
  checkRateLimit,
  sanitizeInput,
  hook
};

// Allow execution as standalone script
if (require.main === module) {
  const toolName = process.argv[2] || 'test-tool';
  const testArgs = {
    input: 'test input',
    command: 'echo "hello"'
  };
  
  console.log(`Testing security check for: ${toolName}`);
  console.log('Input:', testArgs);
  console.log('');
  
  try {
    const result = hook(toolName, testArgs);
    console.log('✅ Security check passed');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Security check failed');
    console.error(error.message);
  }
}
