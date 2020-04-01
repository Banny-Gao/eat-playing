import Vue from 'vue'
import App from './App'
import { store } from './store'

Vue.config.productionTip = false

App.mpType = 'app'

store.dispatch('user/getOpenId')

const app = new Vue({
  ...App,
  store
})
app.$mount()
