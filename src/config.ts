import {Joi} from 'celebrate';

const envVarsSchema = Joi.object()
  .keys({
    AUTH0_AUDIENCE: Joi.string().required(),
    AUTH0_ACCOUNT: Joi.string().required(),
    AUTH0_DOMAIN: Joi.string().required(),
    AUTH0_ISSUER_BASE_URL: Joi.string().uri().required(),
    AUTH0_TOKEN_SIGNING_ALG: Joi.string().required(),
    AUTH0_TEST_CLIENT_ID: Joi.string(),
    AUTH0_TEST_CLIENT_SECRET: Joi.string(),
    FIRESTORE_PROJECT_ID: Joi.string().required(),
    PORT: Joi.number().integer().required(),
  })
  .unknown();

const {value: envVars, error} = envVarsSchema.validate(process.env);

if (error) {
  throw error;
}

const config = {
  auth0: {
    audience: envVars.AUTH0_AUDIENCE,
    account: envVars.AUTH0_ACCOUNT,
    domain: envVars.AUTH0_DOMAIN,
    issuerBaseURL: envVars.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: envVars.AUTH0_TOKEN_SIGNING_ALG,
    testClientId: envVars.AUTH0_TEST_CLIENT_ID,
    testClientSecret: envVars.AUTH0_TEST_CLIENT_SECRET,
  },
  firestore: {
    projectId: envVars.FIRESTORE_PROJECT_ID,
  },
  port: envVars.PORT,
};

export {config};
