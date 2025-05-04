const Core = require('@actions/core');

/**
 * Appends approval metadata to a given body string.
 *
 * @param {string} body - The original issue body or comment content.
 * @param {string[]} [approvers=[]] - Optional array of GitHub usernames to mention as approvers.
 * @returns {string} - The body string with appended metadata section.
 */
function appendMetadata(body, approvers = []) {
  const metadataLines = [];

  if (approvers.length > 0) {
    metadataLines.push(`__Approvers:__ ${approvers.map(a => `@${a}`).join(' ')}`);
  }
  metadataLines.push(`__Minimum Approvals:__ ${Core.getInput('minimumApprovals')}`);
  metadataLines.push(`__Approval Words:__ ${Core.getInput('approveWords')}`);
  metadataLines.push(`__Rejection Words:__ ${Core.getInput('rejectWords')}`);

  return `${body}

${metadataLines.join('\n')}`;
}

module.exports = {
  appendMetadata
};
