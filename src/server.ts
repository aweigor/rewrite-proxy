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
    app.use(rewrite(key, options.rewrite));
  }
}

app.use(function(req: Request, res: Response) {
  console.log(config['PROXY_URL'], "PROXY_URL", req.query)
  req.pipe(request({
    method: 'POST',
    url: 'http://127.0.0.1:3000' + '/index',
    json: true
  }
    )).pipe(res);
})

app.listen(config['PORT']);