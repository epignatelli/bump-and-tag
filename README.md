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

- `github_token`: GitHub token to push the tag. Default is `${{github.token}}`.
- `commit_sha`: The commit SHA value to tag. Default is `GITHUB_SHA`.
- `fetch_all_tags`: By default, this action fetch the last 100 tags from Github. Sometimes, this is not enough and using this action will fetch all tags recursively (default: `false`).


### 📤 Outputs

- `new_tag`: The value of the newly calculated tag. Note that if there hasn't been any new commit, this will be `undefined`.
- `new_version`: The value of the newly created tag without the prefix. Note that if there hasn't been any new commit, this will be `undefined`.
- `previous_tag`: The value of the previous tag (or `v0.0.0` if none). Note that if `custom_tag` is set, this will be `undefined`.
- `previous_version`: The value of the previous tag (or `0.0.0` if none) without the prefix. Note that if `custom_tag` is set, this will be `undefined`.
- `release_type`: The computed release type (`major`, `minor`, `patch` or `custom` - can be prefixed with `pre`).
- `changelog`: The [conventional changelog](https://github.com/conventional-changelog/conventional-changelog) since the previous tag.

## Credits

[anothrNick/github-tag-action](https://github.com/anothrNick/github-tag-action) - a similar action using a Dockerfile (hence not working on macOS)
