// graphql.module.ts (alternativa)
import { NgModule, ModuleWithProviders } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import {
  ApolloClientOptions,
  InMemoryCache,
  ApolloLink,
  DefaultOptions,
} from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpUri = '/graphql';

function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  const authLink = setContext(async (_, { headers }) => {
    const token = localStorage.getItem('token');
    return {
      headers: { ...headers, authorization: token ? `Bearer ${token}` : '' },
    };
  });

  const http = httpLink.create({ uri: httpUri, withCredentials: false });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach((err) => console.error('[GraphQL error]', err));
    if (networkError) console.error('[Network error]', networkError);
  });

  const cache = new InMemoryCache();

  const defaultOptions: DefaultOptions = {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    query: { fetchPolicy: 'network-only' },
    mutate: { errorPolicy: 'all' },
  };

  const link = ApolloLink.from([errorLink, authLink, http]);

  return { link, cache, defaultOptions };
}

@NgModule({})
export class GraphQLModule {
  static forRoot(): ModuleWithProviders<GraphQLModule> {
    return {
      ngModule: GraphQLModule,
      providers: [
        { provide: APOLLO_OPTIONS, useFactory: createApollo, deps: [HttpLink] },
      ],
    };
  }
}
