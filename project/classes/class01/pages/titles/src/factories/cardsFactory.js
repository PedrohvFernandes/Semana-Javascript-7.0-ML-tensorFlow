import CardsController from "./../controllers/cardsController.js"
import CardsView from "./../views/cardsView.js"
import CardsService from "./../services/cardsService.js"

// type: "module" --> o Firefox não entende o import, por isso iremos fazer tanto dessa maneira usando o type:module para usar o webworker no chrome/opera, quanto da maneira que esta em class01>lib>shared>util.js e em factory do video-player para usar sem o webworker, rodando na thread principal no firefox
const cardListWorker = new Worker("./src/workers/cardListWorkers.js", { type: "module" })

const [rootPath] = window.location.href.split('/pages/')
const factory = {
  async initialize() {
    return CardsController.initialize({
      view: new CardsView(),
      service: new CardsService({ 
        dbUrl: `${rootPath}/assets/database.json`,
        cardListWorker
      })
    })
  }
}

export default factory
