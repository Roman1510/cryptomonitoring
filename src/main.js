import {createApp} from "vue";
import App from "./App.vue";
import "./assets/tailwind.css";

const myApp =  createApp(App)
myApp.config.globalProperties.customProps = []
myApp.mount("#app")
