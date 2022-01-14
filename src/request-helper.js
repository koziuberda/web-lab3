import { errorMessage, requestCounter } from "./store";
class RequestHelper {
  constructor() {
    this.API_URL = HTTP_API_LINK;
  }

  async fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(this.API_URL, {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
      headers: {
        "x-hasura-admin-secret": X_HASURA_ADMIN_SECRET,
      },
    });

    return result.json();
  }
  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyQuery", {});
  }

  async startFetchMyQuery(operationsDoc) {
    requestCounter.update((n) => n + 1);
    const { errors, data } = await this.fetchMyQuery(operationsDoc);
    requestCounter.update((n) => n - 1);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
      throw new Error(errors[0].message);
    }

    // do something great with this precious data
    console.log(data);
    errorMessage.set("");
    return data;
  }

  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyMutation", {});
  }

  async startExecuteMyMutation(operationsDoc) {
    requestCounter.update((n) => n + 1);
    try {
      const { errors, data } = await this.executeMyMutation(operationsDoc);

      if (errors) {
        throw new Error(errors[0].message);
      }

      errorMessage.set("");
      return data;
    } catch (e) {
      errorMessage.set(e.message);
    } finally {
      requestCounter.update((n) => n - 1);
    }
  }
}

export default new RequestHelper();
