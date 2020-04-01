// shrink
const shrinkAnimation = uni.createAnimation({
  transformOrigin: "50% 50%",
  duration: 80,
  timingFunction: "ease-in"
})
export const shrink = {
  data: shrinkAnimation,
  run(fn) {
    shrinkAnimation.scale(0.92).step()
    fn()
    const timer = setTimeout(() => {
      clearTimeout(timer)
      shrinkAnimation.scale(1).step()
      fn()
    }, 80)
  }
}

// right in 
const slideInRightAnimation = uni.createAnimation({
  duration: 250,
  timingFunction: "ease-in"
})

export const slideInRight = {
  data: slideInRightAnimation,
  run(callback, before) {
    if(before && typeof before === 'function') {
      before()
    }
    const timer = setTimeout(() => {
      clearTimeout(timer)
      slideInRightAnimation.translate3d(0, 0, 0).step()
      callback()
    }, 250)
  }
}
