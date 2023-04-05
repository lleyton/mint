# Running CLI Locally

Note - contributing requires `yarn` and it's recommended you install it as a global installation. If you don't have yarn installed already run `npm install --global yarn` in your terminal.

Run `npm run local` to build and install the CLI locally.

You need to run the command after every change you want to test.

## Updating Version of Mint Client

The CLI uses GitHub releases to download specific versions of the client code used in `mintlify dev`. Older CLI versions will continue using the client code they were bundled with. Users need to update to a newer version of the CLI to get the newest client code. CLI contributors bump the client version used by the CLI whenever there are major changes.

Here's how to publish new client changes to the CLI:

1. Publish a new GitHub release. You can click the releases menu at the right of the repo page. Make the release title the same as the new release tag. Optionally, you can also use the description to keep track of what changed in that release.
2. Set `TARGET_MINT_VERSION` in `src/constants.ts` to to the new release tag.
3. Publish a new CLI version to npm.
