<!-- src/lib/components/BackgroundMusic.svelte -->
<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { page } from '$app/stores';
  import { audioStore } from '$lib/audioStore';
  import { browser } from '$app/environment';
  
  export let menuTrack = '/assets/audio/NoMoreGames.ogg';
  
  // Track the current route and playback state
  let isGamePage = false;
  let hasAttemptedInitialPlay = false;
  
  // Only run subscription logic in browser
  let unsubscribePage: () => void;
  
  // Create a function to attempt playback with multiple strategies
  function attemptPlayback() {
    if (!browser || isGamePage) return;

    
    // Strategy 1: Direct play
    audioStore.play(menuTrack);
    
    // Strategy 2: Delayed play (sometimes helps with timing issues)
    setTimeout(() => {
      audioStore.play(menuTrack);
    }, 500);
  }
  
  onMount(() => {
    if (!browser) return;
    
    
    // Check initial route immediately
    const currentPath = window.location.pathname;
    isGamePage = currentPath === '/game' || currentPath.startsWith('/game/');
    
    // Strategy 3: Wait a moment after mount before trying to play
    setTimeout(() => {
      if (!isGamePage && !hasAttemptedInitialPlay) {
        audioStore.play(menuTrack);
        hasAttemptedInitialPlay = true;
      }
    }, 1000);
    
    // Subscribe to page changes
    unsubscribePage = page.subscribe(($page) => {
      const wasGamePage = isGamePage;
      
      // Update current state
      isGamePage = $page.url.pathname === '/game' || $page.url.pathname.startsWith('/game/');
      
      
      if (isGamePage) {
        audioStore.pause();
      } else {
        // If we're coming from a game page or this is initial load, try harder to play
        if (wasGamePage || !hasAttemptedInitialPlay) {
          attemptPlayback();
          hasAttemptedInitialPlay = true;
        } else {
          audioStore.play(menuTrack);
        }
      }
    });
    
    // Strategy 4: Use any user interaction to enable audio
    const handleInteraction = () => {
      if (!isGamePage) {
        audioStore.play(menuTrack);
        hasAttemptedInitialPlay = true;
      }
    };
    
    // Add multiple event listeners to catch any interaction
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    
    // Also try immediate play
    if (!isGamePage) {
      audioStore.play(menuTrack);
      hasAttemptedInitialPlay = true;
    }
  });
  
  // Try again after any update
  afterUpdate(() => {
    if (browser && !isGamePage && !hasAttemptedInitialPlay) {
      audioStore.play(menuTrack);
      hasAttemptedInitialPlay = true;
    }
  });
  
  onDestroy(() => {
    if (browser && unsubscribePage) {
      unsubscribePage();
    }
  });
</script>

