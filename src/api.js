const currenciesHandlers = new Map();

export const loadCurrencyData = (api_key, coinsList) =>
  fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsList.join(",")}&tsyms=EUR&api_key=${api_key}`)
    .then(r => r.json())
    .then(rawData =>
      Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => {
          return [key, value.EUR];
        })
      )
    );
//to get the list of crypto pairs from the API?
//to constantly get the updates of costs of crypto pairs from the API

export const subscribeToCurrency = (currency, cb) => {
  const subscribers = currenciesHandlers.get(currency) || []
  currenciesHandlers.set(currency, [...subscribers, cb])
};

export const unsubscribeFromCurrency = (currency, cb) => {
  const subscribers = currenciesHandlers.get(currency) || []
  currenciesHandlers.set(currency, subscribers.filter(fn=>fn!==cb))
};