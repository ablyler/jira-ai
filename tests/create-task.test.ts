import { createTaskCommand } from '../src/commands/create-task';
import * as jiraClient from '../src/lib/jira-client';

// Mock dependencies
jest.mock('../src/lib/jira-client');
jest.mock('../src/lib/utils');
jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis()
  }));
});

const mockJiraClient = jiraClient as jest.Mocked<typeof jiraClient>;

describe('Create Task Command', () => {
  const mockOptions = {
    title: 'Test Task Title',
    project: 'TEST',
    issueType: 'Task',
  };

  const mockResponse = {
    key: 'TEST-123',
    id: '10001',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();

    // Setup default mock
    mockJiraClient.createIssue = jest.fn().mockResolvedValue(mockResponse);
  });

  it('should successfully create a task', async () => {
    await createTaskCommand(mockOptions);

    expect(mockJiraClient.createIssue).toHaveBeenCalledWith(
      'TEST',
      'Test Task Title',
      'Task',
      undefined
    );
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('TEST-123'));
  });

  it('should create a task with parent issue', async () => {
    const optionsWithParent = {
      ...mockOptions,
      parent: 'TEST-100',
    };

    await createTaskCommand(optionsWithParent);

    expect(mockJiraClient.createIssue).toHaveBeenCalledWith(
      'TEST',
      'Test Task Title',
      'Task',
      'TEST-100'
    );
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Parent: TEST-100'));
  });

  it('should exit with error when title is empty', async () => {
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit');
    });

    await expect(
      createTaskCommand({ ...mockOptions, title: '' })
    ).rejects.toThrow('Process exit');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Title is required')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);

    processExitSpy.mockRestore();
  });

  it('should exit with error when project is empty', async () => {
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit');
    });

    await expect(
      createTaskCommand({ ...mockOptions, project: '' })
    ).rejects.toThrow('Process exit');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Project is required')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);

    processExitSpy.mockRestore();
  });

  it('should exit with error when issue type is empty', async () => {
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit');
    });

    await expect(
      createTaskCommand({ ...mockOptions, issueType: '' })
    ).rejects.toThrow('Process exit');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Issue type is required')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);

    processExitSpy.mockRestore();
  });

  it('should exit with error and hint when project not found', async () => {
    const apiError = new Error('Project does not exist');
    mockJiraClient.createIssue = jest.fn().mockRejectedValue(apiError);
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit');
    });

    await expect(createTaskCommand(mockOptions)).rejects.toThrow('Process exit');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Project does not exist')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Check that the project key is correct')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);

    processExitSpy.mockRestore();
  });

  it('should exit with error and hint when issue type is invalid', async () => {
    const apiError = new Error('Invalid issue type specified');
    mockJiraClient.createIssue = jest.fn().mockRejectedValue(apiError);
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit');
    });

    await expect(createTaskCommand(mockOptions)).rejects.toThrow('Process exit');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid issue type specified')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Check that the issue type is correct')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);

    processExitSpy.mockRestore();
  });

  it('should exit with error and hint when parent issue is invalid', async () => {
    const apiError = new Error('Parent issue not found');
    mockJiraClient.createIssue = jest.fn().mockRejectedValue(apiError);
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit');
    });

    await expect(
      createTaskCommand({ ...mockOptions, parent: 'TEST-999' })
    ).rejects.toThrow('Process exit');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Parent issue not found')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Check that the parent issue key is correct')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);

    processExitSpy.mockRestore();
  });

  it('should exit with error and hint when permission denied (403)', async () => {
    const apiError = new Error('Permission denied (403)');
    mockJiraClient.createIssue = jest.fn().mockRejectedValue(apiError);
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit');
    });

    await expect(createTaskCommand(mockOptions)).rejects.toThrow('Process exit');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Permission denied (403)')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('You may not have permission to create issues')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);

    processExitSpy.mockRestore();
  });
});
