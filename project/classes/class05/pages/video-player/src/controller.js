export default class Controller {
  #view
  #camera
  #worker
  #blinkCounter = 0
  #eyeBlinked = ''
  constructor({ view, worker, camera }) {
    this.#view = view
    this.#camera = camera
    this.#worker = this.#configureWorker(worker)

    // O bind é necessário para que o onBtnStart seja executado no contexto do Controller
    this.#view.configureOnBtnClick(this.onBtnStart.bind(this))
    // this.#view.setVideoSrc(videoUrl)
  }

  static async initialize(deps) {
    const controller = new Controller(deps)
    controller.log('not yet detecting eye blink! Click on the button to start')
    return controller.init()
  }

  // So quando carregar o modelo que ele vai liberar o botão. So que por algum motivo ele não esta carregando o modelo rapidamente ou as vezes nem carrega, tem que recarregar a pagina. Caso aconteça isso use ctrl + f5 para limpar o cache
  // Metodo responsavel por receber as msgs do worker que tem o service la que usa o model, e para que consiga se comunicar entre o service e a view, o controller faz a ponte
  #configureWorker(worker) {
    let ready = false
    // Escuto a mensagem do worker. Caso o navegador não use o multi threading do worker, ele escuta na main thread, passando o service no mockWorker direto la no factory, ai o onmessage nesse pode vir um objeto data com uma string ou blinked, tipo o worker msm com a troca de msg, so que nesse caso o onmessage no objeto data pode vir uma string ou o proprio blinked. Ou seja, o onmessage é sobreescrito no controller
    worker.onmessage = ({ data }) => {
      console.log('recebi uma mensagem do worker video-player', data)

      // Escuta o primeiro postMessage do worker, que é o READY
      if ('READY worker video player' === data) {
        console.log('worker is ready!')
        // Ativa o botão
        this.#view.enableButton()
        this.#view.render(data)
        // Libera o envio de msgs para o worker
        ready = true
        return
      }

      // escuta o onmessage que vem mockWorker direto na factory e no caso do worker que é o postMessage apos o ready e o envio atraves do send usado no loop

      // Se fosse um array vindo da service: blinked = data.blinked[0] e eyeBlinked = data.blinked[1]
      const dataBlinked = data.blinked
      const blinked = dataBlinked.blinkedTwoEyes
      const eye = dataBlinked.eye === 'leftEye' ? true : true
      this.#blinkCounter += blinked || eye

      this.#eyeBlinked = dataBlinked.eyeBlinked
      this.#view.toggleVideo(dataBlinked.eye)
    }

    return {
      // Envia a msg para o worker, atraves de um loop, para que consiga atualizar o video, a cada img gerada dele pelo canvas
      send(msg) {
        // Se o modelo não estiver pronto, não envia a msg
        if (!ready) return
        // Devolve o video para a worker ou mockWorker(no factory), que nele é usado o service, que fala se piscou ou não, devolvendo esse blinked para aqui no controller, usando onmessage novamente
        worker.postMessage(msg)
      }
    }
  }

  async init() {
    console.log('Controller init')
  }

  loop() {
    const video = this.#camera.video
    const img = this.#view.getVideoFrame(video)
    this.#worker.send(img)
    this.log(`Blinks: ${this.#blinkCounter}`)

    // O setTimeout é para que o loop seja executado a cada 100ms
    setTimeout(() => this.loop(), 300)
  }

  log(text) {
    const times = `        -blinked times: ${
      this.#blinkCounter
    } / eye(s) blinked: ${this.#eyeBlinked})`
    this.#view.log(`logger: ${text}`.concat(this.#blinkCounter ? times : ''))
  }

  // Ativado o botão, agora ele vai iniciar o loop e pelo loop ele envia msg para o worker atraves do send que vem do configureWorker
  onBtnStart() {
    this.log('initializing detection')
    this.#view.render('')
    this.#blinkCounter = 0
    this.loop()
  }
}
