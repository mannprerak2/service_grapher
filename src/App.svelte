<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import Fuse from "fuse.js";

  import Chip from "./lib/Chip.svelte";
  import GraphArea from "./lib/GraphArea.svelte";
  import * as data from "./data/data.js";

  let graph;
  let selectedNode = null;
  let allNodes;
  let allLinks;

  let curNodes;
  let curLinks;

  let fuse;

  function reset () {
    if (!graph) return;
    selectedNode = null;
    graph.render();
  }

  onMount(async () => {
    // Load data.
    allNodes = data.nodes;
    allLinks = data.links;

    // Set Data for graph.
    curNodes = allNodes;
    curLinks = allLinks;

    // Load search engine.
    fuse = new Fuse(allNodes, {
      isCaseSensitive: true,
      keys: ["tags", "extra.key", "extra.value"],
    });
  });

  function onSelectNode(n){
    selectedNode = n;
  }
</script>

<div class="container-table">
  <div id="left-free-area">
    <div
      id="top-bar"
      style="display: flex; flex-direction: row; justify-content: space-between">
      <h2>Service Grapher</h2>
      <div style="display: flex; flex-direction: column; justify-content: center">
        <button id="reset-button" on:click={reset}>Reset</button>
      </div>
    </div>
    <div id="main-free-area">
      {#if curNodes}
        <GraphArea {onSelectNode} nodes={curNodes} links={curLinks} bind:graph={graph}/>
      {/if}
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
