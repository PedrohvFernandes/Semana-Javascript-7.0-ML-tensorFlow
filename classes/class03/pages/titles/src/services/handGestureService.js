// Essa lista faz parte da logica para fazer o dont
const pair = new Set() // é uma lista que não aceita repetição
export default class HandGestureService {
  // O fp passado la na factorie
  #gestureEstimator
  // O modelo de detecção de mãos passado la na factorie
  #handPoseDetection
  // A vesão do modelo passado la na factorie
  #handsVersion
  // Futuro detector de gestos usado la em baixo em initializeDetector
  #detector = null

  #gestureStrings

  #base = ['Horizontal ', 'Diagonal Up ']
  #dont = {
    // Mão esquerda pro lado direito
    left: [...this.#base].map(i => i.concat('Right')),
    // Mão direita pro lado esquerdo
    right: [...this.#base].map(i => i.concat('Left'))
  }

  constructor({
    fingerpose,
    handPoseDetection,
    handsVersion,
    knowGestures,
    gestureStrings
  }) {
    this.#gestureEstimator = new fingerpose.GestureEstimator(knowGestures)
    this.#handPoseDetection = handPoseDetection
    this.#handsVersion = handsVersion
    this.#gestureStrings = gestureStrings
  }

  async estimate(keypoints3D) {
    const predictions = await this.#gestureEstimator.estimate(
      this.#getLandMarksFromKeyPoints(keypoints3D),
      // Porcentagem de confiança do geto(90%) que ele tem que ter para retornar o resultado
      9
    )
    return { gestures: predictions.gestures, poseData: predictions.poseData }
  }

  // Verifica se tem as duas mãos e se estão fazendo o mesmo gesto
  #checkGestureCombination(chosenHand, poseData) {
    // console.log({ 'ChoseHand: ': chosenHand, 'Pose data: ': poseData })
    const addToPairIfCorrect = chosenHand => {
      const containsHand = poseData.some(finger => {
        // console.log('finger ', finger[2])
        // console.log(this.#dont[chosenHand])
        return this.#dont[chosenHand].includes(finger[2])
      })

      if (!containsHand) return
      pair.add(chosenHand)
    }

    addToPairIfCorrect(chosenHand)
    // O tamanho do pair tem que ser dois, ou seja duas mãos left e right
    // Se estiver com as duas mãos ele coloca o emoji dont na tela la na view e aqui no log
    // A validaçao do tamanho do pair fizemos direto na view, mas aqui no service podemos fazer tbm
    if (pair.size !== 2) return
    console.log(this.#gestureStrings.dont)
    // resultLayer.left.innerText = resultLayer.right.innerText =
    // this.#gestureStrings.dont
    // console.log(poseData)
    pair.clear()
    return this.#gestureStrings.dont
  }

  // Async interator, ele vai retornar o valor a medida que ele vai sendo chamado
  // Função para validar se esta funcionando
  // Eu recebo o retorno do tensorflow, que estava sendo logado na função estimateHands do service, usado la no controller. Com esse retorno mandamos as hands que contem cada mão, com os seus keypoints3D la do controller para o fp atraves daqui usando a função estimate usada na controller e o fp vai retornar o resultado na função estime, ja com os gestos pre setados la no util/gestures.js e passados aqui no service diretamente no FP que recebemos la da factory e usamos na gestureEstimator que é usada na estimate
  async *detectGestures(predictions) {
    // Cada mão que foi passada la no controller, por uma função daqui estimateHands
    for (const hand of predictions) {
      if (!hand.keypoints3D) continue

      const { gestures, poseData } = await this.estimate(hand.keypoints3D)
      // console.log(gestures)
      // Dessa forma ela da continue e não da erro algum, não retornando o gesto não encontrado, ou seja um array vazio la para a controller ou para quem chamou esse array.
      if (!gestures.length) continue // Se nao tiver nenhum gesto, ele vai continuar, não retorna nada. Pode fazer aqui, quanto na view.
      // console.log({gestures})

      const result = gestures.reduce((previous, current) => {
        return previous.score > current.score ? previous : current
      })

      // Aqui ele vai pegar a posição do o indicador, na verdade a ponto do dedo do indicador e com base nela temos o x e o y que é a posição que esta a mão na camera. Obs: lembrando cada junta possui array de posição, cada dedo possui 4 juntas, e no array de mãos podemos receber duas
      const { x, y } = hand.keypoints.find(
        keypoint => keypoint.name === 'index_finger_tip'
      )
      let event = result.name
      let handDirection = hand.handedness.toLowerCase()

      // O result.name retorna pra a gente o nome do gesto, lembrando que ele retorna mais coisas da lib fp. O name vai servir como chave, para ele retornar o valor que esta na chave gestureString, uma img, um emoji etc
      // console.log('detected: ', this.#gestureStrings[result.name], x, y)
      // console.log(hand)
      // Iremos usar algo de uma função interator: yield, que vai retornar o valor a medida que ele for sendo chamado. Passei na primeira interação, encontrei o item e vamos retornar para quem chamou e depois ele faz o proximo for e assim por diante. O yield é usado para retornar um valor a medida que ele for sendo chamado. Aqui ne caso é quando fizermos um gesto, ele vai retornar o nome do gesto, a posição x e y
      if (this.#gestureStrings[result.name] !== this.#gestureStrings.dont) {
        yield {
          event: event,
          x,
          y,
          handDirection: handDirection,
          gestureStrings: this.#gestureStrings[result.name],
          gestureStringsObject: this.#gestureStrings
        }
        continue
      }
      let dontGesture = this.#checkGestureCombination(handDirection, poseData)
      yield {
        event: event,
        x,
        y,
        handDirection: handDirection,
        gestureStrings: this.#gestureStrings[result.name],
        gestureStringsObject: this.#gestureStrings,
        // Um metodo de combinação de duas mãos pra fazer o dont
        // Verifica se tem as duas mãos e se estão fazendo o mesmo gesto, preenchendo o pair
        dontGesture
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
