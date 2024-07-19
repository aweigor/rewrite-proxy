import express, { Express, Request, Response } from 'express';
import rewrite from 'express-urlrewrite';
import request from 'request';

export type AppOptions = {
  target?: string
}

process.env['NO_PROXY'] = "*"

export function createApp(options: AppOptions = {}, routes: Record<string, string>): Express 
{
  const app: Express = express();

  for (const [key, rule] of Object.entries(routes)) {
    if (typeof(rule) === 'string') {
      console.log(`[rewrite]: ${key}, ${rule}`)
      app.use(rewrite(key, rule));
    }
  }

  if (options.target) {
    app.use(function(req: Request, res: Response) {
      console.log(`[request]: ${options.target + req.url}`)
      req.pipe(request(options.target + req.url)).pipe(res);
    })
  } else {
    app.all('*', (_, res) => {
      res.sendStatus(200);
    })
  }

  return app;
}