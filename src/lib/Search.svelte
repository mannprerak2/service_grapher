<script>
    export let onSearch;
    let searchText;
</script>

<div id="search-input-cont">
    <input
        type="text"
        id="search-field"
        placeholder="Search"
        autocomplete="off"
        bind:value={searchText}
        on:input
        on:change={onSearch(searchText)}
    />
</div>

<style>
    #search-input-cont {
        width: 20%;
        display: flex;
        align-items: center;
        margin: 0 0;
    }

    #search-field {
        width: 100%;
        background: transparent;
        border: 1px solid var(--divider-color);
        color: var(--divider-color);
        outline: none;
        border-radius: 5px;
        padding: 8px;
        margin: 0 0;
    }
</style>
