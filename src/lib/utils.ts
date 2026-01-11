import chalk from 'chalk';
import { fromADF } from 'mdast-util-from-adf';
import { toMarkdown } from 'mdast-util-to-markdown';

/**
 * Validate required environment variables
 */
export function validateEnvVars(): void {
  const required = [
    'JIRA_HOST',
    'JIRA_USER_EMAIL',
    'JIRA_API_TOKEN',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(chalk.red('✗ Missing required environment variables:\n'));
    missing.forEach((key) => console.error(chalk.red(`  - ${key}`)));
    console.log('\nPlease create a .env file with the following variables:');
    console.log('  JIRA_HOST=https://your-domain.atlassian.net');
    console.log('  JIRA_USER_EMAIL=your-email@example.com');
    console.log('  JIRA_API_TOKEN=your-api-token');
    console.log('\nGet your API token from: https://id.atlassian.com/manage-profile/security/api-tokens');
    process.exit(1);
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Convert Atlassian Document Format (ADF) to Markdown
 * Handles both string content and ADF JSON objects
 */
export function convertADFToMarkdown(content: any): string {
  // If content is already a string, return it as-is
  if (typeof content === 'string') {
    return content;
  }

  // If content is null or undefined, return empty string
  if (!content) {
    return '';
  }

  try {
    // Convert ADF to mdast, then mdast to markdown
    const mdastTree = fromADF(content);
    const markdown = toMarkdown(mdastTree);
    return markdown.trim();
  } catch (error) {
    // If conversion fails, fall back to JSON string representation
    console.error('Failed to convert ADF to Markdown:', error);
    return JSON.stringify(content, null, 2);
  }
}
