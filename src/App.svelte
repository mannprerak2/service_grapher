<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import Fuse from "fuse.js";

  import Chip from "./lib/Chip.svelte";
  import GraphArea from "./lib/GraphArea.svelte";
  import { mockData } from "./data/data.js";

  let graph;
  let selectedNode = null;

  let data;

  let fuse;

  let err;

  function isValidData(data) {
    if (data.hasOwnProperty("name") && data.hasOwnProperty("nodes") && data.hasOwnProperty("links") && data.hasOwnProperty("more")) {
      return true;
    } else {
      throw "ERROR [Socket] - invalid data received. `name`, `nodes`, `links` and `more` properties are required.";
    }
  }
  function reset() {
    if (!graph) return;
    selectedNode = null;
    graph.render();
  }

  onMount(async () => {
    let dataServer = new URLSearchParams(window.location.search).get(
      "data-server"
    );
    if (dataServer) {
      try {
        let res = await fetch(dataServer);
        isValidData(res);
        data = res;
      }catch (e) {
        err = `Unable to fetch data from data-server: ${dataServer}. Error: ${e}`
      }
      // TODO:
      data = mockData;
    } else {
      data = mockData;
    }
    // Load search engine.
    fuse = new Fuse(data.nodes, {
      isCaseSensitive: true,
      keys: ["tags", "extra.key", "extra.value"],
    });
  });

  function onSelectNode(n) {
    selectedNode = n;
  }
</script>

{#if err}
  <div style="padding: 20px">{err}</div>
{:else if data}
  <div class="container-table">
    <div id="left-free-area">
      <div
        id="top-bar"
        style="display: flex; flex-direction: row; justify-content: space-between"
      >
        <h2>Service Grapher - {data.name}</h2>
        <div
          style="display: flex; flex-direction: column; justify-content: center"
        >
          <button id="reset-button" on:click={reset}>Reset</button>
        </div>
      </div>
      <div id="main-free-area">
        <GraphArea
          {onSelectNode}
          nodes={data.nodes}
          links={data.links}
          bind:graph
        />
      </div>
    </div>

    <div id="right-fixed-bar">
      {#if selectedNode}
        <div style="display: flex; flex-direction: column;">
          <h1>{selectedNode.label}</h1>
          <div style="display: flex; flex-wrap: wrap">
            {#each selectedNode.tags || [] as tag}
              <Chip content={tag} />
            {/each}
          </div>
          <hr
            style="width:35%;margin-left:0;background-color: var(--divider-color)"
          />
          {#each selectedNode.extra || [] as extra}
            <h2 style="margin-bottom:1px">{extra.key}</h2>
            <div style="margin-bottom:10px">{extra.value}</div>
          {/each}
        </div>
      {:else}
        <h3>Select a node to view more details</h3>
      {/if}
    </div>
  </div>
{/if}

<style>
  .container-table {
    display: table;
    margin: 0 0;
    -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
    -moz-box-sizing: border-box; /* Firefox, other Gecko */
    box-sizing: border-box; /* Opera/IE 8+ */
  }

  #right-fixed-bar {
    width: var(--right-bar-width);
    height: 100%;
    display: table-cell;
    overflow: scroll;
    border-left: 1px solid var(--divider-color);
    margin: 0 0;
    padding: 10px;
  }

  #left-free-area {
    display: table-cell;
    width: calc(100vw - var(--right-bar-width));
    height: 100vh;
    margin: 0 0;
  }

  #top-bar {
    width: 100%;
    height: var(--top-bar-height);
    padding: 10px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  #main-free-area {
    width: 100%;
    height: calc(100vh - var(--top-bar-height));
  }

  #reset-button {
    background-color: transparent;
    height: 2em;
    border: 1px solid var(--divider-color);
    border-radius: 10px;
    cursor: pointer;
    color: var(--divider-color);
  }
</style>
