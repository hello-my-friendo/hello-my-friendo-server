import axios from 'axios';
import {config} from '../../src/config';

class User {
  private token?: string = undefined;

  constructor(
    readonly email: string,
    readonly password: string,
    readonly userId: string
  ) {}

  async login(): Promise<string> {
    if (this.token) {
      return this.token!;
    }

    const options = {
      method: 'POST',
      url: `${config.auth0.issuerBaseURL}/oauth/token`,
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      data: new URLSearchParams({
        grant_type: 'password',
        username: this.email,
        password: this.password,
        audience: config.auth0.audience,
        client_id: config.auth0.clientId,
        client_secret: config.auth0.clientSecret,
      }),
    };

    const {
      data: {access_token},
    } = await axios.request(options);

    this.token = access_token;

    return this.token!;
  }
}

const marcus = new User(
  'marcus@example.com',
  'Pass123@',
  'auth0|6409669dfbe4cb353d1dfb90'
);
const pricilla = new User(
  'pricilla@example.com',
  'Pass123@',
  'auth0|640ab25081db919440fa329d'
);
const carlo = new User(
  'carlo@example.com',
  'Pass123@',
  'auth0|640ab27021920f8d342b3115'
);
const edlaine = new User(
  'edlaine@example.com',
  'Pass123@',
  'auth0|640ab28f136d6c9ffd630cb8'
);

export {marcus, pricilla, carlo, edlaine};
