const mdToAdf = jest.fn((markdown: string) => ({
  version: 1,
  type: 'doc',
  content: []
}));

export default mdToAdf;
