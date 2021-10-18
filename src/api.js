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


  if (message === MESSAGE_INVALID) {
    const handlers = currenciesHandlers.get(currencyFromWs) ?? [];
    handlers.subs.forEach(fn => fn(newPrice, true));
    currenciesHandlers.set(currencyFromWs, { subs: handlers.subs, isCross: true});
    crossConversion(currencyFromWs);
    //here i should check if the btc already exists

  }
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  console.log(Object.fromEntries(currenciesHandlers))
  if(currencyFrom==="BTC"&&currencyTo==="USD"&&newPrice){
    const handlers = Object.fromEntries(currenciesHandlers)
    for(let key in handlers){
      if(handlers[key].isCross){
        handlers[key].priceBTC=newPrice
      }
    }

  debugger
  //if i have btc in the list, which doesn't have isCross, i update that
    const handlersToUpdate = currenciesHandlers.get('BTC') ?? [];
    console.log(handlersToUpdate)
    if(handlersToUpdate.length&&handlersToUpdate.isCross===false){
      handlersToUpdate.subs.forEach(fn => fn(newPrice, false));
    } else {
      return;
    }
  }
  if(currencyTo==="BTC"){
    let priceBTC = 0;
    const handlers = Object.fromEntries(currenciesHandlers)
    for(let key in handlers){
      if(handlers[key].isCross){
        priceBTC = handlers[key].priceBTC
      }
    }
    let result = priceBTC*newPrice
    const handlersForUpdate = currenciesHandlers.get(currencyFrom) ?? []
    handlersForUpdate.subs.forEach(fn=>fn(result,false))

    return
  }

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
  subscribeOnWS("BTC", "USD"); //later will optimize this one (cuz it will duplicate if there's no handling on the api side)
  subscribeOnWS(currency, "BTC");
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

// 1) check if the btc exists already, then do the needful

// 2) shared worker (this is purely api.js) (after the cross-conversion bug fixed)