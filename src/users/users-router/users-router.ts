import * as express from 'express';
import {celebrate, Joi, Segments} from 'celebrate';
import {StatusCodes} from 'http-status-codes';
import {UsersService} from '../users-service';
import {jwtCheck} from '../../middleware/jwt-check';
import {NotFoundError} from '../../errors';

class UsersRouter {
  constructor(private readonly usersService: UsersService) {}

  get router() {
    const router = express.Router();

    router.post(
      '/v1/users',
      celebrate({
        [Segments.BODY]: Joi.object().keys({
          userId: Joi.string().required(),
          email: Joi.string().email(),
          name: Joi.string(),
          picture: Joi.string().uri(),
        }),
      }),
      async (req, res, next) => {
        try {
          console.log('Create User request received', req.body);

          const {userId, email, name, picture} = req.body;

          const user = await this.usersService.createUser({
            userId,
            email,
            name,
            picture,
          });

          console.log('User created!', user);

          return res.status(StatusCodes.CREATED).json(user);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.get('/v1/user', jwtCheck, async (req, res, next) => {
      try {
        const userId = req.auth?.payload.sub;

        const user = await this.usersService.getUserById(userId!);

        if (!user) {
          throw new NotFoundError(`User ${userId} not found`);
        }

        return res.json(user);
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {UsersRouter};
