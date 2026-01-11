declare module 'md-to-adf' {
  /**
   * Convert Markdown to Atlassian Document Format (ADF)
   * @param markdown - GitHub Flavored Markdown text
   * @returns ADF document object
   */
  function mdToAdf(markdown: string): {
    version: number;
    type: string;
    content: any[];
  };

  export = mdToAdf;
}
