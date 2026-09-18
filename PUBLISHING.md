# Workbench SDK publishing handoff
Prepared September 18, 2026. Release to publish: **2.0.1**.

The API hardening release is deployed and merged. Both SDKs, release notes, and publishing workflows are on GitHub. No files from Aidan's Mac are needed. Registry publication is pending the existing owner's authorization. This handoff covers SDK publishing, not a claim that all API product gaps are resolved.

## 1. Authorize GitHub once
Sign into npm as the existing package owner (listed maintainer: `jamesworkbenchcrm`) and PyPI as the existing project owner (listed maintainer: `Justice2x`).

For npm, open [@workbenchcrm/sdk](https://www.npmjs.com/package/@workbenchcrm/sdk), then Settings > Trusted Publisher > GitHub Actions. For PyPI, open [workbench-sdk publishing settings](https://pypi.org/manage/project/workbench-sdk/settings/publishing/) and add a GitHub publisher to the **existing** project.

| Field | npm | PyPI |
|---|---|---|
| GitHub owner / organization | KoalityCRM | KoalityCRM |
| Repository | workbench-sdk-node | workbench-sdk-python |
| Workflow filename | publish.yml | publish.yml |
| Environment | npm | pypi |

Enter only `publish.yml`, not its folder path. On npm, allow direct publishing with `npm publish` if the setup asks which actions to allow. Save both configurations and complete any 2FA prompts. No registry tokens or shared passwords are needed. The GitHub environments already exist and allow deployment only from main.

## 2. Publish from GitHub
Open each link below, select **Run workflow**, choose **main**, keep version **2.0.1**, check **Publish to ... after verification**, then run:
- [Node SDK publishing workflow](https://github.com/KoalityCRM/workbench-sdk-node/actions/workflows/publish.yml)
- [Python SDK publishing workflow](https://github.com/KoalityCRM/workbench-sdk-python/actions/workflows/publish.yml)

The workflows test, type-check, build, and publish the verified packages. Leaving the publish checkbox unchecked only builds downloadable artifacts. They do not publish on ordinary pushes. Registry owner setup and GitHub write access are both required; the registry owner can authorize the connection and let Aidan run it.

Confirm the publish job is green and **2.0.1** appears on [npm](https://www.npmjs.com/package/@workbenchcrm/sdk?activeTab=versions) and [PyPI](https://pypi.org/project/workbench-sdk/2.0.1/). If authentication fails, compare all four trusted-publisher fields exactly. If 2.0.1 already exists, verify that release instead of changing versions just to retry.

## 3. Give Aidan ongoing access
Aidan's GitHub account `aidandc25` already has admin access to both SDK repositories. GitHub access does not automatically grant npm or PyPI access.

Ask Aidan for his personal **npm username** and **PyPI username**. If he has no accounts, he should register at [npm](https://www.npmjs.com/signup) and [PyPI](https://pypi.org/account/register/), verify his email, and enable 2FA. Do not assume these usernames match his GitHub name.

- **npm:** invite his npm username to the `workbenchcrm` organization. Add him to a team with **read/write** access to `@workbenchcrm/sdk`. If the scope is personally owned rather than an organization, add him as a package maintainer instead. This grants publishing access; organization ownership is a separate decision.
- **PyPI:** open [project collaborators](https://pypi.org/manage/project/workbench-sdk/collaboration/), invite his PyPI username as **Owner** so he can publish and manage the trusted publisher and collaborators. Keep the existing owner.
- Aidan accepts the invitations and confirms he can manage the packages. Do not email passwords, API tokens, or recovery codes.

## GitHub files and downloads
- [Node source and release notes](https://github.com/KoalityCRM/workbench-sdk-node)
- [Python source and release notes](https://github.com/KoalityCRM/workbench-sdk-python)
- [Node handoff downloads](https://github.com/KoalityCRM/workbench-sdk-node/releases/tag/sdk-handoff-20260918)
- [Python handoff downloads](https://github.com/KoalityCRM/workbench-sdk-python/releases/tag/sdk-handoff-20260918)
- [API hardening PR](https://github.com/KoalityCRM/workbench-api/pull/6)

The handoff downloads are GitHub prereleases containing packages and this guide; they do not mean the packages are already on npm or PyPI. For 1.x users, review each repository's README and INVOICE_WRITES.md before upgrading to 2.x.

References: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [PyPI trusted publishing](https://docs.pypi.org/trusted-publishers/adding-a-publisher/), [npm team access](https://docs.npmjs.com/managing-team-access-to-organization-packages/), [PyPI project roles](https://pypi.org/help/#project-role).
