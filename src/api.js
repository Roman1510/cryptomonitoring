export const loadCurrencyData = (api_key, name) => {
  const f = fetch(`https://min-api.cryptocompare.com/data/price?fsym=${name}&tsyms=EUR&api_key=${api_key}`).then(r => r.json());
  return f;
};