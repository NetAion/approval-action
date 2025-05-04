const Core = require('@actions/core');
const Github = require('@actions/github');
const { waitForApproval } = require('./waitForApproval');
const { openIssue } = require('./openIssue');
const { postComment } = require('./postComment');

(async () => {
    try {
        const token = Core.getInput('token');
        const minimumApprovals = Core.getInput('minimumApprovals');
        const issueTitle = Core.getInput('issueTitle');
        const issueBody = Core.getInput('issueBody');
        const excludeInitiator = Core.getInput('excludeInitiator');
        const waitInterval = Core.getInput('waitInterval');
        const waitTimeout = Core.getInput('waitTimeout');

        const approversInput = Core.getInput('approvers');
        const issueLabelsInput = Core.getInput('issueLabels');
        const approveWordsInput = Core.getInput('approveWords');
        const rejectWordsInput = Core.getInput('rejectWords');

        const approvers = approversInput.split(',').map(approver => approver.trim());
        const issueLabels = issueLabelsInput.split(',').map(label => label.trim());
        const approveWords = approveWordsInput.split(',').map(word => word.trim());
        const rejectWords = rejectWordsInput.split(',').map(word => word.trim());

        const context = Github.context;
        const repoContext = Github.context.repo;
        const owner = repoContext.owner;
        const repo = repoConte
        
        const prNumber = context.payload.pull_request?.number;
        let issue;
        let shouldClose = false;

        Core.debug(`Issue title: ${issueTitle}`);
        Core.debug(`Issue body: ${issueBody}`);
        Core.debug(`Approvers: ${approvers}`);
        Core.debug(`Issue labels: ${issueLabels}`);
        Core.debug(`Minimum approvals: ${minimumApprovals}`);
        Core.debug(`Exclude initiator: ${excludeInitiator}`);
        Core.debug(`Approve words: ${approveWords}`);
        Core.debug(`Reject words: ${rejectWords}`);
        Core.debug(`Owner: ${owner}`);
        Core.debug(`Repo: ${repo}`);

        Core.debug('Getting octokit');
        const octokit = Github.getOctokit(token);
        Core.debug('Got octokit');

        Core.debug(`Event name: ${context.eventName}`);
        Core.debug(`Payload keys: ${Object.keys(context.payload).join(',')}`);
        Core.debug(`PR object: ${JSON.stringify(context.payload.pull_request, null, 2)}`);

        if (prNumber) {
            Core.debug(`Detected PR number: ${prNumber}`);
            context.issue = { ...context.repo, number: prNumber };
            Core.debug(`Posting comment on existing issue ${context.issue.number}`);
            issue = await postComment(octokit, context, issueBody, issueLabels, approvers);
            Core.debug('Posted comment');
            // because this was a pre-existing issue, we do *not* close it at the end
            shouldClose = false;
        } else {
            // only open a new issue when explicitly invoked without a PR context
            if (!Core.getInput('issueTitle')) {
                throw new Error('issueTitle input is required when not commenting on a PR');
            }
            
            Core.debug('No PR number detected, creating issue instead');
            issue = await openIssue(octokit, context, issueTitle, issueBody, issueLabels, approvers);
            Core.debug('Created issue');
            // we opened the issue ourselves, so closing later makes sense
            shouldClose = true;
        }

        Core.debug('Waiting for issue approval');
        const approved = await waitForApproval(octokit, owner, repo, issue.data.number, approvers, approveWords, rejectWords, minimumApprovals, waitInterval, waitTimeout, shouldClose);
        Core.debug('Issue review completed');

        if (approved) {
            Core.debug('Issue approved')
            Core.setOutput('approved', 'true');
        } else {
            Core.debug('Issue not approved')
            Core.setOutput('approved', 'false');
        }
    } catch (error) {
        Core.error(error);
        Core.error(error.stack);
        Core.setFailed(error.message);
    }
})();
