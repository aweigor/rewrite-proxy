import express, { Express, Request, Response } from 'express';
import routes from '../fixtures/routes.json';
import rewrite from 'express-urlrewrite';
import request from 'request';


export type AppOptions = {
  target?: string
}

export function createApp(options: AppOptions = {}): Express 
{
  const app: Express = express();

  for (const [key, options] of Object.entries(routes)) {
    if (options.rewrite) {
      console.log(`[rewrite]: ${key}, ${options.rewrite}`)
      app.use(rewrite(key, options.rewrite));
    }
  }

  if (options.target) {
    app.use(function(req: Request, res: Response) {
      console.log(`[request]: ${options.target + req.url}`)
      req.pipe(request(options.target + req.url)).pipe(res);
    })
  }

  return app;
}