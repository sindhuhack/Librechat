const {
  CacheKeys,
  envVarRegex,
  EModelEndpoint,
  FetchTokenConfig,
  extractEnvVariable,
} = require('librechat-data-provider');
const { getUserKey, checkUserKeyExpiry } = require('~/server/services/UserService');
const getCustomConfig = require('~/server/services/Config/getCustomConfig');
const { fetchModels } = require('~/server/services/ModelService');
const getLogStores = require('~/cache/getLogStores');
const { isUserProvided } = require('~/server/utils');
const { OpenAIClient } = require('~/app');

const { PROXY } = process.env;

const initializeClient = async ({ req, res, endpointOption }) => {
  const { key: expiresAt, endpoint } = req.body;
  const customConfig = await getCustomConfig();
  if (!customConfig) {
    throw new Error(`Config not found for the ${endpoint} custom endpoint.`);
  }

  const { endpoints = {} } = customConfig;
  const customEndpoints = endpoints[EModelEndpoint.custom] ?? [];
  const endpointConfig = customEndpoints.find((endpointConfig) => endpointConfig.name === endpoint);

  const CUSTOM_API_KEY = extractEnvVariable(endpointConfig.apiKey);
  const CUSTOM_BASE_URL = extractEnvVariable(endpointConfig.baseURL);

  let resolvedHeaders = {};
  if (endpointConfig.headers && typeof endpointConfig.headers === 'object') {
    Object.keys(endpointConfig.headers).forEach((key) => {
      resolvedHeaders[key] = extractEnvVariable(endpointConfig.headers[key]);
    });
  }

  if (CUSTOM_API_KEY.match(envVarRegex)) {
    throw new Error(`Missing API Key for ${endpoint}.`);
  }

  if (CUSTOM_BASE_URL.match(envVarRegex)) {
    throw new Error(`Missing Base URL for ${endpoint}.`);
  }

  const userProvidesKey = isUserProvided(CUSTOM_API_KEY);
  const userProvidesURL = isUserProvided(CUSTOM_BASE_URL);

  let userValues = null;
  if (expiresAt && (userProvidesKey || userProvidesURL)) {
    checkUserKeyExpiry(
      expiresAt,
      `Your API values for ${endpoint} have expired. Please configure them again.`,
    );
    userValues = await getUserKey({ userId: req.user.id, name: endpoint });
    try {
      userValues = JSON.parse(userValues);
    } catch (e) {
      throw new Error(`Invalid JSON provided for ${endpoint} user values.`);
    }
  }

  let apiKey = userProvidesKey ? userValues.apiKey : CUSTOM_API_KEY;
  let baseURL = userProvidesURL ? userValues.baseURL : CUSTOM_BASE_URL;

  if (!apiKey) {
    throw new Error(`${endpoint} API key not provided.`);
  }

  if (!baseURL) {
    throw new Error(`${endpoint} Base URL not provided.`);
  }

  const cache = getLogStores(CacheKeys.TOKEN_CONFIG);
  const tokenKey =
    !endpointConfig.tokenConfig && (userProvidesKey || userProvidesURL)
      ? `${endpoint}:${req.user.id}`
      : endpoint;
  let endpointTokenConfig = !endpointConfig.tokenConfig && (await cache.get(tokenKey));
  if (
    FetchTokenConfig[endpoint.toLowerCase()] &&
    endpointConfig &&
    endpointConfig.models.fetch &&
    !endpointTokenConfig
  ) {
    await fetchModels({ apiKey, baseURL, name: endpoint, user: req.user.id, tokenKey });
    endpointTokenConfig = await cache.get(tokenKey);
  }

  const customOptions = {
    headers: resolvedHeaders,
    addParams: endpointConfig.addParams,
    dropParams: endpointConfig.dropParams,
    titleConvo: endpointConfig.titleConvo,
    titleModel: endpointConfig.titleModel,
    forcePrompt: endpointConfig.forcePrompt,
    summaryModel: endpointConfig.summaryModel,
    modelDisplayLabel: endpointConfig.modelDisplayLabel,
    titleMethod: endpointConfig.titleMethod ?? 'completion',
    contextStrategy: endpointConfig.summarize ? 'summarize' : null,
    endpointTokenConfig,
  };

  const clientOptions = {
    reverseProxyUrl: baseURL ?? null,
    proxy: PROXY ?? null,
    req,
    res,
    ...customOptions,
    ...endpointOption,
  };

  const client = new OpenAIClient(apiKey, clientOptions);
  return {
    client,
    openAIApiKey: apiKey,
  };
};

module.exports = initializeClient;
