const api_key = process.env.VUE_APP_API_KEY; //api key
const currenciesHandlers = new Map();
const AGGREGATE_INDEX = "5";
const MESSAGE_INVALID = "INVALID_SUB";

const bc = new BroadcastChannel("wsdata");
bc.onmessage = ev => {
  if (ev.data) {
    const handlers = currenciesHandlers.get(ev.data.currency) ?? [];
    if (ev.data.newPrice) {
      handlers.forEach(fn => fn(ev.data.newPrice));
    }
  }
};
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${api_key}`);
socket?.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currencyFrom,
    TOSYMBOL: currencyTo,
    PRICE: newPrice,
    MESSAGE: message,
    PARAMETER: param
  } = JSON.parse(e.data);
  const currencyFromWs = param?.split("~")[2] || "";
  if(currencyTo==="BTC"&&newPrice){
    const handlers = currenciesHandlers.get(currencyFrom) ?? [];
    currenciesHandlers.set(currencyFrom, { subs: handlers.subs, isCross: true, tempPrice: newPrice});
  }

  if (message === MESSAGE_INVALID) {
    const handlers = currenciesHandlers.get(currencyFromWs) ?? [];
    handlers.subs.forEach(fn => fn(newPrice, true));

    currenciesHandlers.set(currencyFromWs, { subs: handlers.subs, isCross: true});
    crossConversion(currencyFromWs);

  }
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  //this I should refactor like so: the additional key will be the price of the BTC
  // and this will be stored as a main temporary key, and will be the first to fetch for all cases. but
  // after that, with the single ws response, will update the corresponding price

  // if (currencyFrom === "BTC" && currencyTo === "USD") {
  //   //this is the sign that we can loop through all the list with the flag 'iscross', and update the prices,
  //   currenciesHandlers.forEach(e=>e.tempPrice=e.tempPrice*newPrice)
  //   console.log(currenciesHandlers)
  //   // then, give the full list to the upper level
  //   return;
  // }
  const handlers = currenciesHandlers.get(currencyFrom) ?? [];
  handlers.subs.forEach(fn => fn(newPrice, false));

  bc.postMessage({ "type": type, "currency": currencyFrom, "newPrice": newPrice });
});

function sendToWS(message) {
  const stringMessage = JSON.stringify(message);
  if (socket?.readyState === WebSocket.OPEN) {
    socket?.send(stringMessage);
    return;
  }
  socket?.addEventListener("open", () => {
    socket?.send(stringMessage);
  }, { once: true });
}

function subscribeOnWS(currencyFrom, currencyTo) {
  sendToWS({
    action: "SubAdd",
    subs: [`5~CCCAGG~${currencyFrom}~${currencyTo}`]
  });
}

function unsubscribeOnWS(currencyFrom, currencyTo) {
  sendToWS({
    action: "SubRemove",
    subs: [`5~CCCAGG~${currencyFrom}~${currencyTo}`]
  });
}

function crossConversion(currency) {
  subscribeOnWS(currency, "BTC");
  subscribeOnWS("BTC", "USD"); //later will optimize this one (cuz it will duplicate if there's no handling on the api side)
}

export const subscribeToCurrency = (currency, cb) => {
  const subscribers = currenciesHandlers.get(currency) || [];
  currenciesHandlers.set(currency, { subs: [...subscribers, cb], isCross: false });
  subscribeOnWS(currency, "USD");
};

export const unsubscribeFromCurrency = currency => {
  currenciesHandlers.delete(currency);
  unsubscribeOnWS(currency, "USD");
};

window.coins = currenciesHandlers;

// 1) cross conversion (this is purely api.js)
// it should delete the whole subscription of a currency, then => make a 2-step conversion using btc, then btc=>usd


// 2) shared worker (this is purely api.js)