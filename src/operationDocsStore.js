import { gql } from "@apollo/client";

export default class OperationDocsStore {
  static getAll() {
    return `query MyQuery {
      todo {
        id
        title
        user_id
      }
    }`;
  }

  static addOne(name) {
    return `mutation MyMutation {
      insert_todo_one(object: {title: "${name}"}) {
        id
        title
        user_id
      }
    }
    `;
  }

  static deleteById(id) {
    return `mutation MyMutation {
      delete_todo(where: {id: {_eq: "${id}"}}) {
        affected_rows
      }
    }`;
  }

  static subscribeToAll() {
    return gql`
      subscription MySubscription {
        todo {
          id
          title
          user_id
        }
      }
    `;
  }
}
