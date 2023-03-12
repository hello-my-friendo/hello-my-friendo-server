import * as express from 'express';
import {celebrate, Segments, Joi} from 'celebrate';
import {StatusCodes} from 'http-status-codes';
import {jwtCheck} from '../../middleware/jwt-check';
import {FriendsService} from '../friends-service';
import {ForbiddenError, NotFoundError} from '../../errors';

class FriendsRouter {
  constructor(private readonly friendsService: FriendsService) {}

  get router() {
    const router = express.Router();

    router.post(
      '/v1/friend-requests',
      celebrate({
        [Segments.BODY]: Joi.object()
          .keys({
            to: Joi.string().required(),
          })
          .required(),
      }),
      jwtCheck,
      async (req, res, next) => {
        try {
          const from = req.auth?.payload.sub;

          const {to} = req.body;

          console.log('Create Friend Request received', {from, ...req.body});

          const friendRequest = await this.friendsService.createFriendRequest(
            from!,
            to
          );

          console.log('Friend Request created!', friendRequest);

          return res.status(StatusCodes.CREATED).json(friendRequest);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.delete(
      '/v1/friend-requests/:id',
      jwtCheck,
      async (req, res, next) => {
        try {
          const userId = req.auth?.payload.sub;

          const {id: friendRequestId} = req.params;

          console.log('Delete Friend Request received', {
            from: userId,
            friendRequestId,
          });

          const friendRequest = await this.friendsService.getFriendRequestById(
            friendRequestId
          );

          if (!friendRequest) {
            throw new NotFoundError(
              `Friend Request ${friendRequestId} not found`
            );
          }

          if (userId !== friendRequest.from) {
            throw new ForbiddenError(
              `User ${userId} cannot delete Friend Request ${friendRequest.id}`
            );
          }

          await this.friendsService.deleteFriendRequest(friendRequest.id);

          console.log('Friend Request deleted!', friendRequestId);

          return res.sendStatus(StatusCodes.NO_CONTENT);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.post(
      '/v1/friend-requests/:id/accept',
      jwtCheck,
      async (req, res, next) => {
        try {
          const userId = req.auth?.payload.sub;

          const {id: friendRequestId} = req.params;

          console.log('Accept Friend Request received', {
            from: userId,
            friendRequestId,
          });

          const friendRequest = await this.friendsService.getFriendRequestById(
            friendRequestId
          );

          if (!friendRequest) {
            throw new NotFoundError(
              `Friend Request ${friendRequestId} not found`
            );
          }

          if (userId !== friendRequest.to) {
            throw new ForbiddenError(
              `User ${userId} cannot accept Friend Request ${friendRequest.id}`
            );
          }

          console.log(
            `Creating frienship between ${friendRequest.from} and ${friendRequest.to}`
          );

          await this.friendsService.createFriendship(
            friendRequest.from,
            friendRequest.to
          );

          console.log(
            `Friend Request ${friendRequestId} accepted, frienship between ${friendRequest.from} and ${friendRequest.to} created!`
          );

          console.log('deleting accepted Friend Request', friendRequestId);

          await this.friendsService.deleteFriendRequest(friendRequestId);

          console.log(`Friend Request ${friendRequestId} deleted!`);

          return res.sendStatus(StatusCodes.CREATED);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.delete(
      '/v1/friends',
      celebrate({
        [Segments.QUERY]: Joi.object()
          .keys({
            userId: Joi.string().required(),
          })
          .required(),
      }),
      jwtCheck,
      async (req, res, next) => {
        try {
          const userId = req.auth?.payload.sub;

          const {userId: friendId} = req.query;

          console.log(
            `Delete frienship between ${userId} and ${friendId} received`
          );

          await this.friendsService.deleteFriendship(
            userId!,
            friendId as string
          );

          console.log(`Frienship between ${userId} and ${friendId} deleted!`);

          res.sendStatus(StatusCodes.NO_CONTENT);
        } catch (err) {
          next(err);
        }
      }
    );

    return router;
  }
}

export {FriendsRouter};
