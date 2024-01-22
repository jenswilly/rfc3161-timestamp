# RFC3161 Timestamp

### Use of jsrsasign

This project uses [jsrsasign] crypto library rather than e.g. `react-native-quick-crypto` because
it's the only one I've found that implements the required "trusted timestamp" functions.

...

## Private Github repo package

Docs:

-   <https://docs.gitlab.com/ee/user/packages/npm_registry/>
-   <https://itnext.io/step-by-step-building-and-publishing-an-npm-typescript-package-44fe7164964c>

Authenticate to package registry:  
`npm config set -- //gitlab.shortcut.io/api/v4/projects/344/packages/npm/:_authToken=<token>`

## Pushing a new version

```
npm run release:<level>
```

With `level` being one of:

-   `patch`
-   `minor`
-   `major`

Make sure that all changes have been commited before publishing a new version

## Using package in project

```
npm config set -- //gitlab.shortcut.io/:_authToken=<TOKEN>
npm config set @shortcut:registry=https://gitlab.shortcut.io/api/v4/projects/344/packages/npm/
npm add @shortcut/rfc3161-timestamp
```
