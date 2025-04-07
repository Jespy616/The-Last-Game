<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/authStore';

  let username = '';
  let password = '';
  let errorMessages: string[] = [];

  async function handleLogin() {
    errorMessages = [];

    // Client-side validation
    if (!username) errorMessages.push('Username is required.');
    if (!password) errorMessages.push('Password is required.');

    if (errorMessages.length > 0) return;

    // Backend call
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      if (data?.errors && Array.isArray(data.errors)) {
        errorMessages = data.errors;
      } else if (data?.error) {
        errorMessages = [data.error]; 
      } else if (data?.message) {
        errorMessages = [data.message];
      } else {
        errorMessages = ['Login failed.'];
      }
    } else {
      authStore.set({ token: data.access_token });
      goto('/game');
    }
  }

</script>
  
<div class="container">
  
  <h1 class="title title-small">The</h1>
  <h1 class="title title-large">Last Game</h1>

  <div class="menu-background" style="max-width: 800px;">

    <h1 class="title page-title">Login</h1>

    <input 
      class="input-field login-text" 
      type="text" 
      placeholder="Username" 
      bind:value={username} 
    />

    <input 
      class="input-field login-text" 
      type="password" 
      placeholder="Password" 
      bind:value={password} 
    />
    
    {#if errorMessages.length}
      <ul class="errors">
        {#each errorMessages as msg}
          <li>{msg}</li>
        {/each}
      </ul>
    {/if} 

    <button class="button teal-button" style="margin: 0; height: auto; font-size: clamp(1rem, 3vw, 2rem)" on:click={handleLogin}>
      Login
    </button>

    <div style="margin: 16px; display: flex; align-items: center;">
      <input type="checkbox" id="rememberMe" class="checkbox" />
      <label for="rememberMe" class="label">Remember Me</label>
    </div>

    <div class="links">
      <a href="/signup" class="link">Create Account</a>
      <a href="/password-recovery" class="link">Forgot Password?</a>
    </div>
  </div>
</div>
