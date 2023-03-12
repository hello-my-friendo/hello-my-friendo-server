import {auth} from 'express-oauth2-jwt-bearer';
import {config} from '../config';

const jwtCheck = auth({
  audience: config.auth0.audience,
  issuerBaseURL: config.auth0.issuerBaseURL,
  tokenSigningAlg: config.auth0.tokenSigningAlg,
});

export {jwtCheck};
