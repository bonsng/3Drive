First, run `git diff origin/main...HEAD` to identify the exact changes in this PR.
Review only those changes. Do not comment on unrelated code.

Focus on:

- Reusability: Are there opportunities to extract shared logic or reduce duplication?
- Efficiency: Can any logic be simplified or optimized?
- Performance: Are there potential bottlenecks, unnecessary re-renders, or memory leaks?
- Correctness: Are there logic errors, unhandled edge cases, or off-by-one mistakes?

Be concise. Skip trivial style nits.
Always respond in Korean.

After completing your review, you MUST post your findings as a PR comment using the GitHub API.
Use `gh pr comment` to leave your review summary on the PR.
