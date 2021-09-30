export const loadCurrencyData = (api_key, coinsList) => {
  const f = fetch(`https://min-api.cryptocompare.com/data/price?fsym=EUR&tsyms=${coinsList.join(",")}&api_key=${api_key}`)
    .then(r => r.json())
    .then(rawData =>
      Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, 1 / value])
      )
    );
  return f;
};
