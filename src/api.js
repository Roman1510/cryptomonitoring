export const loadCurrencyData = (api_key, coinsList) => {
  const f = fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsList.join(",")}&tsyms=EUR&api_key=${api_key}`)
    .then(r => r.json())
    .then(rawData =>
      Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => {
          return  [key, value.EUR]
        })
      )
    );
  return f;
};
