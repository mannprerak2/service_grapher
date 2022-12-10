<script>
    import { onMount, onDestroy } from "svelte";

    import { Network } from "../newton/network/network.js";
    import { Graph } from "../newton/graph/graph.js";

    export let nodes;
    export let links;
    export let onSelectNode;

    export let graph;

    onMount(async () => {
        let graphUI = window.document.getElementById("main-free-area");
        graph = new Graph({
            container: '#my-graph',
            width: graphUI.clientWidth,
            height: graphUI.clientHeight,
            margin: 0,
            flow: "horizontal",
            draggable: true,
            network: new Network(nodes, links),
        });
        graph.init();

        graph.on("node:click", (n) => {
            onSelectNode(n);
            graph.highlightDependencies(n, { arrows: true });
        });
    });
    onDestroy(async () => {
        if (!graph) return;
        graph.removeAllListeners();
    });
</script>

<svg class="graph-svg" id="my-graph" />

<style>
</style>
