<script>
  import { navigateTo } from './util/uniApi'
  import { dataToQuery } from './util/util'
  export default {
    onLaunch: function({ query }) {
      uni.hideTabBar()
    },
    onShow: function() {
      const { 
        scene,
        query
       } = wx.getLaunchOptionsSync()
      const isQuery = [1011, 1012, 1013, 1047, 1048, 1049].indexOf(+scene) !== -1
      console.log(isQuery, query.scene)
      if (isQuery && query.scene) {
        const id = decodeURIComponent(query.scene.substr(8)).split('=').reverse()[0]
        navigateTo({
          url: 'goodDetail' + dataToQuery({ id })
        })
      }
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
