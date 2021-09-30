export const loadCurrencyData = (api_key, coinsList) => {
  const f = fetch(`https://min-api.cryptocompare.com/data/price?fsym=EUR&tsyms=${coinsList.join(",")}&api_key=${api_key}`).then(r => r.json());
  return f;
};

//
// if (!this.coins.find((e) => e.name === name).price)
//   this.coins.find((e) => e.name === name).price = data.EUR > 1 ? data.EUR.toFixed(2) : data.EUR.toPrecision(2);
// if (this.chosenCoin?.name === name) {
//   this.graph.push(data.EUR);
// }