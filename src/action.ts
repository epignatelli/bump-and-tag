import * as core from '@actions/core';
import { gte, inc, parse, ReleaseType, SemVer, valid } from 'semver';
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { generateNotes } from '@semantic-release/release-notes-generator';
import {
  getBranchFromRef,
  isPr,
  getCommits,
  getLatestPrereleaseTag,
  getLatestTag,
  getValidTags,
  mapCustomReleaseRules,
  mergeWithDefaultChangelogRules,
} from './utils';
import { createTag } from './github';
import { Await } from './ts';

export default async function main() {
  // collect inputs
  const dryRun = core.getInput('dry_run');
  const shouldFetchAllTags = core.getInput('fetch_all_tags');
  const commitSha = core.getInput('commit_sha');
  const prerelease = core.getInput('prerelease');
  const { GITHUB_REF, GITHUB_SHA } = process.env;
  if (!GITHUB_REF) {
    core.setFailed('Missing GITHUB_REF.');
    return;
  }
  const commitRef = commitSha || GITHUB_SHA;
  if (!commitRef) {
    core.setFailed('Missing commit_sha or GITHUB_SHA.');
    return;
  }
  const currentBranch = getBranchFromRef(GITHUB_REF);


  // retrieve latest tag
  const validTags = await getValidTags(
    "",
    /true/i.test(shouldFetchAllTags)
  );
  const latestTag = getLatestTag(validTags, prefixRegex, tagPrefix);
  let previousTag: ReturnType<typeof getLatestTag> = latestTag;
  if (!previousTag) {
    core.setFailed('Could not find previous tag.');
    return;
  }

  // parse latest version from latest tag
  let previousVersion: SemVer = parse(previousTag.name.replace(prefixRegex, ''));
  if (!previousVersion) {
    core.setFailed('Could not parse previous tag into semantic version.');
    return;
  }
  core.info(
    `Previous tag was ${previousTag.name}, previous version was ${previousVersion.version}.`
  );

  // calculate new version number
  let commits = await getCommits(previousTag.commit.sha, commitRef);
  let bump = await analyzeCommits(
    {
      releaseRules: mappedReleaseRules
        ? // analyzeCommits doesn't appreciate rules with a section /shrug
        mappedReleaseRules.map(({ section, ...rest }) => ({ ...rest }))
        : undefined,
    },
    { commits, logger: { log: console.info.bind(console) } }
  );
  const releaseType: ReleaseType = isPrerelease
    ? `pre${bump}`
    : bump || defaultBump;
  const identifier = currentBranch.replace(/[^a-zA-Z0-9-]/g, '-');
  const newVersion = inc(previousVersion, releaseType, identifier);
  if (!newVersion) {
    core.setFailed('Could not increment version.');
    return;
  }
  if (!valid(newVersion)) {
    core.setFailed(`${newVersion} is not a valid semver.`);
    return;
  }
  core.info(`New version is ${newVersion}.`);

  // calculate changelog
  const changelog = await generateNotes(
    {
      preset: 'conventionalcommits',
      presetConfig: {
        types: mergeWithDefaultChangelogRules(mappedReleaseRules),
      },
    },
    {
      commits,
      logger: { log: console.info.bind(console) },
      options: {
        repositoryUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`,
      },
      lastRelease: { gitTag: latestTag.name },
      nextRelease: { gitTag: newTag, version: newVersion },
    }
  );
  core.info(`Changelog is ${changelog}.`);

  // set outputs
  core.setOutput('release_type', releaseType);
  core.setOutput('previous_version', previousVersion.version);
  core.setOutput('new_version', newVersion);
  core.setOutput('changelog', changelog);

  // push tag
  if (/true/i.test(dryRun)) {
    core.info('Dry run: not performing tag action.');
    return;
  }
  if (validTags.map((tag) => tag.name).includes(newTag)) {
    core.info('This tag already exists. Skipping the tag creation.');
    return;
  }
  await createTag(newTag, createAnnotatedTag, commitRef);
}
