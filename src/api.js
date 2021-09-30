export const loadCurrencyData = (api_key, name) => {
  const f = fetch(`https://min-api.cryptocompare.com/data/price?fsym=EUR&tsyms=${name}&api_key=${api_key}`).then(r => r.json());
  return f;
};