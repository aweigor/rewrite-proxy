import express, { Express, Request, Response } from 'express';
import rewrite from 'express-urlrewrite';
import request from 'request';


export type AppOptions = {
  target?: string
}

export type RouteOptions = {
  rewrite: string
}

process.env['NO_PROXY'] = "*"

export function createApp(options: AppOptions = {}, routes: Record<string, RouteOptions>): Express 
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