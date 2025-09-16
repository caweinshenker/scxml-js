/**
 * SCXML Expression Parser for XState Conversion
 *
 * Handles parsing and converting SCXML ECMAScript expressions to XState-compatible functions
 */

export interface ParsedExpression {
  type: 'guard' | 'assign' | 'log';
  source: string;
  variables: string[];
  xstateFunction: Function;
}

export class SCXMLExpressionParser {

  /**
   * Parse a guard condition expression
   */
  parseGuard(expression: string): Function {
    const variables = this.extractVariables(expression);
    const contextualizedExpr = this.contextualizeExpression(expression, variables);

    return new Function('context', 'event', `
      try {
        ${variables.map(v => `const ${v} = context.${v};`).join('\n        ')}
        return ${contextualizedExpr};
      } catch (error) {
        console.warn('Guard evaluation error:', error, 'Expression:', '${expression}');
        return false;
      }
    `);
  }

  /**
   * Parse an assignment expression
   */
  parseAssignment(location: string, expression?: string): Function {
    if (!expression) {
      return () => ({ [location]: null });
    }

    const variables = this.extractVariables(expression);
    const contextualizedExpr = this.contextualizeExpression(expression, variables);

    return new Function('context', 'event', `
      try {
        ${variables.map(v => `const ${v} = context.${v};`).join('\n        ')}
        const result = ${contextualizedExpr};
        return { ${location}: result };
      } catch (error) {
        console.warn('Assignment evaluation error:', error, 'Expression:', '${expression}');
        return { ${location}: context.${location} };
      }
    `);
  }

  /**
   * Parse a log expression
   */
  parseLogExpression(expression?: string, label?: string): Function {
    if (!expression && !label) {
      return () => '';
    }

    if (!expression) {
      return () => label || '';
    }

    const variables = this.extractVariables(expression);
    const contextualizedExpr = this.contextualizeExpression(expression, variables);

    // Safely escape the expression for use in the generated function
    const safeExpression = expression.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
    const safeLabel = label ? label.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"') : '';

    return new Function('context', 'event', `
      try {
        ${variables.map(v => `const ${v} = context.${v};`).join('\n        ')}
        const result = ${contextualizedExpr};
        return ${label ? `"${safeLabel}: " + ` : ''}result;
      } catch (error) {
        console.warn('Log expression evaluation error:', error, 'Expression:', "${safeExpression}");
        return "${safeLabel || 'Log error'}";
      }
    `);
  }

  /**
   * Extract variable names from an expression
   */
  private extractVariables(expression: string): string[] {
    // Simple regex to find identifiers that look like variable names
    // This is a basic implementation - could be enhanced with proper AST parsing
    const variableRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    const matches = [...expression.matchAll(variableRegex)];
    const variables = matches.map(match => match[1]);

    // Filter out JavaScript keywords and operators
    const keywords = new Set([
      'true', 'false', 'null', 'undefined', 'typeof', 'instanceof',
      'return', 'function', 'var', 'let', 'const', 'if', 'else',
      'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
      'try', 'catch', 'finally', 'throw', 'new', 'this'
    ]);

    return [...new Set(variables.filter(v => !keywords.has(v)))];
  }

  /**
   * Convert SCXML expression to use context variables
   */
  private contextualizeExpression(expression: string, variables: string[]): string {
    let result = expression;

    // Sort by length descending to avoid partial replacements
    const sortedVariables = variables.sort((a, b) => b.length - a.length);

    for (const variable of sortedVariables) {
      // Replace variable references, but be careful not to replace parts of other identifiers
      const regex = new RegExp(`\\b${variable}\\b`, 'g');
      result = result.replace(regex, variable);
    }

    return result;
  }

  /**
   * Check if an expression is safe to evaluate
   */
  isSafeExpression(expression: string): boolean {
    // Basic safety checks - could be enhanced
    const unsafePatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout|setInterval/,
      /import\s*\(/,
      /require\s*\(/,
      /process\./,
      /global\./,
      /window\./,
      /document\./
    ];

    return !unsafePatterns.some(pattern => pattern.test(expression));
  }

  /**
   * Convert SCXML data model expressions
   */
  parseDataExpression(expression: string): any {
    if (!expression) return null;

    // Try to parse as JSON first
    try {
      return JSON.parse(expression);
    } catch {
      // If not JSON, try to evaluate as a simple expression
      try {
        // Very basic evaluation - only for numbers and simple expressions
        if (/^\d+(\.\d+)?$/.test(expression.trim())) {
          return Number(expression);
        }
        if (/^['"`].*['"`]$/.test(expression.trim())) {
          return expression.slice(1, -1);
        }
        return expression;
      } catch {
        return expression;
      }
    }
  }
}