<p align="center">
  <img width="320" height="320" src="./.github/pantheon-logo.png">
</p>

## Description
Pantheon is an open source app to manage open source meetups and conferences.

<p align="center">
  <img width="324" height="578" src="./.github/pantheon.gif">
</p>


## Run locally

### Setup React Native
If you do not have set up React Native on your computer, make sure to follow the instructions on the official [Getting Started guide](https://facebook.github.io/react-native/docs/getting-started.html) for building projects with native code.

### Run the Pantheon server
Follow the instructions to run the server, available on this [repository](https://github.com/jaburcodes/pantheon-server).

### Run the app
#### Install dependencies
```bash
yarn install
```

#### Setup the Relay Environment
The file [src/createRelayEnvironment.js](src/createRelayEnvironment.js) creates a Relay Environment and a Network instance that configures Relay with a function to fetch queries from the remote server.

To run the `relay-compiler`, run
```bash
yarn relay
```

or

```bash
yarn relay --watch
```
to watch for changes.

#### Run on iOS
Open a terminal window and run:
```bash
react-native run-ios
```

#### Run on Android
```bash
react-native run-android
```

#### Run tests
```bash
yarn test
```
