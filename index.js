const http = require('http')

function compose(middlewares) {
  return ctx => {
    const dispatch = (i) => {
      const middleware = middlewares[i]
      if (i === middlewares.length) {
        return
      }
      return middleware(ctx, () => dispatch(i + 1))
    }
    return dispatch(0)
  }
}

class Application {
  constructor() {
    this.middlewares = []
  }

  listen(...args) {
    const server = http.createServer(async (req, res) => {
      const ctx = new Context(req, res)
      const fn = compose(this.middlewares)
      try {
        await fn(ctx)
      } catch (error) {
        console.error(error)
        ctx.res.statusCode = 500
        ctx.res.end('Server Error')
      }
      ctx.res.end(ctx.body)
    })
    server.listen(...args)
  }

  use(middleware) {
    this.middlewares.push(middleware)
  }
}

class Context {
  constructor(req, res) {
    this.req = req
    this.res = res
  }
}

const app = new Application()
app.use(async (ctx, next) => {
  console.log('middleware 1 start')
  await next()
  console.log('middleware 1 end')
})

app.use(async (ctx, next) => {
  console.log('middleware 2 start')
  await next()
  console.log('middleware 2 end')
  ctx.body = 'hello world'
})
app.listen(8086)
