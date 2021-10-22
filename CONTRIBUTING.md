# Contributing

```sh
# Install deps
npm install

# Compile the plugin
npm run compile

# Or compile the plugin every time a file is saved
npm run compile-watch
```

In VS Code press F5 from within the project to open an instance of VS Code
with the local version of the extension loaded.

## Publishing a new version of the extension

### VS Code marketplace

```shell
npx vsce package
# now drag and drop the package file into the web GUI
```

<https://code.visualstudio.com/api/working-with-extensions/publishing-extension>

<https://marketplace.visualstudio.com/manage/publishers/gleam>

### Open VSX

```shell
npx ovsx publish --pat $TOKEN
```

You can get a token here, assuming you don't have one saved already. https://open-vsx.org/user-settings/tokens
