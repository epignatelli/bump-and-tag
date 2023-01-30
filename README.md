This is a maintaned, stripped-down fork of [mathieudutour/github-tag-action](https://github.com/mathieudutour/github-tag-action), which [doesn't have too much time on it anymore, unfortunately](https://github.com/mathieudutour/github-tag-action/issues/115#issuecomment-1408191606)


# Bump-n-tag (✊n🏷️)

Bump-n-tag (✊n🏷️) uses [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/#summary) messages to infer the next [semantic versioning](https://semver.org/)-formatted version number.

This is a stripped down version of [mathieudutour/github-tag-action](https://github.com/mathieudutour/github-tag-action):
- No prefixes,
- No suffixes,
- No bump type override, only inference from the commit history
- No commit convention override
- Only annotates tags


## Example

```yaml
name: Bump version
on:
  push:
    branches:
      - master
jobs:
  Bump-Tag-and-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Bump and tag
        id: tag_version
        uses: mathieudutour/github-tag-action@v6.1
      - name: Release
        uses: ncipollo/release-action@v1
        with:
          tag: ${{ steps.tag_version.outputs.new_tag }}
          name: Release ${{ steps.tag_version.outputs.new_tag }}
          body: ${{ steps.tag_version.outputs.changelog }}
```

---
## API

### 📥 Inputs
All inputs are optional.
- github_token _(optional)_ - GitHub token for permission to tag the repo (default: `${{github.token}}`).
- commit_sha _(optional)_ - The commit SHA value to add the tag. If specified, it uses this value instead GITHUB_SHA. It could be useful when a previous step merged a branch into github.ref.

- release_branches _(optional)_ - Comma separated list of branches (JavaScript regular expression accepted) that will generate the release tags. Other branches and pull-requests generate versions postfixed with the commit hash and do not generate any repository tag. Examples: `master` or `.*` or `release.*,hotfix.*,master`... (default: `master,main`).
- pre_release_branches _(optional)_ - Comma separated list of branches (JavaScript regular expression accepted) that will generate the pre-release tags.

- fetch_all_tags _(optional)_ - By default, this action fetch the last 100 tags from Github. Sometimes, this is not enough and using this action will fetch all tags recursively (default: `false`).

- default_bump _(optional)_ - Which type of bump to use when [none is explicitly provided](#bumping) when commiting to a release branch (default: `patch`). You can also set `false` to avoid generating a new tag when none is explicitly provided. Can be `patch, minor or major`.
- default_prerelease_bump _(optional)_ - Which type of bump to use when [none is explicitly provided](#bumping) when commiting to a prerelease branch (default: `prerelease`). You can also set `false` to avoid generating a new tag when none is explicitly provided. Can be `prerelease, prepatch, preminor or premajor`.


### 📤 Outputs

- **new_tag** - The value of the newly calculated tag. Note that if there hasn't been any new commit, this will be `undefined`.
- **new_version** - The value of the newly created tag without the prefix. Note that if there hasn't been any new commit, this will be `undefined`.
- **previous_tag** - The value of the previous tag (or `v0.0.0` if none). Note that if `custom_tag` is set, this will be `undefined`.
- **previous_version** - The value of the previous tag (or `0.0.0` if none) without the prefix. Note that if `custom_tag` is set, this will be `undefined`.
- **release_type** - The computed release type (`major`, `minor`, `patch` or `custom` - can be prefixed with `pre`).
- **changelog** - The [conventional changelog](https://github.com/conventional-changelog/conventional-changelog) since the previous tag.

## Credits

[anothrNick/github-tag-action](https://github.com/anothrNick/github-tag-action) - a similar action using a Dockerfile (hence not working on macOS)
