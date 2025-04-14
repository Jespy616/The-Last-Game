import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface AudioState {
  isPlaying: boolean;
  currentTrack: string | null;
  volume: number;
  error: string | null;
  currentTime?: number;
  loopInfo?: {
    isInLoop: boolean;
    nextLoopPoint: number;
  };
}

function createAudioStore() {
  // Set a lower default volume
  const DEFAULT_VOLUME = 0.2;
  
  // Initialize with default state
  const { subscribe, set, update } = writable<AudioState>({
    isPlaying: false,
    currentTrack: null,
    volume: DEFAULT_VOLUME,
    error: null
  });

  // Create audio element only in browser
  let audio: HTMLAudioElement | null = null;
  
  // Loop points state
  let introMarker: {start: number, end: number} | null = null;
  let loopMarker: {start: number, end: number} | null = null;
  let isInLoop = false;
  let timeUpdateListener: (() => void) | null = null;
  let loopCheckInterval: number | null = null;
  
  // More precise loop checking with requestAnimationFrame
  function startPreciseLoopChecking(audioElement: HTMLAudioElement) {
    if (loopCheckInterval) {
      clearInterval(loopCheckInterval);
      loopCheckInterval = null;
    }
    
    // Check more frequently than timeupdate events
    loopCheckInterval = window.setInterval(() => {
      checkLoopPoints(audioElement);
      
      // Update current time in store for debugging
      update(state => ({
        ...state, 
        currentTime: audioElement.currentTime,
        loopInfo: {
          isInLoop,
          nextLoopPoint: isInLoop ? 
            (loopMarker ? loopMarker.end : 0) : 
            (introMarker ? introMarker.end : 0)
        }
      }));
    }, 50); // Check every 50ms
  }
  
  // Function to check and handle loop points
  function checkLoopPoints(audioElement: HTMLAudioElement) {
    if (!audioElement) return;
    
    // If we're in the intro section
    if (!isInLoop && introMarker && audioElement.currentTime >= introMarker.end) {
      // Intro finished, jump to loop start
      audioElement.currentTime = loopMarker!.start;
      isInLoop = true;
    }
    // If we're in the loop section and reached the end
    else if (isInLoop && loopMarker && audioElement.currentTime >= loopMarker.end - 0.1) {
      // Loop back to start (with a small buffer)
      audioElement.currentTime = loopMarker.start;
    }
  }
  
  // Setup loop points based on track
  function setupLoopPoints(trackKey: string, audioElement: HTMLAudioElement) {
    // Remove any existing timeupdate listener
    if (timeUpdateListener && audioElement) {
      audioElement.removeEventListener('timeupdate', timeUpdateListener);
      timeUpdateListener = null;
    }
    
    // Clear any existing interval
    if (loopCheckInterval) {
      clearInterval(loopCheckInterval);
      loopCheckInterval = null;
    }


    // Define loop points based on track
    if (trackKey === "NoMoreGames") {
      introMarker = { start: 0, end: 2.25 };
      loopMarker = { start: 2.65, end: 151.7 }; // End timestamp
      isInLoop = false;
      
      
      // Start precise loop checking
      startPreciseLoopChecking(audioElement);
      
      // Also keep the timeupdate listener as a backup
      timeUpdateListener = () => checkLoopPoints(audioElement);
      audioElement.addEventListener('timeupdate', timeUpdateListener);
    } else {
      // Default behavior for other tracks - normal looping
      introMarker = null;
      loopMarker = null;
      isInLoop = false;
    }
  }
  
  // Initialize audio lazily to ensure it's created after browser is ready
  function getAudio(): HTMLAudioElement | null {
    if (!browser) return null;
    
    if (!audio) {
      try {
        audio = new Audio();
        audio.loop = true;  // Default looping still enabled
        
        // IMPORTANT: Set initial volume here
        audio.volume = DEFAULT_VOLUME;
        
        // Add error event listener
        audio.addEventListener('error', (e) => {
          update(state => ({...state, error: `Error: ${e.type}`}));
        });
        
        // Add state change listeners
        audio.addEventListener('play', () => {
          // Make sure volume is correct when playback starts
          if (audio) audio.volume = DEFAULT_VOLUME;
          update(state => ({...state, isPlaying: true}));
        });
        
        audio.addEventListener('pause', () => {
          update(state => ({...state, isPlaying: false}));
        });
        
      } catch (e) {
        update(state => ({...state, error: `Init error: ${e}`}));
        return null;
      }
    }
    
    return audio;
  }

  return {
    subscribe,
    play: (track: string) => {
      if (!browser) return;
      
      
      const audioElement = getAudio();
      if (!audioElement) {
        update(state => ({...state, error: 'No audio element'}));
        return;
      }
      
      // Get current volume from store
      let currentVolume = DEFAULT_VOLUME;
      subscribe(state => {
        currentVolume = state.volume;
      })();
      
      // Ensure volume is set before playing
      audioElement.volume = currentVolume;
      
      update(state => {
        // Only change source if track changed
        if (state.currentTrack !== track) {
          audioElement.src = track;
          audioElement.currentTime = 0;
          
          // Extract track key from path
          const trackKey = track.split('/').pop()?.split('.')[0] || '';
          
          // Disable built-in loop if we're using custom loop points
          if (trackKey === 'NoMoreGames') {
            audioElement.loop = false;
          } else {
            audioElement.loop = true;
          }
          
          // Set up loop points for the track
          setupLoopPoints(trackKey, audioElement);
          
          // Reset loop state
          isInLoop = false;
        }
        
        // Always try to play (with correct volume)
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            update(s => ({...s, isPlaying: true, error: null}));
          }).catch(error => {
            update(s => ({...s, error: `Autoplay prevented: ${error.message}`}));
          });
        }
        
        return { ...state, currentTrack: track };
      });
    },
    
    // Add a method to manually set loop points for any track
    setLoopPoints: (start: number, end: number) => {
      if (!browser) return;
      
      const audioElement = getAudio();
      if (!audioElement) return;
      
      
      // Disable built-in loop
      audioElement.loop = false;
      
      // Set custom loop markers
      introMarker = { start: 0, end: start };
      loopMarker = { start, end };
      isInLoop = false;
      
      // Start precise loop checking
      startPreciseLoopChecking(audioElement);
      
      // Also set up backup timeupdate listener
      if (timeUpdateListener) {
        audioElement.removeEventListener('timeupdate', timeUpdateListener);
      }
      
      timeUpdateListener = () => checkLoopPoints(audioElement);
      audioElement.addEventListener('timeupdate', timeUpdateListener);
      
    },
    
    // Reset to normal looping behavior
    resetLoopPoints: () => {
      if (!browser) return;
      
      const audioElement = getAudio();
      if (!audioElement) return;
      
      
      // Remove custom loop behavior
      if (timeUpdateListener) {
        audioElement.removeEventListener('timeupdate', timeUpdateListener);
        timeUpdateListener = null;
      }
      
      // Clear interval
      if (loopCheckInterval) {
        clearInterval(loopCheckInterval);
        loopCheckInterval = null;
      }
      
      // Reset state
      introMarker = null;
      loopMarker = null;
      isInLoop = false;
      
      // Enable built-in loop
      audioElement.loop = true;
    },
    
    pause: () => {
      if (!browser) return;
      
      const audioElement = getAudio();
      if (audioElement) {
        audioElement.pause();
      }
    },
    
    setVolume: (volume: number) => {
      if (!browser) return;
      
      // Ensure volume is within valid range
      const safeVolume = Math.max(0, Math.min(1, volume));
      
      const audioElement = getAudio();
      if (audioElement) {
        audioElement.volume = safeVolume;
      }
      
      update(state => {
        return { ...state, volume: safeVolume };
      });
    },
    
    toggleMute: () => {
      if (!browser) return false;
      
      const audioElement = getAudio();
      if (!audioElement) return false;
      
      return update(state => {
        // If currently has volume (not muted)
        const newVolume = state.volume > 0 ? 0 : DEFAULT_VOLUME;
        
        if (audioElement) {
          audioElement.volume = newVolume;
        }
        
        return { ...state, volume: newVolume };
      });
    },
    
    // Get current state for debugging
    getStatus: () => {
      if (!browser) return 'SSR mode';
      
      const audioElement = getAudio();
      if (!audioElement) return 'No audio element';
      
      return {
        src: audioElement.src,
        paused: audioElement.paused,
        volume: audioElement.volume,
        currentTime: audioElement.currentTime,
        duration: audioElement.duration,
        readyState: audioElement.readyState,
        loop: audioElement.loop,
        customLoop: Boolean(timeUpdateListener),
        introMarker,
        loopMarker,
        isInLoop
      };
    },
    
    forcePlay: () => {
      if (!browser) return;
      
      const audioElement = getAudio();
      if (!audioElement) return;
      
      // Get current volume from store
      let currentVolume = DEFAULT_VOLUME;
      subscribe(state => {
        currentVolume = state.volume;
      })();
      
      // Set volume before playing
      audioElement.volume = currentVolume;
      
      update(state => {
        if (state.currentTrack) {
          audioElement.src = state.currentTrack;
          
          // Extract track key for loop points
          const trackKey = state.currentTrack.split('/').pop()?.split('.')[0] || '';
          
          // Set up loop points
          setupLoopPoints(trackKey, audioElement);
          
          // Reset loop state
          isInLoop = false;
          
          audioElement.play();
        }
        return state;
      });
    },
    
    // Jump to loop section
    jumpToLoop: () => {
      if (!browser) return;
      
      const audioElement = getAudio();
      if (!audioElement || !loopMarker) return;
      
      audioElement.currentTime = loopMarker.start;
      isInLoop = true;
    },
    
    destroy: () => {
      if (!browser) return;
      
      
      // Clear interval
      if (loopCheckInterval) {
        clearInterval(loopCheckInterval);
        loopCheckInterval = null;
      }
      
      if (audio) {
        // Clean up timeupdate listener
        if (timeUpdateListener) {
          audio.removeEventListener('timeupdate', timeUpdateListener);
          timeUpdateListener = null;
        }
        
        audio.pause();
        audio.src = '';
        audio = null;
      }
      
      // Reset loop state
      introMarker = null;
      loopMarker = null;
      isInLoop = false;
    }
  };
}

export const audioStore = createAudioStore();