import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';


const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
  fetchOptions: {
    mode: 'cors',
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getGame: {
            // Always refetch from network for AI games
            fetchPolicy: 'network-only',
          },
          isAITurn: {
            // Always refetch from network
            fetchPolicy: 'network-only',
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network', // Always try to get fresh data
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default client;