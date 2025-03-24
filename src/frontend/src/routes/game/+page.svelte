<script lang="ts">
    import { onMount } from "svelte";
    import type { Scene } from "phaser";
    import PhaserGame, { type TPhaserRef } from "../../phaser/PhaserGame.svelte";

    // References to the PhaserGame component (game and scene are exposed)
    let phaserRef: TPhaserRef = { game: null, scene: null };

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Scene) => {};

    // Ensure PhaserGame logic runs only on the client
    let isClient = false;
    onMount(() => {
        isClient = true;
    });
</script>

<div id="app">
    {#if isClient}
        <PhaserGame bind:phaserRef={phaserRef} currentActiveScene={currentScene} />
    {/if}
    <!-- Insert Page Content Here -->
</div>

<style>
    #app {
        width: 100%;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>