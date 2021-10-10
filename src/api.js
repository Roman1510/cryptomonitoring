const currenciesHandlers = new Map();

const loadCurrencyData = (api_key) => {
  if (currenciesHandlers.size === 0) {
    return;
  }

  fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...currenciesHandlers.keys()].join(",")}&tsyms=EUR&api_key=${api_key}`)
    .then(r => r.json())
    .then(rawData => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => {
          return [key, value.EUR];
        })
      );
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = currenciesHandlers.get(currency) ?? [];
        handlers.forEach(fn => fn(newPrice));
      });
    });
};
//to get the list of crypto pairs from the API?
//to constantly get the updates of costs of crypto pairs from the API

export const subscribeToCurrency = (currency, cb) => {
  const subscribers = currenciesHandlers.get(currency) || [];
  currenciesHandlers.set(currency, [...subscribers, cb]);
};

export const unsubscribeFromCurrency = currency => {

  currenciesHandlers.delete(currency)
};

setInterval(loadCurrencyData, 5000);

window.tickers = currenciesHandlers;