const api_key = process.env.VUE_APP_API_KEY; //api key
const currenciesHandlers = new Map();
const AGGREGATE_INDEX = "5";

const bc = new BroadcastChannel('wsdata')
bc.onmessage = ev => {
  if(ev.data){
    console.log(ev.data)
    const handlers = currenciesHandlers.get(ev.data.currency) ?? [];
    if (ev.data.newPrice) {
      handlers.forEach(fn => fn(ev.data.newPrice));
    }
  }
}
const socket =  new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${api_key}`);
socket?.addEventListener("message", (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX) {
    return;
  }
  if(currency&&newPrice){
    bc.postMessage({'type':type,'currency':currency,'newPrice':newPrice})
  }
  const handlers = currenciesHandlers.get(currency) ?? [];
  if (newPrice) {
    handlers.forEach(fn => fn(newPrice));
  }
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
  //here i shoud start something which checks for the current way of receiving the data, and switch it if needed
};

export const unsubscribeFromCurrency = currency => {
  currenciesHandlers.delete(currency);
  unsubscribeOnWS(currency);
};


//2) graph fix