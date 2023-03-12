import * as express from 'express';
import {StatusCodes} from 'http-status-codes';
import {jwtCheck} from '../../middleware/jwt-check';
import {FriendsService} from '../friends-service';

class FriendsRouter {
  constructor(private readonly friendsService: FriendsService) {}

  get router() {
    const router = express.Router();

    router.post('/v1/friend-requests/:to', jwtCheck, async (req, res, next) => {
      try {
        const from = req.auth?.payload.sub;

        const {to} = req.params;

        console.log('create Friend Request received', {from, to});

        const friendRequest = await this.friendsService.createFriendRequest(
          from!,
          to
        );

        console.log('Friend Request created!', friendRequest);

        return res.status(StatusCodes.CREATED).json(friendRequest);
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {FriendsRouter};
