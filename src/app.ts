import * as express from 'express';
import {auth} from 'express-oauth2-jwt-bearer';
import {Firestore} from '@google-cloud/firestore';
import {WantsService, WantsRouter} from './wants';
import {errorHandler} from './error-handler';
import {config} from './config';

const app = express();

const jwtCheck = auth({
  audience: config.auth0.audience,
  issuerBaseURL: config.auth0.issuerBaseURL,
  tokenSigningAlg: config.auth0.tokenSigningAlg,
});

// enforce on all endpoints
app.use(jwtCheck);

app.use(express.json());

const firestore = new Firestore({
  projectId: config.firestore.projectId,
  ignoreUndefinedProperties: true,
});

const wantsService = new WantsService(firestore);

const wantsRouter = new WantsRouter(wantsService).router;

app.use(wantsRouter);

app.use(
  async (
    err: Error,
    _req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction
  ) => {
    await errorHandler.handleError(err, res);
  }
);

export {app};
