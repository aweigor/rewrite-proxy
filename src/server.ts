import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import routes from '../fixtures/routes.json';
import rewrite from 'express-urlrewrite';
import request from 'request';

const config = dotenv.config().parsed as Record<string, unknown> || {};
config['PORT'] = config['PORT'] || 3001;
config['PROXY_URL'] = config['PROXY_URL'] || 'http://127.0.0.1:3000';

const app: Express = express();

for (const [key, options] of Object.entries(routes)) {
  if (options.rewrite) {
    console.log(`[rewrite]: ${key}, ${options.rewrite}`)
    app.use(rewrite(key, options.rewrite));
  }
}

app.use(function(req: Request, res: Response) {
  console.log(`[request]: ${config['PROXY_URL'] + req.url}`)
  req.pipe(request(config['PROXY_URL'] + req.url)).pipe(res);
})

app.listen(config['PORT']);