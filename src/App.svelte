<script>
  import { onMount } from "svelte";
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { getMainDefinition } from "@apollo/client/utilities";
  import { writable } from "svelte/store";

  const offline = writable(false);
  window.onoffline = () => {
    offline.set(true);
  };
  window.ononline = () => {
    offline.set(false);
  };
  function createApolloClient() {
    const headers = {
      "x-hasura-admin-secret": "secret",
    };
    const httpLink = new HttpLink({
      uri: "https://web-lab35.herokuapp.com/v1/graphql",
      headers,
    });
    const cache = new InMemoryCache();
    const wsLink = new WebSocketLink({
      uri: "wss://web-lab35.herokuapp.com/v1/graphql",
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
    const title = prompt("Title?") || "";
    await http.startExecuteMyMutation(OperationDocsStore.addOne(title));
  };

  const deletetodo = async () => {
    const title = prompt("which todo to delete?") || "";
    if (title) {
      await http.startExecuteMyMutation(OperationDocsStore.deleteByName(title));
      // heroes.update(n => n.filter(hero => hero.name!==name))
    }
  };
</script>

<main>
  {#if !$offline}
    {#if $todos.loading}
      <h1>Loading...</h1>
    {:else if $todos.error}
      <h1>{$todos.error}</h1>
    {:else}
      <button on:click={addtodo}>Add new todo</button>
      <button on:click={deletetodo}>Delete todo</button>

      {#each $todos.data.todo as todo}
        <div>
          <p>todo name: {todo.title}</p>
          <p>user id: {todo.user_id}</p>
          <hr />
        </div>
      {/each}
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
