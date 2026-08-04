# Insight UI

A Bitcoin blockchain explorer web application service for [Bitcore Node](https://github.com/bitpay/bitcore-node) using the [Insight API](https://github.com/piratenetwork/insight-api-pirate).

## Quick Start

Please see the guide at [https://bitcore.io/guides/full-node](https://bitcore.io/guides/full-node) for information about getting a block explorer running. This is only the front-end component of the block explorer, and is packaged together with all of the necessary components in [Bitcore](https://github.com/bitpay/bitcore).

## Getting Started

To manually install all of the necessary components, you can run these commands:

```bash
npm install -g bitcore-node
bitcore-node create mynode
cd mynode
bitcore-node install insight-api
bitcore-node install insight-ui
bitcore-node start
```

Open a web browser to `http://localhost:3001/insight/`

## Development

Insight UI is a React app built with [Vite](https://vitejs.dev). Install dependencies:

```
$ npm install
```

Run the dev server (proxies `/api` and `/socket.io` to a bitcore-node-pirate instance on `localhost:3001` - see `vite.config.js`):

```
$ npm run dev
```

Build for production (bitcore-node-pirate's InsightUI service serves the resulting `dist/` directory):

```
$ npm run build
```

Run the test suite ([Vitest](https://vitest.dev) + React Testing Library):

```
$ npm test
```

## Multilanguage support

Insight UI uses [react-i18next](https://react.i18next.com) for multilanguage support. `src/locales/*.json` holds one flat key -> translated-string JSON file per language (English strings are used directly as keys via `useTranslation()`'s `t()`, with no separate `en.json`). To add or update a translation, edit the relevant language's JSON file directly - there's no separate compile step.


## Note

For more details about the [Insight API](https://github.com/piratenetwork/insight-api-pirate) configuration and end-points, go to [Insight API GitHub repository](https://github.com/piratenetworkinsight-api-pirate).

## Contribute

Contributions and suggestions are welcomed at the [Insight UI GitHub repository](https://github.com/piratenetwork/insight-ui-pirate).


## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
