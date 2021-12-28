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

  static deleteByName(name) {
    return `mutation MyMutation {
      delete_todo(where: {title: {_eq: "${name}"}}) {
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
