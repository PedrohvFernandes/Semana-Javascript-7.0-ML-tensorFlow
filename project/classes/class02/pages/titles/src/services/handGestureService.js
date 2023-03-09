import { knowGestures, gestureStrings } from '../util/gestures.js'
export default class HandGestureService {
  // O fp passado la na factorie
  #gestureEstimator
  // O modelo de detecção de mãos passado la na factorie
  #handPoseDetection
  // A vesão do modelo passado la na factorie
  #handsVersion
  // Futuro detector de gestos usado la em baixo em initializeDetector
  #detector = null
  constructor({ fingerpose, handPoseDetection, handsVersion }) {
    this.#gestureEstimator = new fingerpose.GestureEstimator(knowGestures)
    this.#handPoseDetection = handPoseDetection
    this.#handsVersion = handsVersion
  }

  async estimate(keypoints3D) {
    const predictions = await this.#gestureEstimator.estimate(
      this.#getLandMarksFromKeyPoints(keypoints3D),
      // Porcentagem de confiança do geto(90%) que ele tem que ter para retornar o resultado
      9
    )
    return predictions.gestures
  }

  // Async interator, ele vai retornar o valor a medida que ele vai sendo chamado
  // Função para validar se esta funcionando
  // Eu recebo o retorno do tensorflow, que estava sendo logado na função estimateHands do service, usado la no controller. Com esse retorno mandamos as hands que contem cada mão, com os seus keypoints3D la do controller para o fp atraves daqui usando a função estimate usada na controller e o fp vai retornar o resultado na função estime, ja com os gestos pre setados la no util/gestures.js e passados aqui no service diretamente no FP que recebemos la da factory e usamos na gestureEstimator que é usada na estimate
  async *detectGestures(predictions) {
    // Cada mão que foi passada la no controller, por uma função daqui estimateHands
    for (const hand of predictions) {
      if (!hand.keypoints3D) continue

      const gestures = await this.estimate(hand.keypoints3D)
      if (!gestures.length) continue // Se nao tiver nenhum gesto, ele vai continuar, não retorna nada
      // console.log({gestures})
      const result = gestures.reduce((previous, current) => {
        return previous.score > current.score ? previous : current
      })

      // Aqui ele vai pegar a posição do o indicador, na verdade a ponto do dedo do indicador e com base nela temos o x e o y que é a posição que esta a mão na camera. Obs: lembrando cada junta possui array de posição, cada dedo possui 4 juntas, e no array de mãos podemos receber duas
      const { x, y } = hand.keypoints.find(
        keypoint => keypoint.name === 'index_finger_tip'
      )
      // O result.name retorna pra a gente o nome do gesto, lembrando que ele retorna mais coisas da lib fp. O name vai servir como chave, para ele retornar o valor que esta na chave gestureString, uma img, um emoji etc
      console.log('detected: ', gestureStrings[result.name], x, y)
      console.log(hand)
      // Iremos usar algo de uma função interator: yield, que vai retornar o valor a medida que ele for sendo chamado. Passei na primeira interação, encontrei o item e vamos retornar para quem chamou e depois ele faz o proximo for e assim por diante. O yield é usado para retornar um valor a medida que ele for sendo chamado. Aqui ne caso é quando fizermos um gesto, ele vai retornar o nome do gesto, a posição x e y
      yield {
        event: result.name,
        x,
        y,
        handDirection: hand.handedness.toLowerCase(),
        gestureStrings: gestureStrings[result.name],
        gestureStringsObject: gestureStrings
      }
    }
  }

  #getLandMarksFromKeyPoints(keypoints3D) {
    return keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z])
  }

  async estimateHands(video) {
    // O estimateHand vem da lib do tensorflow, que é a que faz a detecção das mãos, e o video é o video que esta sendo passado la no controller. Com isso, ele devolve as mãos para quem usar essa função
    return await this.#detector.estimateHands(video, {
      flipHorizontal: true
    })
  }
  async initializeDetector() {
    // Se ele ja tiver sido inicializado, ele nao vai inicializar de novo, passando o que tem nele
    if (this.#detector) return this.#detector

    const model = this.#handPoseDetection.SupportedModels.MediaPipeHands
    const detectorConfig = {
      runtime: 'mediapipe', // or 'tfjs',
      // O handposeDetection é o que vai fazer a detecção das mãos, estamos passando uma versão fixa, para caso futuramente ele atualizar a gente não ter problema com sintaxe e etc. Esse modelo vem la da api do tensorflow que tem as subs Apis que são os modelos, e esses modelos foram treinados com videos e imgs de varias posições, e basicamente aqui estamos baixando esse modelo la da google, ou seja usando essa api para nos devolver as posições da mão usadas para treinar a maquina. Com isso, não precisamos treinar a maquina para reconhecer as mãos, ela ja vem com isso tudo pronto para ser usada no front-end sem precisar de fazer um back-end. E por sua vez temos os fingerpose que abstrai mais ainda, evitando a gente precisar conhecer sobre matematica, porque o tensorflow nos retorna uma serie de calculos matematicos. Daria pra treinar mais ainda essa IA se quisesse, mas iremos somente usar a IA pre treinada
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${
        this.#handsVersion
      }`,
      // O full é o mais pesado e o mais preciso, o lite é o mais leve e o mais impreciso para indentificar mãos
      modelType: 'lite', // or 'full'
      maxHands: 2
    }
    this.#detector = await this.#handPoseDetection.createDetector(
      model,
      detectorConfig
    )
    // Retornando o detector das mãos
    return this.#detector
  }
}
