import assert from 'node:assert/strict'
import test from 'node:test'
import { createApp } from './server.js'

const routes = {
  "/api/*": "/$1",
  "/:resource/:id/show": "/:resource/:id",
  "/posts/:category": "/posts?category=:category"
}

const PORT_PROXY = 3001;
const PORT_TARGET = 3000;
const proxy = createApp({ target: `http://localhost:${PORT_TARGET}` }, routes)
const target = createApp({}, routes)

await new Promise<void>((resolve, reject) => {
  try {
    const s1 = proxy.listen(PORT_PROXY, () => resolve())
    const s2 = target.listen(PORT_TARGET, () => resolve())
    test.after(() => s1.close() && s2.close())
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
    },
    {
      'rule': '/:resource/:id/show',
      'input': '/user/posts/show',
      'output': '/user/posts',
    },
    {
      'rule': '/posts/:category',
      'input': '/posts/all',
      'output': '/posts?category=all',
    }
  ];

  let supposedReturn: string;

  target.use((req, _) => {
    assert.equal(
      req.url,
      supposedReturn,
      `${req.url} !== ${supposedReturn} assertion failed`,
    )
  })

  for (const  { rule, input, output } of conditions ) {
    supposedReturn = output;
    console.log(`[test]: ${rule}`);
    await fetch(`http://localhost:${PORT_PROXY}${input}`); 
  }
})
