<template>
  <view class='page-loading-wraper' v-if="show">
    <view class="loader">
      <view class="horizontal">
        <view class="circlesup">
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
        </view>
        <view class="circlesdwn">
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
        </view>
      </view>
      <view class="vertical">
        <view class="circlesup">
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
        </view>
        <view class="circlesdwn">
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
          <view class="circle"></view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
  export default {
  	props: {
  		show: {
  			type: Boolean,
  			default: true,
  		},
  	},
  	data() {
  		return {}
  	},
  	methods: {},
  	mounted() {
  		uni.hideTabBar()
  	},
  	watch: {
  		show(val) {
  			if (val) uni.hideTabBar()
  			else uni.showTabBar()
  		},
  	},
  }
</script>
<style scoped lang='scss'>
  .page-loading-wraper {
  	width: 100%;
  	height: 100%;
  	background: #fff;
  	position: fixed;
  	z-index: 99999;
  	left: 0;
  	top: 0;
  }
  .loader {
  	position: absolute;
  	top: 50%;
  	left: 50%;
  	transform: translate(-50%, -50%) scale(0.4);
  	text-align: center;
  	user-select: none;
  	cursor: default;
  }
  /* Set for the first layer vertical position */
  .vertical {
  	position: absolute;
  	top: -1.84em;
  	left: -0.4em;
  	transform: rotate(90deg);
  }

  /* Set for the second layer horizontal position */
  .horizontal {
  	position: absolute;
  	top: 0em;
  	left: 0em;
  	transform: rotate(0deg);
  }

  /* The next two classes do mirror for animation */
  .circlesup {
  	position: absolute;
  	top: -4.7em;
  	right: 12.1em;
  }

  .circlesdwn {
  	position: absolute;
  	top: 2.5em;
  	right: -13.5em;
  	transform: rotate(180deg);
  }

  /* Create a container for our circles, rotate it 45 degrees and set animation*/
  .circle {
  	position: absolute;
  	width: 15em;
  	height: 15em;
  	transform: rotate(45deg);
  	animation: orbit 2s infinite;
  	z-index: 5;
  }

  /* Style's of our circles */
  .circle:after {
  	content: '';
  	position: absolute;
  	width: 2em;
  	height: 2em;
  	border-radius: 100%;
  	background-image: radial-gradient(circle 248px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
  }

  .circle:nth-child(2) {
  	animation-delay: 100ms;
  	z-index: 4;
  }

  .circle:nth-child(2):after {
  	background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  	transform: scale(0.8, 0.8);
  }

  .circle:nth-child(3) {
  	animation-delay: 225ms;
  	z-index: 3;
  }

  .circle:nth-child(3):after {
  	background-image: linear-gradient(to right, #fa709a 0%, #fee140 100%);
  	transform: scale(0.6, 0.6);
  }

  .circle:nth-child(4) {
  	animation-delay: 350ms;
  	z-index: 2;
  }

  .circle:nth-child(4):after {
  	background-image: linear-gradient(to right, #f83600 0%, #f9d423 100%);
  	transform: scale(0.4, 0.4);
  }

  .circle:nth-child(5) {
  	animation-delay: 475ms;
  	z-index: 1;
  }

  .circle:nth-child(5):after {
  	transform: scale(0.2, 0.2);
  }

  @keyframes orbit {
  	0% {
  		transform: rotate(45deg);
  	}

  	5% {
  		transform: rotate(45deg);
  		animation-timing-function: ease-out;
  	}

  	70% {
  		transform: rotate(405deg);
  		animation-timing-function: ease-in;
  	}

  	100% {
  		transform: rotate(405deg);
  	}
  }
</style>