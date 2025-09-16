/**
 * SCXML Module Resolver
 *
 * Handles loading and resolving external SCXML references, scripts, and data sources
 */

import { promises as fs } from 'fs';
import { resolve, dirname, isAbsolute } from 'path';
import { SCXMLParser } from './parser';
import { SCXMLDocument } from './types';

export interface ResolverOptions {
  basePath?: string;
  maxDepth?: number;
  allowedProtocols?: string[];
  cache?: boolean;
}

export interface ResolvedContent {
  type: 'scxml' | 'script' | 'data' | 'json' | 'text';
  content: any;
  source: string;
  resolved: boolean;
}

export class SCXMLModuleResolver {
  private cache = new Map<string, ResolvedContent>();
  private depth = 0;
  private parser: SCXMLParser;

  constructor(
    private options: ResolverOptions = {}
  ) {
    this.options = {
      maxDepth: 10,
      allowedProtocols: ['file', 'http', 'https'],
      cache: true,
      ...options
    };
    this.parser = new SCXMLParser();
  }

  /**
   * Resolve an external reference
   */
  async resolve(src: string, currentPath?: string): Promise<ResolvedContent> {
    if (this.depth >= this.options.maxDepth!) {
      throw new Error(`Maximum resolution depth (${this.options.maxDepth}) exceeded`);
    }

    const resolvedPath = this.resolvePath(src, currentPath);

    // Check cache
    if (this.options.cache && this.cache.has(resolvedPath)) {
      return this.cache.get(resolvedPath)!;
    }

    this.depth++;
    try {
      const result = await this.loadContent(resolvedPath, src);

      if (this.options.cache) {
        this.cache.set(resolvedPath, result);
      }

      return result;
    } finally {
      this.depth--;
    }
  }

  /**
   * Resolve an SCXML document reference
   */
  async resolveScxml(src: string, currentPath?: string): Promise<SCXMLDocument> {
    const content = await this.resolve(src, currentPath);

    if (content.type !== 'scxml') {
      throw new Error(`Expected SCXML document but got ${content.type}: ${src}`);
    }

    return content.content as SCXMLDocument;
  }

  /**
   * Resolve a script reference
   */
  async resolveScript(src: string, currentPath?: string): Promise<string> {
    const content = await this.resolve(src, currentPath);

    if (content.type !== 'script' && content.type !== 'text') {
      throw new Error(`Expected script content but got ${content.type}: ${src}`);
    }

    return content.content as string;
  }

  /**
   * Resolve a data reference
   */
  async resolveData(src: string, currentPath?: string): Promise<any> {
    const content = await this.resolve(src, currentPath);
    return content.content;
  }

  /**
   * Resolve path relative to current file or base path
   */
  private resolvePath(src: string, currentPath?: string): string {
    // Handle absolute paths and URLs
    if (isAbsolute(src) || src.includes('://')) {
      return src;
    }

    // Resolve relative to current file or base path
    const basePath = currentPath ? dirname(currentPath) : (this.options.basePath || process.cwd());
    return resolve(basePath, src);
  }

  /**
   * Load content from a resolved path
   */
  private async loadContent(resolvedPath: string, originalSrc: string): Promise<ResolvedContent> {
    // Handle file protocol or local files
    if (resolvedPath.startsWith('file://') || !resolvedPath.includes('://')) {
      return this.loadFileContent(resolvedPath, originalSrc);
    }

    // Handle HTTP/HTTPS (would need additional implementation)
    if (resolvedPath.startsWith('http://') || resolvedPath.startsWith('https://')) {
      throw new Error('HTTP/HTTPS loading not implemented yet');
    }

    throw new Error(`Unsupported protocol in: ${resolvedPath}`);
  }

  /**
   * Load content from local file system
   */
  private async loadFileContent(path: string, originalSrc: string): Promise<ResolvedContent> {
    const cleanPath = path.replace('file://', '');

    try {
      const content = await fs.readFile(cleanPath, 'utf-8');
      const type = this.detectContentType(originalSrc, content);

      let parsedContent: any = content;

      if (type === 'scxml') {
        // Parse SCXML recursively with this resolver
        const originalResolver = this.parser.getResolver?.();
        this.parser.setResolver?.(this);
        try {
          parsedContent = this.parser.parse(content, cleanPath);
        } finally {
          if (originalResolver) {
            this.parser.setResolver?.(originalResolver);
          }
        }
      } else if (type === 'json' || type === 'data') {
        try {
          parsedContent = JSON.parse(content);
        } catch {
          // If JSON parsing fails, treat as text
          parsedContent = content;
        }
      }

      return {
        type,
        content: parsedContent,
        source: cleanPath,
        resolved: true
      };
    } catch (error) {
      throw new Error(`Failed to load ${originalSrc}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect content type from file extension and content
   */
  private detectContentType(src: string, content: string): ResolvedContent['type'] {
    const ext = src.toLowerCase().split('.').pop() || '';

    // Check file extension
    if (ext === 'scxml' || ext === 'xml') {
      if (content.includes('<scxml')) {
        return 'scxml';
      }
    }

    if (ext === 'js' || ext === 'javascript') {
      return 'script';
    }

    if (ext === 'json') {
      return 'json';
    }

    // Check content patterns
    if (content.trim().startsWith('<scxml')) {
      return 'scxml';
    }

    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      return 'json';
    }

    return 'text';
  }

  /**
   * Clear the resolution cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}