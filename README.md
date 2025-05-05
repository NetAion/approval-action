# Approval V1.1

This action uses repository issues to create manual approvals for workflow runs.

## Inputs

| Name               | Description                                                             | Required | Default                        |
| ------------------ | ----------------------------------------------------------------------- | -------- | ------------------------------ |
| `token`            | A GitHub token with repo scope.                                         | true     |                                |
| `approvers`        | A comma separated list of GitHub usernames that are allowed to approve. | true     |                                |
| `issueTitle`       | The title of the issue to create.                                       | true if `approvalType: 'issue'`. Ignored if `approvalType: 'pr'`|          |
| `issueBody`        | The body of the issue to create, or the comment body if posting to an existing PR. | true |                         |
| `approvalType`     | The type of approval process. Can be either (newly created) `issue` or (re-use existing) `pr`. | false | `issue`    |
| `issueLabels`      | A comma separated list of labels to add to the issue or PR.             | false    |                                |
| `excludeInitiator` | Exclude the workflow initiator from the list of approvers.              | false    | false                          |
| `approveWords`     | A comma separated list of case-insensitive words that will be used to approve. | false | approve, approved          |
| `rejectWords`      | A comma separated list of case-insensitive words that will be used to reject. | false | deny, denied, reject, rejected |
| `waitInterval`     | The number of minutes to wait between checks for approvals.             | false    | 1                              |
| `waitTimeout`      | The number of minutes to wait before timing out.                        | false    | 360                            |
| `minimumApprovals` | The number of approvals/rejections required to continue the workflow.   | false    | 1                              |

## Outputs

| Name     | Description                        | Type    |
| -------- | ---------------------------------- | ------- |
| approved | Whether the workflow was approved. | boolean |

## Runs

This action is a JavaScript action and runs on Ubuntu, macOS, and Windows.

## Usage

Two types of gated approval process are supported.

### 1. Create a new issue to approve or deny the workflow

```yaml
- uses: ekeel/approval-action@v1.1.0
  with:
    # A GitHub token with repo scope.
    # The default secrets.GITHUB_TOKEN does not work with octokit to open/update/close issues.
    token: ${{ secrets.GH_PAT }}

    # A comma separated list of GitHub usernames that are allowed to approve.
    # Example: 'ekeel,octocat'
    approvers: 'ekeel'

    # The number of approvals/rejections required to continue the workflow.
    minimumApprovals: '1'

    # The title of the issue to create.
    issueTitle: 'Test issue title'

    # The body of the issue to create.
    issueBody: 'Test issue body'

    # A comma separated list of labels to add to the issue.
    issueLabels: 'ManualApproval,ApprovalAction'

    # Exclude the workflow initiator from the list of approvers.
    excludeInitiator: 'false'

    # A comma separated list of words that will be used to approve.
    approveWords: 'approve, approved'

    # A comma separated list of words that will be used to reject.
    rejectWords: 'deny, denied, reject, rejected'

    # The number of minutes to wait between checks for approvals.
    waitInterval: '1'

    # The number of minutes to wait before timing out.
    waitTimeout: '5'
```

>Note: The issue is closed when the workflow is approved or denied.

### 2. Post comments to an existing PR to approve or deny the workflow

Select with input `approvalType: 'pr'`. The workflow context must also be a PR, i.e., the action has been fired by a pull-request-related event.

```yaml
- uses: ekeel/approval-action@v1.1.0
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    approvers: 'ekeel'
    issueBody: |
      #### Waiting for Approval 

      This branch is protected by a manual approval step. Please approve or deny this workflow before the changes can be merged and deployed to production.
    approvalType: 'pr'
    waitTimeout: '60'
```

>Note: the PR remains open until merged if the workflow is approved. The PR is closed if the workflow is denied.
