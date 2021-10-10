
const api_key = process.env.VUE_APP_API_KEY //api key
const currenciesHandlers = new Map();
const AGGREGATE_INDEX = '5'
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${api_key}`);
socket.addEventListener('message',(e)=>{
  const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data)
  if(type !== AGGREGATE_INDEX) {
    return
  }

  const handlers = currenciesHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));

})

//to get the list of crypto pairs from the API?
//to constantly get the updates of costs of crypto pairs from the API

function sendToWS(message){
  const stringifiedMessage = JSON.stringify(message)
  if(socket.readyState===WebSocket.OPEN){
    socket.send(stringifiedMessage)
    return
  }
  socket.addEventListener('open',()=>{
    socket.send(stringifiedMessage)
  },{once:true})
}
function subscribeOnWS(currency){
  sendToWS({
    action: "SubAdd",
    subs:[`5~CCCAGG~${currency}~EUR`]
  })
}
export const subscribeToCurrency = (currency, cb) => {
  const subscribers = currenciesHandlers.get(currency) || [];
  currenciesHandlers.set(currency, [...subscribers, cb]);
  subscribeOnWS(currency)
};

export const unsubscribeFromCurrency = currency => {
  currenciesHandlers.delete(currency);
};


window.tickers = currenciesHandlers;