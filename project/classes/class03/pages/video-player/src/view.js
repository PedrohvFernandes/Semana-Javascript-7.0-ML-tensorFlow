export default class View {
  #btnInit = document.querySelector('#init')
  #statusElement = document.querySelector('#status')
  #videoFrameCanvas = document.createElement('canvas')
  #videoElement = document.querySelector('#video')
  // willReadFrequently --> é para cachear o canvas, para que ele não precise ficar renderizando o video a todo momento. Para não ficar saindo da memoria, evitando memory leaks(vazamento de memoria), evitando criar o canvas toda vez que for renderizar o video
  #canvasContext = this.#videoFrameCanvas.getContext('2d', {
    willReadFrequently: true
  })

  // Transforma o video em uma imagem. Tipo pausando ele e tirando uma foto. Porque não pode enviar o video para o worker, tem que enviar uma imagem ou um objeto mais simples
  getVideoFrame(video) {
    // Convertemos o video em um objeto HTML, o canvas para obtermos os dados do video
    const canvas = this.#videoFrameCanvas
    const [width, height] = [video.videoWidth, video.videoHeight]
    canvas.width = width
    canvas.height = height

    // Desenhamos o video no canvas
    this.#canvasContext.drawImage(video, 0, 0, width, height)
    return this.#canvasContext.getImageData(0, 0, width, height)
  }

  toggleVideo(eye) {
    if (eye === 'leftEye') {
      this.#videoElement.currentTime -= 10
      return
    }

    if (eye === 'rightEye') {
      this.#videoElement.currentTime += 10
      return
    }

    if (eye === 'right and left') {
      if (this.#videoElement.paused) {
        this.#videoElement.play()
        return
      }

      this.#videoElement.pause()
    }
  }

  enableButton() {
    // this.#btnInit.removeAttribute('disabled')
    this.#btnInit.disabled = false
  }

  configureOnBtnClick(fn) {
    this.#btnInit.addEventListener('click', fn)
  }

  log(text) {
    this.#statusElement.innerHTML = text
  }
}
