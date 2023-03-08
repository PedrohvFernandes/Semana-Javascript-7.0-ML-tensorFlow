export default class HandGestureView {
  // Ele pega a função e executa 60 vezes(fps) por segundo
  loop(fn) {
    requestAnimationFrame(fn)
  }

  scrollPage(top){
    scroll({
      top,
      behavior: 'smooth'
    })
  }
}