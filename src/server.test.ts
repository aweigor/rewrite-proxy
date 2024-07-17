import assert from 'node:assert/strict'
import test from 'node:test'
import { createApp } from './server.js'

const routes = {
  "/api/*": {
    "rewrite": "/$1"
  }
}

const PORT = 3000;
const app = createApp({}, routes)

await new Promise<void>((resolve, reject) => {
  try {
    const server = app.listen(PORT, () => resolve())
    test.after(() => server.close())
  } catch (err) {
    reject(err)
  }
})

await test('rewrite', async () => {
  const conditions = [
    {
      'rule': '/api/*',
      'input': '/api/posts',
      'output': '/posts',
    }
  ];

  let supposedReturn: string;

  app.use((req, _) => {
    assert.equal(
      req.url,
      supposedReturn,
      `${req.url} !== ${supposedReturn} assertion failed`,
    )
  })

  for (const  { rule, input, output } of conditions ) {
    supposedReturn = output;
    console.log(`[test]: ${rule}`);
    await fetch(`http://localhost:${PORT}${input}`); 
  }
})
