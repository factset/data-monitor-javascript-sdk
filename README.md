# Data Monitor Javascript SDK

This package is the browser based javascript SDK for the FactSet Data Monitor API.

Data Monitor is an SDK that provides access to the same, trusted, information available within FactSet's Workstation and Web offerings. Our Javascript SDK enables you to receive market data, fundamentals, and other financial data on a streaming or point in time frequency.

An overview of the SDK is available on the [FactSet Developer Portal](https://developer.factset.com/api-catalog/data-monitor-api)


## Installation

yarn:
`yarn add data-monitor-javascript-sdk`

npm:
`npm install data-monitor-javascript-sdk`


## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md)


## Example
```js
import {init, on} from 'data-monitor-javascript-sdk';

let subscriptionCollection;

const myCompanyIdpid = 'asda34-asd123-asdasd123';
subscribe(['FDS-USA', 'AAPL-USA', 'VOD-LON'], ['COMPANY_NAME', 'LAST_PRICE', 'LAST_TIME', 'LAST_DATE']);

async function subscribe(symbols, fields) {
  // initialize the sdk
  await init({idpid: myCompanyIdpid});
  if (subscriptionCollection) {
    cancel();
  }

  // make data subscriptions
  subscriptionCollection = on({
    symbols,
    fields,
    options: {
      britishCurrencyInPence: true,
      currency: 'LOCAL',
      timezone: 'America/Los_Angeles'
    },
    success: (message, subscription) => {
      console.log(message, subscription);
    }
  });
}

// pause/resume realtime data updates based on page visibility
document.addEventListener('visibilitychange', isVisible => {
  if (!subscriptionCollection) return;

  if (isVisible) {
    subscriptionCollection.resume();
  } else {
    subscriptionCollection.pause();
  }
});

function updateCurrency(newOutputCurrencyISO = 'USD') {
  if (subscriptionCollection) {
    subscriptionCollection.update({currency: newOutputCurrencyISO});
  }
}

function cancel() {
  if (subscriptionCollection) {
    subscriptionCollection.cancel();
    subscriptionCollection = null;
  }
}
```
