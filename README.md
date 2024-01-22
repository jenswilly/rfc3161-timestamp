# RFC3161 Timestamp

This package implements functions for _timestamping_ data.

The [RFC 3161 Time-Stamp Protocol](https://www.ietf.org/rfc/rfc3161.txt) is used to have a "trusted server" append a timestamp and create a cryptograhic digest of the entire contents.

Basically, this a like getting a [notary public](https://en.wikipedia.org/wiki/Notary_public) to verify that the contents were as claimed at a specific point in time and it is possible to verify the contents and timestamp.

This does require that the server used is a "trusted" server. There are several publicly available timestamping servers. Most well-known "certificate companies" provide timestamping servers. Do a search for [List of RFC3161 servers](https://www.google.com/search?q=list+of+rfc3161+servers).

## Installation

```bash
echo "@jenswilly:registry=https://npm.pkg.github.com/" >> .npmrc
npm install @jenswilly/rfc3161-timestamp
```

## Use

```typescript
import { timestampPlaintext } from "./rfc3161-timestamp";

const plainText = "This is the content to timestamp";
timestampReply = await timestampPlaintext("http://timestamp.digicert.com", plainText, true);
```

### Note: Use of jsrsasign

This project uses [jsrsasign](https://github.com/kjur/jsrsasign) crypto library rather than e.g. `react-native-quick-crypto` because
it's the only one I've found that implements the required "trusted timestamp" functions.

...

## Using Github package registry

Docs:

-   <https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry>
-   <https://dev.to/dalenguyen/create-your-first-github-package-564f>

### Registry info

Add the following to the `.npmrc` file:

```
@jenswilly:registry=https://npm.pkg.github.com/
```

### Authentication

It is only required to authenticate in order to publish new versions. The package is public.

A "Personal Access Token (classic)" is required. So go to Profile icon → Settings → Developer Settings → Personal access tokens and create a new token.  
Enable the `write:packages` permission (others will automatically be added).

Authenticate to package registry: `npm login --registry=https://npm.pkg.github.com` and use the token as password

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
npm config set @jenswilly:registry=https://npm.pkg.github.com/
npm add @jenswilly/rfc3161-timestamp
```
