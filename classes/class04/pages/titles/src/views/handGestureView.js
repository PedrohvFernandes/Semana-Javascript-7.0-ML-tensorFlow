export default class HandGestureView {
  #resultLayer = {
    right: document.querySelector('#pose-result-right'),
    left: document.querySelector('#pose-result-left')
  }
  #styler
  #handsCanvas = document.querySelector('#hands')
  #canvasContext = this.#handsCanvas.getContext('2d')
  #fingerLookupIndexes
  constructor({ fingerLookupIndexes, styler }) {
    this.#handsCanvas.width = globalThis.screen.availWidth
    this.#handsCanvas.height = globalThis.screen.availHeight
    this.#fingerLookupIndexes = fingerLookupIndexes
    this.#styler = styler
    // Carrega os estilos do documento assincronamente (evitar travar a tela enquanto carrega)
    setTimeout(() => styler.loadDocumentStyles(), 200)
  }

  clearCanvas() {
    this.#canvasContext.clearRect(
      0,
      0,
      this.#handsCanvas.width,
      this.#handsCanvas.height
    )
  }

  drawResults(hands) {
    // Cada mão possui uma direção e um conjunto de pontos
    for (const { keypoints, handedness } of hands) {
      if (!keypoints) continue

      this.#canvasContext.fillStyle =
        handedness === 'Left' ? 'rgb(44,212,103)' : 'rgb(44,212,103)'
      this.#handsCanvas.style.zIndex = '1000'
      this.#canvasContext.strokeStyle = 'white'
      this.#canvasContext.lineWidth = 8
      this.#canvasContext.lineJoin = 'round'

      // As juntas dos dedos. Ai com os keypoints que são as juntas dos dedos e da palma desenhamos elas
      this.#drawJoients(keypoints)
      // Depois os dedos
      this.#drawFingersAndHoverElements(keypoints)
    }
  }

  // Juntas dos dedos
  /*  #drawJoients(keypoints) {
    for (const { x, y } of keypoints) {
      this.#canvasContext.beginPath()
      const newX = x -2
      const newY = y -2
      const radius = 3
      const startAngle = 0
      const endAngle = 2 * Math.PI

      this.#canvasContext.arc(newX, newY, radius, startAngle, endAngle)
      this.#canvasContext.fill()
    }
  }
  */
  clickOnElement(x, y) {
    const element = document.elementFromPoint(x, y)
    if (!element) return

    const rect = element.getBoundingClientRect()
    
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: rect.left + x,
      clientY: rect.top + y
    })
    element.dispatchEvent(event)
  }

  // Os pontos das juntas dos dedos
  #drawJoients(keypoints) {
    for (const { x, y } of keypoints) {
      this.#canvasContext.beginPath()
      const newX = x - 2
      const newY = y - 2
      const radius = 3
      const startAngle = 0
      const endAngle = 2 * Math.PI

      this.#canvasContext.arc(newX, newY, radius, startAngle, endAngle)
      this.#canvasContext.fill()
    }
  }

  // As linhas dos dedos
  #drawFingersAndHoverElements(keypoints) {
    const fingers = Object.keys(this.#fingerLookupIndexes)
    for (const finger of fingers) {
      // console.log(finger)
      const points = this.#fingerLookupIndexes[finger].map(
        index => keypoints[index]
      )

      const region = new Path2D()
      // [0] é a palma da mão(wrist)
      const [{ x, y }] = points
      region.moveTo(x, y)
      for (const point of points) {
        region.lineTo(point.x, point.y)
      }
      this.#canvasContext.stroke(region)
      this.#hoverElements(finger, points)
    }
  }

  #hoverElements(finger, points){
    if(finger !== 'indexFinger') return
    const tip = points.find(item => item.name === "index_finger_tip")
    const element = document.elementFromPoint(tip.x, tip.y)
    if(!element) return
    const fn = () => this.#styler.toggleStyle(element, ':hover')
    fn()
    setTimeout(() => fn(), 800)
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
  render({ handDirection, gestureStrings, gestureStringsObject, event }) {
    if (gestureStringsObject[event] !== gestureStringsObject.dont) {
      this.#resultLayer[handDirection].innerText = gestureStrings
    }
  }

  renderDont({ dontGesture, hands}) {
    if (hands.length === 1) {
      this.resetRender()
      return
    }
    
    this.#resultLayer.left.innerText = this.#resultLayer.right.innerText =
      dontGesture
  }

  // Reset tudo caso não tenha nenhuma mão
  resetRender() {
    this.#resultLayer.right.innerText = ''
    this.#resultLayer.left.innerText = ''
  }

  // Reset a direção da mão
  resetRenderDirection(direction) {
    if (direction === 'right') {
      this.#resultLayer.left.innerText = ''
    }
    this.#resultLayer.right.innerText = ''
  }
}
