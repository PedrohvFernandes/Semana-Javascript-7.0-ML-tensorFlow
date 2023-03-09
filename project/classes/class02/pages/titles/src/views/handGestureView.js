export default class HandGestureView {
  #resultLayer = {
    right: document.querySelector('#pose-result-right'),
    left: document.querySelector('#pose-result-left')
  }
  // Ele pega a função e executa 60 vezes(fps) por segundo
  loop(fn) {
    requestAnimationFrame(fn)
  }

  scrollPage(top) {
    scroll({
      top,
      behavior: 'smooth'
    })
  }

  render({ handDirection, gestureStrings }) {
    this.#resultLayer[handDirection].innerText = gestureStrings
  }

  // Combinação de gestos Dont

  resetRender() {
    this.#resultLayer.right.innerText = ''
    this.#resultLayer.left.innerText = ''
  }

  resetRenderDirection(direction) {
    if (direction === 'right') {
      this.#resultLayer.left.innerText = ''
    }
    this.#resultLayer.right.innerText = ''
  }
}
