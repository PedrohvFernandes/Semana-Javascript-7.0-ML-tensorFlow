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

  // Render para todos os gestos
  render({
    handDirection,
    gestureStrings,
    gestureStringsObject,
    event,
    dontGesturePair
  }) {
    if (gestureStringsObject[event] !== gestureStringsObject.dont) {
      this.#resultLayer[handDirection].innerText = gestureStrings
    }
    if (gestureStringsObject[event] === gestureStringsObject.dont) {
      if (dontGesturePair.size === 2) {
        this.#resultLayer.left.innerText = this.#resultLayer.right.innerText =
          gestureStringsObject.dont
        dontGesturePair.clear()
      }
    }
  }

  // Rseta tudo caso não tenha nenhuma mão
  resetRender() {
    this.#resultLayer.right.innerText = ''
    this.#resultLayer.left.innerText = ''
  }

  // Resetar a direção da mão
  resetRenderDirection(direction) {
    if (direction === 'right') {
      this.#resultLayer.left.innerText = ''
    }
    this.#resultLayer.right.innerText = ''
  }
}
