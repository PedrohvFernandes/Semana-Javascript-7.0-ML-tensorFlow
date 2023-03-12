export default class Camera {
  constructor() {
    // Pelo constuctor crio o elemento video
    this.video = document.createElement('video')
  }
  // Static é um metodo para ser acessado sem instanciar a classe usando new, não precisa guardar estado
  static async init() {
    // Valida se temos acesso a camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available'
      )
    }
    const videoConfig = {
      audio: false,
      video: {
        // Largura globalThis(objeto global do js) e o screen.availWidth que é o tamanho disponivel na tela
        width: globalThis.screen.availWidth,
        height: globalThis.screen.availHeight
      },
      frameRate: {
        ideal: 60
      }
    }
    // Pega a camera
    const stream = await navigator.mediaDevices.getUserMedia(videoConfig)
    // Cria um objeto da camera
    const camera = new Camera()
    // Pego a tag de video criada e passo o stream da camera para o video
    camera.video.srcObject = stream

    // Somente para testes(debugar)
    // camera.video.height = 240
    // camera.video.width = 320
    // // Adiciona o video na tela
    // document.body.append(camera.video)

    // Espera o video carregar(aguardando a camera) e retorna ela
    await new Promise(
      resolve => (camera.video.onloadedmetadata = resolve(camera.video))
    )

    // Apos carregar(ler e saber que tem conteudo)
    camera.video.play()
    return camera
  }
}
