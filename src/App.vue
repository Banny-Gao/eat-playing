<script>
  import { navigateTo } from './util/uniApi'
  import { dataToQuery } from './util/util'
  export default {
    onLaunch: function({ query }) {
      const { scene } = query
      if (scene) {
        const id = decodeURIComponent(scene.substr(8)).split('=').reverse()[0]
        navigateTo({
          url: 'goodDetail' + dataToQuery({ id })
        })
      }
    },
    onShow: function() {
    },
    onHide: function() {
    },
    globalData: {
    }
  }
</script>

<style lang='scss'>
  @import "./uni.scss";
</style>
