// Set de ferramentas do tensorflow
import 'https://unpkg.com/@tensorflow/tfjs-core@2.4.0/dist/tf-core.js'
// O pacote utilitario
import 'https://unpkg.com/@tensorflow/tfjs-converter@2.4.0/dist/tf-converter.js'
// Webgl lib de grafico para ganhar performace no navegador
import 'https://unpkg.com/@tensorflow/tfjs-backend-webgl@2.4.0/dist/tf-backend-webgl.js'
// A cereja do bolo o modelo de reconhecimento facial, que faz com que retornamos os dados a partir da webcam
import 'https://unpkg.com/@tensorflow-models/face-landmarks-detection@0.0.1/dist/face-landmarks-detection.js'

import Service from './service.js'
// Debugger para caso a gente errou o nome
// debugger
// No processo principal é window para ver as dependencias injetadas nele, import com type module, require com type commonjs ou na tag script no html
// No worker é self
// Tf -> tensorflow, faceLandMarksDetection -> modelo de reconhecimento facial
const { tf, faceLandmarksDetection } = self
// Para usar o webgl tem que ter o aceleração de hardware ativado no navegador
tf.setBackend('webgl')

const service = new Service({
  faceLandmarksDetection
})
console.log('loading tf model')
await service.loadModel()
console.log('tf model loaded!')

// Envia uma mensagem para quem o chamou, no caso o controller em configureWorker
postMessage('READY worker video player')

// escuta msg para quem o chamar, no caso o controller, atraves do send que é chamado pelo loop
onmessage = async ({ data: video }) => {
  // console.log(video)
  // A cada img do video que ele recebe, ele vai verificar se o usuario piscou, atraves do modelo de reconhecimento facial
  const blinked = await service.handBlinked(video)
  if (!blinked) return
  // Envia uma nova msg para quem o chamou, no caso o controller em configureWorker. Mais especificamente quem tiver o onmessage, que no caso é uma função do worker para sempre ficar escutando a msg dele
  postMessage({
    blinked
  })
}
