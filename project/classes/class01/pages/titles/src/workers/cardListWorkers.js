// Recebe msg do service, no caso o maxItems
onmessage = ({ data }) => {
  let counter = 0
  const maxItems = data.maxItems
  console.log('activating blocking operation...', maxItems)
  console.time('blocking-op')
  // blocking function
  // 1e5 = 100.000
  for (; counter < maxItems; counter++) console.log('.')
  console.timeEnd('blocking-op')

  // Envia msg para o service
  postMessage(
    { response: 'READY worker cards list', data: counter }
  )
}