<script>
  import { onMount } from "svelte";
  import { Network } from "./newton/network/network.js";
  import { Graph } from "./newton/graph/graph.js";

  import * as data from "./data/data.js";

  onMount(async () => {
    const network = new Network(data.nodes, data.links);
    const graph = new Graph({
      width: window.innerWidth,
      height: window.innerHeight,
      flow: "horizontal",
      // engine: 'd3',
      draggable: true,
      network: network,
    });
    graph.init();

    graph.on("node:click", (n) =>
      graph.highlightDependencies(n, { arrows: true })
    );
  });
</script>

<main>
  <svg class="graph-svg" width="960" height="600" />
</main>

<style>
</style>
