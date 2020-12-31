'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createClient;

var _apolloClient = require('@apollo/client');

var _apolloClient2 = _interopRequireDefault(_apolloClient);

var _graphqlTools = require('graphql-tools');

var _graphql = require('graphql');

var _apolloLink = require('apollo-link');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Delay for mock latency
 */
function delay(ms) {
  return new Promise(function (resolve) {
    if (ms === 0) {
      resolve();
    }
    setTimeout(function () {
      resolve();
    }, ms);
  });
}

function createLink(schema) {
  var rootValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var delayMs = 300; // Default
  if (Object.prototype.hasOwnProperty.call(options, 'delayMs') && typeof options.delayMs == 'number') {
    delayMs = options.delayMs;
  }
  return new _apolloLink.ApolloLink(function (operation) {
    return new _apolloLink.Observable(function (observer) {
      var query = operation.query,
          operationName = operation.operationName,
          variables = operation.variables;

      delay(delayMs).then(function () {
        return (0, _graphql.graphql)(schema, (0, _graphql.print)(query), rootValue, context, variables, operationName);
      }).then(function (result) {
        observer.next(result);
        observer.complete();
      }).catch(observer.error.bind(observer));
    });
  });
}

function createClient(_ref) {
  var rootValue = _ref.rootValue,
      context = _ref.context,
      typeDefs = _ref.typeDefs,
      mocks = _ref.mocks,
      typeResolvers = _ref.typeResolvers,
      cacheOptions = _ref.cacheOptions,
      apolloClientOptions = _ref.apolloClientOptions,
      apolloLinkOptions = _ref.apolloLinkOptions,
      resolverValidationOptions = _ref.resolverValidationOptions,
      _ref$links = _ref.links,
      links = _ref$links === undefined ? function () {
    return [];
  } : _ref$links;

  var schema = (0, _graphqlTools.makeExecutableSchema)({ typeDefs: typeDefs, resolverValidationOptions: resolverValidationOptions });

  var mockOptions = {};

  if (!!mocks) {
    mockOptions = {
      schema: schema,
      mocks: mocks
    };

    (0, _graphqlTools.addMockFunctionsToSchema)(mockOptions);
  }

  if (!!typeResolvers) {
    (0, _graphqlTools.addResolveFunctionsToSchema)({ schema: schema, resolvers: typeResolvers });
  }

  var cache = new _apolloClient.InMemoryCache(cacheOptions);

  return new _apolloClient2.ApolloClient(_extends({
    addTypename: true,
    cache: cache,
    link: _apolloLink.ApolloLink.from([].concat(_toConsumableArray(links(cache)), [createLink(schema, rootValue, context, apolloLinkOptions)])),
    connectToDevTools: true
  }, apolloClientOptions));
}
