import 'jest-extended';
import * as request from 'supertest';
import {faker} from '@faker-js/faker';
import {users, usersClient} from '../utils';
import {app} from '../../src/app';

describe('create want v1', () => {
  function makeCreateWantUrl() {
    return '/v1/wants';
  }

  let marcusToken = '';

  beforeAll(async () => {
    marcusToken = await usersClient.login(users.marcus);
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
      visibility: [users.pricilla.id, users.carlo.id, users.edlaine.id],
      openToOffers: true,
    },
    {
      visibility: [users.pricilla.id, users.carlo.id, users.edlaine.id],
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
        id: expect.toBeString(),
        creatorId: users.marcus.id,
        admins: [users.marcus.id],
        members: [users.marcus.id],
        title: requestBody.title,
        visibility: requestBody.visibility,
        openToOffers: requestBody.openToOffers,
        when: requestBody.when.toISOString(),
        where: requestBody.where,
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
      });
    }
  );
});
