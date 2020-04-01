import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import user from './user'
import home from './home'

export const store = new Vuex.Store({
  modules: {
    user,
    home
  }
})