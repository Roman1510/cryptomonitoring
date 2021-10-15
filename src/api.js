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
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice, MESSAGE: message, PARAMETER: param } = JSON.parse(e.data);
  if(message===MESSAGE_INVALID){
    let currencyFromParam = param.split('~')[2]
    const handlers = currenciesHandlers.get(currencyFromParam) ?? [];
    handlers.forEach(fn => fn(newPrice,true));
  }
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  const handlers = currenciesHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice,false)); // here i would just add a new input (flag) to see when there's error

  bc.postMessage({ "type": type, "currency": currency, "newPrice": newPrice });
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

function subscribeOnWS(currency) {
  sendToWS({
    action: "SubAdd",
    subs: [`5~CCCAGG~${currency}~USD`]
  });
}

function unsubscribeOnWS(currency) {
  sendToWS({
    action: "SubRemove",
    subs: [`5~CCCAGG~${currency}~USD`]
  });
}

export const subscribeToCurrency = (currency, cb) => {
  const subscribers = currenciesHandlers.get(currency) || [];
  currenciesHandlers.set(currency, [...subscribers, cb]);
  subscribeOnWS(currency);
};

export const unsubscribeFromCurrency = currency => {
  currenciesHandlers.delete(currency);
  unsubscribeOnWS(currency);
};

window.coins = currenciesHandlers;

// 1) highlight with red when there's no FROMSYMBOL (pass some flag about that, from the api.js)
// 2) cross conversion (this is purely api.js)
// 3) shared worker (this is purely api.js)