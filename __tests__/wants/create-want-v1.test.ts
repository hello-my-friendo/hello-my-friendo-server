import 'jest-extended';
import * as request from 'supertest';
import {faker} from '@faker-js/faker';
import {users} from '../utils';
import {app} from '../../src/app';

describe('create want v1', () => {
  let marcusToken = '';

  function makeCreateWantUrl() {
    return '/v1/wants';
  }

  beforeAll(async () => {
    marcusToken = await users.marcus.login();
  });

  test.each<{
    visibility: 'public' | 'friends' | string[];
    openToOffers: boolean;
  }>([
    {visibility: 'public', openToOffers: true},
    {visibility: 'public', openToOffers: false},
    {visibility: 'friends', openToOffers: true},
    {visibility: 'friends', openToOffers: true},
    {
      visibility: [
        users.pricilla.userId,
        users.carlo.userId,
        users.edlaine.userId,
      ],
      openToOffers: true,
    },
    {
      visibility: [
        users.pricilla.userId,
        users.carlo.userId,
        users.edlaine.userId,
      ],
      openToOffers: false,
    },
  ])(
    'when all fields are set should return 201',
    async ({visibility, openToOffers}) => {
      const requestBody = {
        title: faker.lorem.sentence(),
        visibility,
        openToOffers,
        when: faker.date.soon(),
        where: {
          address: faker.address.streetAddress(),
          location: {
            lat: Number.parseFloat(faker.address.latitude()),
            lng: Number.parseFloat(faker.address.longitude()),
          },
        },
      };

      const response = await request(app)
        .post(makeCreateWantUrl())
        .set('authorization', `Bearer ${marcusToken}`)
        .send(requestBody);

      expect(response.statusCode).toBe(201);
      expect(response.body).toStrictEqual({
        want: {
          id: expect.toBeString(),
          creatorId: users.marcus.userId,
          admins: [users.marcus.userId],
          members: [users.marcus.userId],
          title: requestBody.title,
          visibility: requestBody.visibility,
          openToOffers: requestBody.openToOffers,
          when: requestBody.when.toISOString(),
          where: requestBody.where,
          createdAt: expect.toBeDateString(),
          updatedAt: expect.toBeDateString(),
        },
      });
    }
  );
});
