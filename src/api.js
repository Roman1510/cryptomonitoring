
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
// {
//   "TYPE": "429",
//   "MESSAGE": "TOO_MANY_SOCKETS_MAX_1_PER_CLIENT",
//   "INFO": "You have reached your maximum sockets open for your subscription"
// }
//this shit needs to be fixed

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
function unsubscribeOnWS(currency){
  sendToWS({
    action: "SubRemove",
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
  unsubscribeOnWS(currency)
};


window.tickers = currenciesHandlers;