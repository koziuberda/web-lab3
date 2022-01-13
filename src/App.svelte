<script>
  import { onMount } from "svelte";
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { getMainDefinition } from "@apollo/client/utilities";
  import { writable } from "svelte/store";
  import { errorMessage, requestCounter } from "./store";

  const offline = writable(false);
  window.onoffline = () => {
    $offline = true;
  };
  window.ononline = () => {
    $offline = false;
  };

  const todoInfo = {};

  function createApolloClient() {
    const headers = {
      "x-hasura-admin-secret": X_HASURA_ADMIN_SECRET,
    };
    const httpLink = new HttpLink({
      uri: HTTP_API_LINK,
      headers,
    });
    const cache = new InMemoryCache({
      typePolicies: {
        Subscription: {
          fields: {
            todo: {
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    });
    const wsLink = new WebSocketLink({
      uri: WS_API_LINK,
      options: {
        reconnect: true,
        connectionParams: {
          headers,
        },
      },
    });
    const link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink,
    );
    return new ApolloClient({
      link,
      cache,
    });
  }

  const client = createApolloClient();
  setClient(client);
  const todos = subscribe(OperationDocsStore.subscribeToAll());

  const addtodo = async () => {
    const { title } = todoInfo;
    try {
      await http.startExecuteMyMutation(OperationDocsStore.addOne(title));
    } catch (e) {
      $errorMessage = e.message;
    }
  };

  const deletetodo = async (id) => {
    try {
      await http.startExecuteMyMutation(OperationDocsStore.deleteById(id));
    } catch (e) {
      $errorMessage = e.message;
    }
  };
</script>

<main>
  {#if !$offline}
    {#if $todos.loading || $requestCounter}
      <h1>Loading...</h1>
    {:else if $todos.error || $errorMessage}
      <h1>{$todos.error || $errorMessage}</h1>
    {:else}
      <div>
        <input placeholder="Input todo title" bind:value={todoInfo.title} />
        <button on:click={addtodo}>Add new todo</button>
      </div>
      {#if $todos.data.todo.length}
        {#each $todos.data.todo as todo (todo.id)}
          <div>
            <p>todo name: {todo.title}</p>
            <button on:click={() => deletetodo(todo.id)}>Delete todo</button>
            <hr />
          </div>
        {/each}
      {:else}
        <h1>No todos here! Create one first</h1>
      {/if}
    {/if}
  {:else}
    <h1>You are offline</h1>
  {/if}
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }
</style>
