import * as express from 'express';
import {celebrate, Joi, Segments} from 'celebrate';
import {StatusCodes} from 'http-status-codes';
import {WantsService} from '../wants-service';
import {jwtCheck} from '../../middleware/jwt-check';

class WantsRouter {
  constructor(private readonly wantsService: WantsService) {}

  get router() {
    const router = express.Router();

    router.post(
      '/v1/wants',
      celebrate({
        [Segments.BODY]: Joi.object()
          .keys({
            title: Joi.string().required(),
            visibility: Joi.alternatives()
              .try(
                Joi.string().valid('public', 'friends'),
                Joi.array().items(Joi.string())
              )
              .required(),
            openToOffers: Joi.boolean().required(),
            when: Joi.date().iso(),
            where: Joi.object().keys({
              address: Joi.string().required(),
              location: Joi.object()
                .keys({
                  lat: Joi.number().min(-90).max(90).required(),
                  lng: Joi.number().min(-180).max(180).required(),
                })
                .required(),
            }),
          })
          .required(),
      }),
      jwtCheck,
      async (req, res, next) => {
        try {
          const creatorId = req.auth?.payload.sub;

          console.log('Create Want request received', {creatorId, ...req.body});

          const {title, visibility, openToOffers, when, where} = req.body;

          const want = await this.wantsService.createWant({
            creatorId: creatorId!,
            title,
            visibility,
            openToOffers,
            when,
            where,
          });

          console.log('Want created!', want);

          return res.status(StatusCodes.CREATED).json(want);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.get('/v1/wants/feed', jwtCheck, async (req, res, next) => {
      try {
        const userId = req.auth?.payload.sub;

        const wantsFeed = await this.wantsService.wantsFeed(userId!);

        return res.json(wantsFeed);
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {WantsRouter};
