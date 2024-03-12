# @arduino/react-icons

@arduino/react-icons is a library to import and use [arduino icons](https://zeroheight.com/59f8e25cb/p/07e4d9-iconography/b/9209b0) as react components

All icons inherit the color of the text whenever it was black in the original icon.

## Installation and usage

Include in your project with npm or yarn

    $ npm install @arduino/react-icons --save

And import and use the component

    import { IconAccountActivity, IconWarning } from '@arduino/react-icons';

    function Welcome(props) {
        return <h1>Hello, {props.name} <IconAccountActivity></h1>;
    }

## Development

Under the hoods this library is automatically generated. The script `scripts/generate-icons.js` does the following things:

1. retrieves informations from Figma, using the `FIGMA_ICON_FILE_ID` and `FIGMA_API_ACCESS_TOKEN` environment variables
2. downloads all icons in svg format
3. transforms them using [svgr](https://react-svgr.com/) in react components
4. constructs an index.ts to export them all

### Update the icons

Whenever you need to update the icons and release a new version of the library, follow these steps

1. Grab the `FIGMA_ICON_FILE_ID` from Figma (at the moment the id is `7mUivQVGz0ONtdYnZPa5Ld`. It can easily be extracted from the share URL of the Figma file.)
2. Grab the `FIGMA_API_ACCESS_TOKEN` from figma (Settings > Personal Access Tokens)
3. Make sure the `node_modules` is updated

    npm ci

4. Export the environment variables

    export FIGMA_API_ACCESS_TOKEN=xxxxxx && export FIGMA_ICON_FILE_ID=7mUivQVGz0ONtdYnZPa5Ld

5. Run the script

    npm run gen

## Credits

[Sebastian Hunkeler](https://github.com/sbhklr) had the idea and wrote the scripts/generate-icons.js to retrieve the icons from figma
