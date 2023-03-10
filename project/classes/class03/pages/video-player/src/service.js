import { prepareRunChecker } from '../../../lib/shared/util.js'
const { shouldRun } = prepareRunChecker({ timerDelay: 500 })

const EAR_THRESHOLD = 0.2
export default class Service {
  #model = null
  #faceLandmarksDetection
  constructor({ faceLandmarksDetection }) {
    this.#faceLandmarksDetection = faceLandmarksDetection
  }

  // A api nossa faceLandmarksDetection esta bem diferente da documentação do tensorflow, pois estamos utilizando uma versão mais antiga
  async loadModel() {
    this.#model = await this.#faceLandmarksDetection.load(
      this.#faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces: 1 }
    )
  }

  // Calculate the position of eyelid to predict a blink
  #getEAR(upper, lower) {
    function getEucledianDistance(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
    }

    return (
      (getEucledianDistance(
        upper[5][0],
        upper[5][1],
        lower[4][0],
        lower[4][1]
      ) +
        getEucledianDistance(
          upper[3][0],
          upper[3][1],
          lower[2][0],
          lower[2][1]
        )) /
      (2 *
        getEucledianDistance(
          upper[0][0],
          upper[0][1],
          upper[8][0],
          upper[8][1]
        ))
    )
  }

  async handBlinked(video) {
    const predictions = await this.#estimateFaces(video)
    if (!predictions.length) return false
    // predictions.forEach(prediction => {
    for (const prediction of predictions) {
      // Right eye parameters
      const lowerRight = prediction.annotations.rightEyeUpper0
      const upperRight = prediction.annotations.rightEyeLower0
      const rightEAR = this.#getEAR(upperRight, lowerRight)
      // Left eye parameters
      const lowerLeft = prediction.annotations.leftEyeUpper0
      const upperLeft = prediction.annotations.leftEyeLower0
      const leftEAR = this.#getEAR(upperLeft, lowerLeft)

      const isLeftEARblinked = leftEAR <= EAR_THRESHOLD
      const isRightEARblinked = rightEAR <= EAR_THRESHOLD

      // True if the eye is closed
      // const blinked = leftEAR <= EAR_THRESHOLD && rightEAR <= EAR_THRESHOLD
      // const blinked = leftEAR <= EAR_THRESHOLD || rightEAR <= EAR_THRESHOLD
      const blinked = isLeftEARblinked || isRightEARblinked
      

      if (!blinked) continue
      if (!shouldRun()) continue
      // this.#checkClosedEye(leftEAR, rightEAR)
      // Ja poderia dar o console por aqui, mas decidi passar para a controller, porque la nos temos o log
      // console.log(this.#checkClosedEye(isRightEARblinked, isLeftEARblinked))
      let eyeBlinked = this.#checkClosedEye(isRightEARblinked, isLeftEARblinked)
      
      // return [blinked, eyeBlinked]
      return {blinked, eyeBlinked}

      //)
    }
    return false
  }

  // #checkClosedEye(left, right) {
  //   if (left < right) {
  //     return console.log('Esquerdo fechado')
  //   }

  //   if (right < left) {
  //     return console.log('Direito fechado')
  //   }
  // }

  #checkClosedEye(right, left) {
    const eyeBlinked = `${right ? 'right' : ''} ${left ? 'left' : ''}`
    return eyeBlinked
  }

  // Config para o modelo de reconhecimento facial
  #estimateFaces(video) {
    return this.#model.estimateFaces({
      input: video,
      returnTensors: false,
      flipHorizontal: true,
      predictIrises: true
    })
  }
}
