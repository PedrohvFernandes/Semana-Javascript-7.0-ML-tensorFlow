const { GestureDescription, Finger, FingerCurl } = window.fp

const ScrollDownGesture = new GestureDescription('scroll-down') // ✊️
const ScrollUpGesture = new GestureDescription('scroll-up') // 🖐

// Com esses gestos não precisamos fazer calculos matematicos, somente delegar o canto que o dedo vai estar fechado com fingercurl, qual dedo finger.dedo, quais os dedos e com isso passar la no service pro fp, para saber os gestos que foram definidos aqui. Ou seja, montando as regras como humando, falando que se o dedão estiver mais curvado é pra fazer isso, ou se estiver mais aberto aquilo
// Scroll Down
// -----------------------------------------------------------------------------

// thumb: half curled
// accept no curl with a bit lower confidence
ScrollDownGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0)
ScrollDownGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.5)

// all other fingers: curled
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  ScrollDownGesture.addCurl(finger, FingerCurl.FullCurl, 1.0)
  ScrollDownGesture.addCurl(finger, FingerCurl.HalfCurl, 0.9)
}

// Scroll Up
// -----------------------------------------------------------------------------

// no finger should be curled
for (let finger of Finger.all) {
  ScrollUpGesture.addCurl(finger, FingerCurl.NoCurl, 1.0)
}

const knowGestures = [ScrollDownGesture, ScrollUpGesture]
const gestureStrings = {
  'scroll-up': '🖐',
  'scroll-down': '✊️'
}
export { knowGestures, gestureStrings }
