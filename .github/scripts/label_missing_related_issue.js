const {
  PR_ACTION,
  PR_AUTHOR,
  PR_BODY,
  PR_NUMBER,
  IGNORE_AUTHORS,
  BLOCK_LABEL,
  BLOCK_REASON_LABEL
} = require("./constants")

module.exports = async ({github, context, core}) => {
    core.debug(`Number: ${PR_BODY}`);
    core.debug(`Action: ${PR_ACTION}`);
    core.debug(`Author: ${PR_AUTHOR}`);
    core.debug(`Body: ${PR_BODY}`);

    if (IGNORE_AUTHORS.includes(PR_AUTHOR)) {
      return core.notice("Author in IGNORE_AUTHORS list; skipping...")
    }

    if (PR_ACTION != "opened") {
      return core.notice("Only newly open PRs are labelled to avoid spam; skipping")
    }

    const RELATED_ISSUE_REGEX = /Issue number:[^\d\r\n]+(?<issue>\d+)/;
    const isMatch = RELATED_ISSUE_REGEX.exec(PR_BODY);
    if (isMatch == null) {
        core.info(`No related issue found, maybe the author didn't use the template but there is one.`)

        let msg = "No related issues found. Please ensure there is an open issue related to this change to avoid significant delays or closure.";
        await github.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          body: msg,
          issue_number: PR_NUMBER,
        });

        return await github.rest.issues.addLabels({
          issue_number: PR_NUMBER,
          owner: context.repo.owner,
          repo: context.repo.repo,
          labels: [BLOCK_LABEL, BLOCK_REASON_LABEL]
        })
    }
}
