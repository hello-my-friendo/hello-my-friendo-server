import * as express from 'express';
import {Firestore} from '@google-cloud/firestore';
import {UsersRouter, UsersService} from './users';
import {FriendsRouter, FriendsService} from './friends';
import {WantsService, WantsRouter} from './wants';
import {errorHandler} from './error-handler';
import {config} from './config';

const app = express();

app.use(express.json());

const firestore = new Firestore({
  projectId: config.firestore.projectId,
  ignoreUndefinedProperties: true,
});

const usersService = new UsersService(firestore);
const friendsService = new FriendsService(firestore, usersService);
const wantsService = new WantsService(firestore, usersService);

const usersRouter = new UsersRouter(usersService).router;
const friendsRouter = new FriendsRouter(friendsService).router;
const wantsRouter = new WantsRouter(wantsService).router;

app.use(usersRouter);
app.use(friendsRouter);
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
