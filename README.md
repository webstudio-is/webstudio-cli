## Webstudio CLI

Webstudio CLI lets you interract with your Webstudio instance (or our cloud) from the command line.

## Running your site locally

1. Login `./bin/cli.js -l`
   You need to make a shared link with build options. You can do this in the Webstudio UI:
  ![image](https://github.com/webstudio-is/webstudio-cli/assets/5845193/3249e7d0-4996-4819-984e-5aeb37f81dd6)

2. Download by projectId `./bin/cli.js -d 0a17f55a-54d9-4790-8a28-64a178819f71`
3. Build `./bin/cli.js -b`

   Optionally select the build type with `-t`
5. Serve `./bin/cli.js -s`

Or in one command: `./bin/cli.js -bsd 0a17f55a-54d9-4790-8a28-64a178819f71`
