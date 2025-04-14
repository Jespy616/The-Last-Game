<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import BackgroundMusic from '$lib/components/BackgroundMusic.svelte';
    import { audioStore } from '$lib/audioStore';
    
    // Import your global styles
    import '../app.css';
    
    const menuMusic = '/assets/audio/NoMoreGames.ogg';
    
    // Global interaction handler for audio
    onMount(() => {
      if (!browser) return;
      
      // Function to unlock audio on first user interaction
      const unlockAudio = () => {
        audioStore.forcePlay();
        
        // Remove all event listeners once we've captured an interaction
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      };
      
      // Add event listeners for user interaction
      document.addEventListener('click', unlockAudio);
      document.addEventListener('keydown', unlockAudio);
      document.addEventListener('touchstart', unlockAudio);
    });
</script>

<BackgroundMusic menuTrack={menuMusic} />

<div class="app">
    <header>
        <!-- Your header content -->
    </header>
    <main>
        <slot />
    </main>
</div>

<style>
    /* Your styles */
</style>