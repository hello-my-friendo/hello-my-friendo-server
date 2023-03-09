import axios from 'axios';
import {config} from '../../src/config';

class User {
  private token?: string = undefined;

  constructor(readonly username: string, readonly password: string) {}

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
        username: this.username,
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

const user1 = new User('regular-user-1@example.com', 'Pass123@');

export {user1};
