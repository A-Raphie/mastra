import { describe, expect, it } from 'vitest';
import { ToolSearchProcessor } from './tool-search';
import { createTool } from '../../tools';
import { z } from 'zod';

/**
 * Regression test for the multi-id query ranking failure: a query naming
 * several tool ids verbatim (`create_github_comment update_github_comment
 * review-task`) dropped the hyphenated id from the top-K entirely, because
 * the exact-match boost compared single tokens against full ids, repeated
 * query tokens doubled their BM25 weight, and only topK*2 candidates ever
 * reached the boost step.
 */
describe('ToolSearchProcessor verbatim multi-id queries', () => {
  const ids = [
    'create_github_comment',
    'update_github_comment',
    'review-task',
    'github_issue_write',
    'jira_add_comment',
    'jira_update_comment',
    'list_pull_requests',
    'create_branch',
    'merge_pull_request',
    'get_file_contents',
    'push_files',
    'search_code',
    'list_issues',
    'create_issue',
    // Comment/github-dense competitors mirroring the production catalog that
    // drowned the hyphenated tool before the fix.
    'github_pr_review_reply',
    'github_check_run_summary',
    'comment_thread_resolve',
    'comment_reaction_add',
    'github_gist_comment',
    'issue_comment_cleanup',
  ];

  const toolSearch = new ToolSearchProcessor({
    tools: Object.fromEntries(
      ids.map(id => [
        id,
        createTool({
          id,
          description: `Tool ${id.replace(/[_-]/g, ' ')}`,
          inputSchema: z.object({}),
          execute: async () => ({ ok: true }),
        }),
      ]),
    ),
    search: { topK: 5, minScore: 0 },
  });

  it('returns a hyphenated tool named verbatim in a multi-id query', async () => {
    const catalog = (toolSearch as any).catalogForStep({});
    const results = await (toolSearch as any).searchTools(
      catalog,
      'create_github_comment update_github_comment review-task',
    );

    const names = results.map((r: { name: string }) => r.name);
    // The query names review-task verbatim: it must make the top-K even
    // though comment/github-heavy competitors match more query tokens.
    expect(names).toContain('review-task');
  });

  it('still ranks an exact single-token match first', async () => {
    const catalog = (toolSearch as any).catalogForStep({});
    const results = await (toolSearch as any).searchTools(catalog, 'review-task');

    expect(results[0]?.name).toBe('review-task');
  });
});
