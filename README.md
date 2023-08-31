## Webstudio CLI

Moved to [main repo](https://github.com/webstudio-is/webstudio)

Webstudio CLI lets you download data from a Webstudio instance onto your file system. Webstudio SDK will automatically use it.

## Installation

Add CLI to your project locally by running `yarn add --dev @webstudio-is/cli` or globally by running `npm i -g @webstudio-is/cli`

Now you can run `wstd --help` to show the manual.

## Sync

Run `wstd sync <project id> --host <instance url>` to fetch the data. Project id is visible in the URL of the project in the designer. Instance URL depends on where you host the designer. Example: `wstd sync 62154aaef0cb12345ccf85d6e --host https://my-webstudio-instance.vercel.app`

When you sync, the script will download the data into `.webstudio` folder in your project root. Now you can use the SDK to render components, see [webstudio landing](https://github.com/webstudio-is/webstudio-landing) as an example.
