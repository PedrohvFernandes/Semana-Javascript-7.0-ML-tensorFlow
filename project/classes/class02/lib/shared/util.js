// Ele vai servir para trabalhar com webworkers

// Meio que ele verifica se o browser suporta webworkers via type:module e se não suportar ele vai rodar tudo na thread principal. Ele verifica da seguinte forma: Primeiro em tester temos um metodo chamado type, que vai ser a nossa propriedade pro worker, como assim? Por exemplo aqui const cardListWorker = new Worker("./../workers/cardListWorker.js", { type: "module" }) ou new Worker('blob://', {type: "module"}).terminate(), aqui eu passo a propriedade type e nela coloco se vai ser module ou classic(commonjs), dessa formo consigo dizer se o worker vai ser module ou classic. Mas no caso do tester, ele contem uma propriedade type() que é uma função, que seta um true na variavel supports e o get pega essa função type() e passa pra quem esta chamando o objeto tester e detalhe aqui no caso é importante que seja type(), porque a propriedade do worker tem esse nome. Com isso, a gente passa o objeto tester pro worker, e caso o navegador tenha a propriedade type no worker ele usa, se não ai ja passa direto, se colocar o true no type, dessa forma a gente decide se vai instanciar o worker com module ou não. Obs: o mozila suporta o type module via html, na tag script, então não tem problema usar da quela forma. Por exemplo o title usa daquela forma
function supportsWorkerType() {
  let supports = false
  const tester = {
    get type() {
      supports = true
    }
  }
  try {
    // blob:// --> arquivo vazio
    new Worker('blob://', tester).terminate()
  } finally {
    return supports
  }
}
// De quanto em quanto tempo o blinked vai ser verificado
function prepareRunChecker({ timerDelay }) {
  let lastEvent = Date.now()
  return {
    shouldRun() {
      const result = (Date.now() - lastEvent) > timerDelay
      if(result) lastEvent = Date.now()

      return result
    }
  }
}

export { supportsWorkerType, prepareRunChecker }
