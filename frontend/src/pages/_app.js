import { ApolloProvider } from '@apollo/client';
import client from '../lib/graphql';
import '../styles/chess.css';

export default function App({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
