import "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.2.0/dist/tf-core.min.js"
import "https://unpkg.com/@tensorflow/tfjs-backend-webgl@3.7.0/dist/tf-backend-webgl.min.js"
import "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.min.js"
import "https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection@2.0.0/dist/hand-pose-detection.min.js"
// é a lib para poder manipular os dados do tensoflow, os calculos matematicos retornado dele, por exemplo la na class01 em pages em video-player em src em service usamos calculos matematicos para saber se o olho estava fechado ou nao
import "https://cdn.jsdelivr.net/npm/fingerpose@0.1.0/dist/fingerpose.min.js"

import HandGestureController from "../controllers/handGestureController.js"
import HandGestureService from "../services/handGestureService.js"
import HandGestureView from "../views/handGestureView.js"
import Camera from "../../../../lib/shared/camera.js"

const camera = await Camera.init()

const [rootPath] = window.location.href.split('/pages/')
const factory = {
  async initialize() {
    return HandGestureController.initialize({
      camera,
      view: new HandGestureView(),
      service: new HandGestureService({
        fingerpose: window.fp,
        handPoseDetection: window.handPoseDetection,
        handsVersion: window.VERSION
      })
    })
  }
}

export default factory
