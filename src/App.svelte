<script>
  import { onMount } from "svelte";
  import { Network } from "./newton/network/network.js";
  import { Graph } from "./newton/graph/graph.js";

  import Chip from "./lib/Chip.svelte";
  import * as data from "./data/data.js";

  let graph;
  let selectedNode = null;

  onMount(async () => {
    let graphUI = window.document.getElementById("main-free-area")
    const network = new Network(data.nodes, data.links);
    graph = new Graph({
      width: graphUI.clientWidth,
      height: graphUI.clientHeight,
      margin: 0,
      flow: "horizontal",
      draggable: true,
      network: network,
    });
    graph.init();

    graph.on("node:click", (n) => {
      selectedNode = n;
      graph.highlightDependencies(n, { arrows: true })
    }
    );
  });
</script>

<!-- <main>
  <svg class="graph-svg" width="50vw" />
</main> -->
<div class="container-table">
  <div id="left-free-area">
    <div id="top-bar">
        <h2>Service Grapher</h2>
    </div>
    <svg id="main-free-area" class="graph-svg" />
  </div>

  <div id="right-fixed-bar">
    {#if selectedNode}
      <div style="display: flex; flex-direction: column;">
        <h1>{selectedNode.label}</h1>
        <div style="display: flex; flex-wrap: wraap">
          {#each selectedNode.tags || [] as tag}
            <Chip content={tag}/>
          {/each}
        </div>
        <hr style="width:35%;margin-left:0;background-color: var(--divider-color)">
        {#each Object.entries(selectedNode.extra || {}) as [k, v]}
        <h2 style="margin-bottom:1px">{k}</h2>
        <div style="margin-bottom:10px">{v}</div>
        {/each}
      </div>
    {:else}
      <h3>
        Select a node to view more details
      </h3>
    {/if}
  </div>
</div>

<style>
  .container-table {
    display: table;
    margin: 0 0;
    -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
    -moz-box-sizing: border-box;    /* Firefox, other Gecko */
    box-sizing: border-box;         /* Opera/IE 8+ */
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
</style>
