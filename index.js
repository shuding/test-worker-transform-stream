addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// When changing this to 5000, you will see 2 chunks being logged via the
// `pipeTo` function below.
const data = '_'.repeat(2000)

async function pipeTo(readable, writable) {
  const reader = readable.getReader()
  const writer = writable.getWriter()

  let chunkId = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      console.log(`Chunk[${chunkId}] piped:`, value)
      if (done) {
        writer.close()
      } else {
        writer.write(value)
      }
    }
  } catch (err) {
    writer.abort(err)
  }
}

async function handleRequest() {
  const source = new TransformStream()
  const sink = new TransformStream()
  
  source.writable.getWriter().write(new TextEncoder().encode(data))
  pipeTo(source.readable, sink.writable)
  
  return new Response(sink.readable, {
    headers: { 'content-type': 'text/plain' },
  })
}
