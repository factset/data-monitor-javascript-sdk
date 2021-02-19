#! bash
set -euxo pipefail

yarn build
yarn webpack
zip -r data-monitor-client-sdk.zip dist/lib-browser dist/lib-modules package.json
