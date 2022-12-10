<script>
  import { onMount } from "svelte";
  import { Network } from "./newton/network/network.js";
  import { Graph } from "./newton/graph/graph.js";

  import * as data from "./data/data.js";

  let graph;

  onMount(async () => {
    let graphUI = window.document.getElementById("main-free-area")
    const network = new Network(data.nodes, data.links);
    graph = new Graph({
      width: graphUI.clientWidth,
      height: graphUI.clientHeight,
      margin: 0,
      flow: "horizontal",
      // engine: 'd3',
      draggable: true,
      network: network,
    });
    graph.init();

    graph.on("node:click", (n) => {
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
    height: 100vh;
    display: table-cell;
    overflow: scroll;
    height: 100%;
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
    -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
    -moz-box-sizing: border-box;    /* Firefox, other Gecko */
    box-sizing: border-box;         /* Opera/IE 8+ */
  }

  #main-free-area {
    width: 100%;
    height: calc(100vh - var(--top-bar-height));
  }
</style>
