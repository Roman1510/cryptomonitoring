export const listOfCurrency = () => {
  const f = fetch("https://min-api.cryptocompare.com/data/all/coinlist?summary=true").then(r => r.json());
  return f;
};

