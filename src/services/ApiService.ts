import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApolloQueryResult, FetchPolicy } from '@apollo/client/core';
import {
  AsuntosRelevantesResponse,
  FiltrosAsuntos,
} from '../app/interfaces/asuntos-relevantes.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private apollo: Apollo) {}

  login(username: string, password: string): Observable<any> {
    const LOGIN_QUERY = gql`
      query Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          message
          token
          usuario {
            oid
            nombre
            apellidos
            username
            estado {
              oid
            }
          }
        }
      }
    `;

    return this.apollo
      .query({
        query: LOGIN_QUERY,
        variables: {
          username,
          password,
        },
      })
      .pipe(map((result: any) => result.data.login));
  }

  cargarAsuntosRelevantes(
    filtros: FiltrosAsuntos = {},
    pagina: number = 1,
    limite: number = 20
  ): Observable<AsuntosRelevantesResponse> {
    // Versión simplificada para debugging
    const ASUNTOS_QUERY = gql`
      query {
        getAllAsuntosRelevantes {
          oid
          titulo
          descripcion
          estado {
            oid
            nombre
          }
          nivelEducativo {
            oid
            nombre
          }
          semaforo {
            oid
            nombre
          }
          categoria {
            oid
            nombre
          }
          municipio
          fechaOcurrido
          urlFuente
          destacado
          resuelto
          concentradoPrensa {
            oid
            fechaPublicacion
            fechaOcurrido
            encabezado
            extracto
            urlFuente
            fechaCaptura
          }
        }
      }
    `;

    console.log('Ejecutando query GraphQL...', { filtros, pagina, limite });

    // return this.apollo
    //   .query({
    //     query: ASUNTOS_QUERY,
    //     fetchPolicy: 'network-only' as FetchPolicy,
    //     errorPolicy: 'all',
    //   })
    //   .pipe(
    //     map((result: any) => {
    //       console.log('Respuesta GraphQL:', result);

    //       // Mapear respuesta simplificada a la estructura esperada
    //       const asuntos = result.data.asuntosRelevantes || [];
    //       return {
    //         asuntos: asuntos,
    //         total: asuntos.length,
    //         pagina: 1,
    //         limite: 20,
    //         hasMore: false,
    //       };
    //     })
    //   );

    return this.apollo
      .query<AsuntosRelevantesResponse>({
        query: ASUNTOS_QUERY,
        fetchPolicy: 'network-only',
        context: {
          headers: {
            authorization: localStorage.getItem('Token') || '',
          },
        },
      })
      .pipe(
        map((result: ApolloQueryResult<AsuntosRelevantesResponse>) => {
          console.log('Datos de asuntos relevantes recibidos:', result.data);
          return result.data;
        })
      );
  }

  obtenerAsuntoDetalle(oid: string): Observable<any> {
    const ASUNTO_DETALLE_QUERY = gql`
      query getAsuntoRelevante($oid: String!) {
        getAsuntoRelevante(oid: $oid) {
          oid
          titulo
          descripcion
          estado {
            nombre
          }
          nivelEducativo {
            nombre
          }
          semaforo {
            nombre
          }
          categoria {
            nombre
          }
          municipio
          fechaOcurrido
          destacado
          resuelto
        }
      }
    `;
    return this.apollo
      .query({
        query: ASUNTO_DETALLE_QUERY,
        variables: { oid },
        fetchPolicy: 'network-only' as FetchPolicy,
        errorPolicy: 'all',
        context: {
          headers: {
            authorization: localStorage.getItem('Token') || '',
          },
        },
      })
      .pipe(
        map((result: any) => {
          console.log('📦 Respuesta GraphQL completa para detalle:', result);
          console.log('📄 Datos del asunto:', result.data);
          return result.data;
        })
      );
  }

  changePassword(
    username: string,
    password: string,
    confirmPassword: string,
    oldPassword: string
  ) {
    const changePassword = gql`
      mutation changePassword(
    $username: String!
    $password: String!
    $oldPassword: String!
    $confirmPassword: String!
  ) {
    changePassword(
      username: $username
      password: $password
      oldPassword: $oldPassword
      confirmPassword: $confirmPassword
    )
    `;
    return this.apollo.mutate({
      mutation: changePassword,
      variables: {
        username,
        password,
        confirmPassword,
        oldPassword,
      },
      context: {
        headers: {
          authorization: localStorage.getItem('Token') || '',
        },
      },
    });
  }
}
