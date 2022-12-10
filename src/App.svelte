<script>
  import { onMount } from "svelte";
  import { Network } from "./newton/network/network.js";
  import { Graph } from "./newton/graph/graph.js";

  import * as data from "./data/data.js";

  onMount(async () => {
    let graphUI = window.document.getElementById("main-free-area")
    const network = new Network(data.nodes, data.links);
    const graph = new Graph({
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
        TOP AREA
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
  }

  #right-fixed-bar {
    width: 20vw;
    height: 100vh;
    display: table-cell;
    overflow: scroll;
    height: 100%;
    border-left: 1px solid gray;
    margin: 0 0;
    padding: 10px;
  }

  #left-free-area {
    display: table-cell;
    width: 80vw;
    height: 100vh;
    margin: 0 0;
  }

  #top-bar {
    width: 100%;
    height: 10vh;
    border-bottom: 1px solid gray;
  }

  #main-free-area {
    width: 100%;
    height: 90vh;
  }
</style>
