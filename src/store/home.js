export default {
  namespaced: true,
  state() {
    return {
      initialIndex: 0,
      shouldTabInitial: true
    }
  },
  mutations: {
    setHomeTabState(state, data) {
      state = Object.assign(state, data)
    }
  },
}
