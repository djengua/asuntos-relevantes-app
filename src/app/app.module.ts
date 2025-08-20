import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Importaciones de Apollo
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Apollo, // Proporcionar Apollo como servicio
    HttpLink, // Proporcionar HttpLink como servicio
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {
    // Configurar Apollo aquí
    const httpUri = 'http://localhost:5008/graphql'; // Usar URL completa

    const authLink = setContext(async (_, { headers }) => {
      const token = localStorage.getItem('token');
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });

    const http = httpLink.create({
      uri: httpUri,
      withCredentials: false,
    });

    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach((err) => console.error('[GraphQL error]', err));
      if (networkError) console.error('[Network error]', networkError);
    });

    const cache = new InMemoryCache();

    const link = ApolloLink.from([errorLink, authLink, http]);

    apollo.create({
      link,
      cache,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
        query: {
          fetchPolicy: 'network-only',
        },
        mutate: {
          errorPolicy: 'all',
        },
      },
    });
  }
}
