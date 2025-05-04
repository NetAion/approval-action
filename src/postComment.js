const Core = require('@actions/core');
const { appendMetadata } = require('./appendMetadata');

/**
 * Posts a comment on an issue for approval, tagging approvers and adding labels.
 *
 * @param {import('@octokit/rest').Octokit} octokit - The Octokit instance for API calls.
 * @param {Object} context - The GitHub Actions context object.
 * @param {string} issueBody - The body content for the comment.
 * @param {string[]} issueLabels - Labels to add to the issue.
 * @param {string[]} approvers - GitHub usernames (without @) to mention as approvers.
 * @returns {Promise<import('@octokit/rest').OctokitResponse>} - The API response for the issue.
 */
async function postComment(octokit, context, issueBody, issueLabels = [], approvers = []) {
  const { owner, repo } = context.repo;
  const issueNumber   = context.issue.number;

  try {
    // Build the full comment body with metadata
    const bodyWithMetadata = appendMetadata(issueBody, approvers);

    // Post the comment
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: bodyWithMetadata
    });

    // Add labels if provided
    if (issueLabels.length > 0) {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: issueNumber,
        labels: issueLabels
      });
    }

    // Retrieve and return the updated issue
    const response = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber
    });

    return response;
  } catch (error) {
    Core.error(error);
    Core.error(error.stack);
    Core.setFailed('Failed to create an issue comment.');
    throw error;
  }
}

module.exports = {
  postComment
};