<link rel="stylesheet" href="../../../../Desktop/app.css">
<template>
  <div class="container mx-auto flex flex-col items-center p-4">
    <div
      v-if="isLoaded===false"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
    <div class="container">
      <div class="w-full my-4" />
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label
              for="wallet"
              class="block text-sm font-medium text-gray-700"
            >Currency</label>
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                @keydown.enter="addCoin"
                v-model="coinInput"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="e.g. DOGE"
              >
            </div>
            <div v-if="hintsList.length" class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
              <span
                @click="selectHint(hint.Symbol)"
                :key="hint"
                v-for="hint in hintsList"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ hint.Symbol }}
              </span>
            </div>
            <div v-if="alreadyExists"
                 class="text-sm text-red-600">
              This one already exists in the list
            </div>
          </div>
        </div>
        <button
          @click="addCoin"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            />
          </svg>
          Add
        </button>
      </section>
      <template v-if="coins.length">
        <div>
          Filter: <input v-model="filter"
                         class="inline w-0.2 pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                         type="text" />
          <button v-if="hasNextPage" @click="page=page+1"
                  class="mx-2 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Next
          </button>
          <button v-if="page>1" @click="page=page-1"
                  class="mx-2 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Back
          </button>

        </div>
        <hr class="w-full border-t border-gray-600 my-4">
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            @click="select(item)"
            v-for="(item,idx) in paginatedCoins"
            :key="idx"
            :class="{'border-4':item==chosenCoin}"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ item.name }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(item.price) }} - EUR
              </dd>
            </div>
            <div class="w-full border-t border-gray-200" />
            <button
              @click.stop="deleteCoin(item)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Delete
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4">
      </template>
      <section
        v-if="chosenCoin"
        class="relative"
      >
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ chosenCoin.name }} - EUR
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(bar,idx) in normalizedGraph"
            :key="idx"
            :style="{height: `${bar? bar: 5}%`}"
            class="bg-purple-800 border w-10"
          />
        </div>
        <button
          @click="chosenCoin=null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background:new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              />
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>
<script>
//  [ * ] 1. there are dependent data in  state
//  [ ] 2. requests directly in the component
//  [ * ] 3. deleting => subscription is in place still
//  [ ] 4. api error handling
//  [ ] 5. request quantity
//  [ *] 6. when deleting a coin localstorage isn't changed
//  [ * ] 7. repetitive code in watch
//  [ ] 8. localstorage and incognito pages
//  [ ]  9. graph is not ok, when there are too many prices
//  [ ] 10. magical variables => url, 500, storage key etc.

// in parallel
//  [ * ]  graph is broken when there's equal values
//  [ * ] when deleting a coin our choice is still there
import { listOfCurrency } from "./listOfCurrency";
import { loadCurrencyData, subscribeToCurrency, unsubscribeFromCurrency } from "./api.js";

export default {
  name: "App",
  data() {
    return {
      isLoaded: false, //for the loader
      api_key: process.env.VUE_APP_API_KEY, //api key
      coinInput: "", //for the input
      coins: [], //list of the tracked coins
      chosenCoin: null, //chosen coin to track using the graph
      graph: [], // the graph itself
      listOfCurrency: [], // the list where i filter the hints from (the local list from the api)
      alreadyExists: false, // flag for showing error message
      filter: "",
      page: 1
    };
  },
  methods: {
    selectHint(hint) {
      this.coinInput = hint;
    },
    addCoin() {
      this.filter = "";
      const newCoin = {
        name: this.coinInput.toUpperCase(),
        price: "-"
      };
      const found = this.coins.find((e) => {
        return e.name === newCoin.name;
      });
      if (!found) {
        this.coins = [...this.coins, newCoin];
        this.updateData(newCoin.name);
        subscribeToCurrency(newCoin.name, (newPrice)=>this.updateCoin(newCoin.name,newPrice))
        this.coinInput = "";

      } else {
        this.alreadyExists = true;
      }
    },
    deleteCoin(toDelete) {
      this.coins = this.coins.filter(e => e !== toDelete);
      if (this.chosenCoin === toDelete) {
        this.chosenCoin = null;
      }
      unsubscribeFromCurrency(toDelete.name)
    },
    select(current) {
      this.chosenCoin = current;
    },
    formatPrice(price) {
      if (!price || price === "-") {
        return "-";
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    updateCoin(coinName,price){
       this.coins.filter(coin=>coin.name === coinName).forEach(coin=>{coin.price = price})
    },
    async updateData() {
      // if (!this.coins.length) {
      //   return;
      // }
      //
      // this.coins.forEach(coin => {
      //   const price = exchangeData[coin.name.toUpperCase()];
      //   coin.price = price || "-";
      // });
    },
    loadingAnimation() {
      document.onreadystatechange = () => {
        if (document.readyState == "complete") {
          setTimeout(() => {
            this.isLoaded = true;
          }, 100);
        }
      };
    },
    async fetchFullList() {
      const response = await listOfCurrency();
      this.listOfCurrency = Object.keys(response.Data).map((key) => {
        return response.Data[key];
      });
    }
  },
  computed: {
    hintsList() {
      this.alreadyExists = false;
      let result = [];
      const matchingHelper = (input, string) => {
        return string.toLowerCase().includes(this.coinInput.toLowerCase());
      };
      if (this.coinInput) {
        this.listOfCurrency.forEach((e) => {
          if ((matchingHelper(this.coinInput, e.Symbol) || matchingHelper(this.coinInput, e.FullName)) && result.length < 4) {
            result.push(e);
          }
        });
      }
      return result;
    },
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    hasNextPage() {
      return this.filteredCoins.length > this.endIndex;
    },
    filteredCoins() {
      return this.coins.filter((coin) => coin.name.includes(this.filter));
    },
    paginatedCoins() {
      return this.filteredCoins.slice(this.startIndex, this.endIndex);
    },
    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        (price) => {
          return 5 + (((price - minValue) * 95) / (maxValue - minValue));
        }
      );
    },
    computeProps() {
      return {
        filter: this.filter,
        page: this.page
      };
    }
  },
  created() {
    this.loadingAnimation();
    this.fetchFullList();
    const coinsData = localStorage.getItem("coins");
    if (coinsData) {
      this.coins = JSON.parse(coinsData);
      this.coins.forEach(coin=>{
        subscribeToCurrency(coin.name, (newPrice)=>this.updateCoin(coin.name,newPrice))
      })
    }
    setInterval(this.updateData, 5000);
    /* in const {...} we specify VALID_KEYS*/
    const { filter, page } = Object.fromEntries(new URL(window.location).searchParams.entries());
    if (filter) {
      this.filter = +filter;
    }
    if (page) {
      this.page = +page;
    }
  },
  watch: {
    computeProps(value) {
      if (value.filter) {
        this.page = 1;
      }
      history.pushState(null, document.title, `${window.location.pathname}?filter=${value.filter}&page=${value.page}`);
    },
    paginatedCoins() {
      if (this.paginatedCoins.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
    coins() {
      localStorage.setItem("coins", JSON.stringify(this.coins.map((e) => {
        return { name: e.name };
      })));
    },
    chosenCoin() {
      this.graph = [];
    }
  }
};
</script>
<style>

</style>