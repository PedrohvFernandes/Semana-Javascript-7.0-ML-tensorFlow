const { GestureDescription, Finger, FingerCurl } = window.fp

const ScrollDownGesture = new GestureDescription('scroll-down') // ✊️
const ScrollUpGesture = new GestureDescription('scroll-up') // 🖐
const RockAndRollGesture = new GestureDescription('rock-and-roll') // 🤘
const scissorsGesture = new GestureDescription('scissors') // ✂️

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

// Rock and Roll
// -----------------------------------------------------------------------------
for (let finger of [Finger.Thumb, Finger.Index, Finger.Pinky]) {
  RockAndRollGesture.addCurl(finger, FingerCurl.NoCurl, 0.9)

}
// all other fingers: curled
for (let finger of [Finger.Middle, Finger.Ring]) {
  RockAndRollGesture.addCurl(finger, FingerCurl.FullCurl, 0.9)
}

// Scissors
//------------------------------------------------------------------------------

// index and middle finger: stretched out
scissorsGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0)
scissorsGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0)

// ring: curled
scissorsGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0)
scissorsGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.9)

// pinky: curled
scissorsGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0)
scissorsGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.9)

const knowGestures = [ScrollDownGesture, ScrollUpGesture, RockAndRollGesture, scissorsGesture]
const gestureStrings = {
  'scroll-up': '🖐',
  'scroll-down': '✊️',
  'rock-and-roll': '🤘',
  'scissors': '✂️',
}
export { knowGestures, gestureStrings }
