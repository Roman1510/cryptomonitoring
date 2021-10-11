const api_key = process.env.VUE_APP_API_KEY; //api key
const currenciesHandlers = new Map();
const AGGREGATE_INDEX = "5";
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${api_key}`);
socket.addEventListener("message", (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX) {
    return;
  }
  const handlers = currenciesHandlers.get(currency) ?? [];
  if (newPrice) {
    handlers.forEach(fn => fn(newPrice));
  }

});
// {
//   "TYPE": "429",
//   "MESSAGE": "TOO_MANY_SOCKETS_MAX_1_PER_CLIENT",
//   "INFO": "You have reached your maximum sockets open for your subscription"
// }
//this shit needs to be fixed

function sendToWS(message) {
  const stringMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringMessage);
    return;
  }
  socket.addEventListener("open", () => {
    socket.send(stringMessage);
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
