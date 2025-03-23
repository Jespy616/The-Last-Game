<script lang="ts">

    import type { Scene } from "phaser";
    import PhaserGame, { type TPhaserRef } from "../../phaser/PhaserGame.svelte";

    //  References to the PhaserGame component (game and scene are exposed)
    let phaserRef: TPhaserRef = { game: null, scene: null};

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Scene) => {}
    
</script>

<div id="app">
    <PhaserGame bind:phaserRef={phaserRef} currentActiveScene={currentScene} />
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
