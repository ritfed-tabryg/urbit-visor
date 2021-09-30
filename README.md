<h1 align="center">
  <img src="assets/visor-logo.png" width="224px"/><br/>
  Urbit Visor
</h1>
<p align="center">Urbit Visor is an extension which <b>transforms your web browser</b> into a <b>first class Urbit client</b>. Its goal is to allow existing web tech to seamlessly integrate together with the novel functionality of Urbit. </p>

<p align="center"><img src="https://img.shields.io/badge/version-v0.1.0-blue?style=for-the-badge&logo=none" />&nbsp;&nbsp;<img src="https://img.shields.io/badge/license-mit-blue?style=for-the-badge&logo=none" alt="license" /></p>

## Getting Started

The fastest way to get started using Urbit Visor is by installing it via the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions?hl=en).

This will provide you with a seamless install process and allow you to get up and running instantly.

## Compile It Yourself

To get started first clone this repo:

```
$ git clone https://github.com/dcSpark/urbit-visor
```

Once you have done that simply use `npm` to compile it yourself:

```
$ cd urbit-visor
$ npm install
$ npm start
```

This will install all of the dependencies and build the extension. Now that the project has been built, you can add the extension to your Chrome browser via the following steps:

1. Open Chrome.
2. Navigate to `chrome://extensions`.
3. Enable _Developer mode_.
4. Click _Load unpacked_.
5. Select the `dist` directory which has been created through the compilation process.

## ⚙️ Urbit Visor API

After a user installs the Urbit Visor extension into their web browser, the Urbit Visor API is injected into each web page that they visit. This allows the website (or other extensions) to interact with Urbit Visor and thereby perform actions on the user's Urbit ship.

Below you will find the API which the current version of Urbit Visor supports. If a given method requires permission, this means that the user must grant the website permission to have access to use this method. If this authorization has not yet been given, Urbit Visor will automatically ask the user to authorize said permission upon attempt to use said method.

| Method                  | Description                                                                  | Requires Permission | Input                                                                     | Returns                      |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------- | -----                                                                     | ---------                    |
| `isConnected`           | Returns whether or not the user actively has an Urbit ship connected.        | No                  | `()`                                                                      | `boolean`                    |
| `getShip`               | Returns the user's ship @p.                                                  | Yes                 | `()`                                                                      | `string`                     |
| `getURL`                | Returns the user's ship URL.                                                 | Yes                 | `()`                                                                      | `string`                     |
| `scry`                  | Issues a scry on the user's ship and returns the result.                     | Yes                 | `({app: string, path: string})`                                           | `any`                        |
| `poke`                  | Issues a poke on the user's ship and returns the result.                     | Yes                 | `({app: string, mark: string, json: object})`                             | `number` (request id)        |
| `thread`                | Runs a spider thread on the user's ship and returns the result.              | Yes                 | `({threadName: string, inputMark: string, outputMark: string, body: any})`| `any`                        |
| `subscribe`             | Subscribes to a gall app.                                                    | Yes                 | `({app: gall-app, path: /path})`                                          | `number` (request id)        |
| `unsubscribe`           | Unsubscribes from a gall app.                                                | Yes                 | `({app: gall-app, path: /path})`                                          | `number` (request id)        |
| `requestPermissions`    | Requests permissions from a given URL to Urbit Visor.                        | No                  | `Array<Permission>`                                                       | `void`                       |
| `authorizedPermissions` | Returns the permissions that the user has authorized for the current domain. | No                  | `()`                                                                      | `Array<Permission>`          |
| `on`                    | Adds an event listener for a subscription to Urbit Visor Events.             | No                  | `(eventType: string, keys: Array<string>, callback: Function)`            | `Subscription`               |
| `off`                   | Removes an event listener set up by `on()`.                                  | No                  | `Subscription` (returned by `.on()`)                                      | undefined                    |

The `.on()` method is most complicated. `eventType` is an `UrbitVisorEventType`, which you can see defined in `types.ts`. The second argument, an array of string, is the keys of the expected data structure sent by your urbit.
e.g., if your urbit sends you a chat message, `{"graph-update": {"add-nodes": {"resource", resource, "nodes": {"post": post, "children: []}}} you can add a listener to the exact key you need by passing an array of keys, such as ["graph-update", "add-nodes"], which will then be sent as the sole argument to the callback you pass as third argument of the `.on` function.
If you want the whole data structure you can just pass an empty array.

## FAQ

#### What does the "Your ship needs an OS update" error mean?

This typically happens when you have spawned a brand new comet which has not gone through any OTA updates and as such is running on an old version that makes it incompatible with Urbit Visor. Simply OTA via one of Tlon's stars using the following command in dojo:

```
|ota ~marzod %kids
```

## Credit

Urbit Visor was designed and built by [dcSpark](https://dcspark.io) from scratch and was made possible thanks to the [Urbit Foundation Grant Program](https://urbit.org/grants).
