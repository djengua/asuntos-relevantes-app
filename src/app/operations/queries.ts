import { gql } from 'apollo-angular';

export const login = gql`
  query login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      status
      message
      token
      usuario {
        oid
        nombre
        apellidos
        username
        estado {
          oid
          nombre
          codigo
          latitud
          longitud
        }
      }
    }
  }
`;