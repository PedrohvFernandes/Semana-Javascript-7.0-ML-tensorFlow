import { prepareRunChecker } from '../../../../lib/shared/util.js'
const { shouldRun: scrollShouldRun } = prepareRunChecker({ timerDelay: 200 })
export default class HandGestureController {
  #view
  #service
  #camera
  // para a onde ele estava da ultima vez
  #lastDirection = {
    direction: '',
    y: 0
  }
  constructor({ camera, view, service }) {
    this.#service = service
    this.#view = view
    this.#camera = camera
  }
  async init() {
    return this.#loop()
  }

  #scrollPage(direction) {
    // A quantidade de pixels que ele vai descer ou subir
    const pixelsScroll = 150
    // Se a direção for igual a que esta chegando para a função, ele vai somar ou subtrair os pixels
    if (this.#lastDirection.direction === direction) {
      this.#lastDirection.y =
        direction === 'scroll-down'
          ? // Desce, ou seja soma mais pixels, começou com 100 no inicio, precisou descer mais 100
            this.#lastDirection.y + pixelsScroll
          : // Sobe diminui pixels, precisou descer menos 100
            this.#lastDirection.y - pixelsScroll
    } else {
      // Sempre na primeira vez não vai ter uma direção então ele ja pula para casa, nas proximas vezes ele ja vai direto para o if de cima
      this.#lastDirection.direction = direction
    }

    this.#view.scrollPage(this.#lastDirection.y)
  }

  async #estimateHands() {
    try {
      // Vamos pegar os dados das mãos e la no service nos tratamos esses dados
      const hands = await this.#service.estimateHands(this.#camera.video)
      // Vamos ler os dados sob demanda, por conta que detectGesture é uma função interetator, la no service e ele ja nos devolve um objeto com o event que é result.name, x e y
      for await (const { event, x, y } of this.#service.detectGestures(hands)) {
        // console.log({ gesture })
        // console.log({ event, x, y })
        // this.#view.render(event, x, y)
        // Se no event contem scroll, executa o scrollPage, passando o event, ou melhor dizendo a direção
        if (event.includes('scroll')) {
          if (!scrollShouldRun()) return // não executa mais do que 200ms
          this.#scrollPage(event)
        }
      }
    } catch (error) {
      console.error('Deu ruim**', error)
    }
  }

  async #loop() {
    await this.#service.initializeDetector()
    await this.#estimateHands()
    this.#view.loop(this.#loop.bind(this))
  }

  static async initialize(deps) {
    const controller = new HandGestureController(deps)
    return controller.init()
  }
}
