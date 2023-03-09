import * as express from 'express';
import {celebrate, Joi, Segments} from 'celebrate';
import {StatusCodes} from 'http-status-codes';
import {WantsService} from './wants-service';
import {CreateWantResponse} from './dtos';

class WantsRouter {
  constructor(private readonly wantsService: WantsService) {}

  get router() {
    const router = express.Router();

    router.post(
      '/v1/wants',
      celebrate({
        [Segments.BODY]: Joi.object()
          .keys({
            body: Joi.string().required(),
            start: Joi.date().iso().required(),
            location: Joi.object().keys({
              lat: Joi.number().min(-90).max(90).required(),
              lng: Joi.number().min(-180).max(180).required(),
            }),
            end: Joi.date().iso(),
          })
          .required(),
      }),
      async (req, res, next) => {
        try {
          const userId = req.auth?.payload.sub;

          const {body, start, location, end} = req.body;

          console.log('create Want request received', {userId, ...req.body});

          const want = await this.wantsService.createWant(
            userId!,
            body,
            start,
            location,
            end
          );

          console.log('Want created!', want);

          const responseBody = new CreateWantResponse(want);

          return res.status(StatusCodes.CREATED).json(responseBody);
        } catch (err) {
          return next(err);
        }
      }
    );

    return router;
  }
}

export {WantsRouter};
