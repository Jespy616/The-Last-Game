<script lang="ts">
  import { link } from "svelte-spa-router"; // Import `link` for navigation
  let username: string = "";
  let password: string = "";

  function handleLogin(): void {
    console.log("Logging in:", username, password);
    // TODO: Implement authentication API call
    window.location.hash = "/settings";
  }
</script>

<div class="container">
  
  <h1 class="title title-small">The</h1>
  <h1 class="title title-large">Last Game</h1>

  <div class="menu-background" style="max-width: 800px;">

    <h1 class="title page-title">Login</h1>

    <input 
      class="input-field" 
      type="text" 
      placeholder="Username" 
      bind:value={username} 
    />

    <input 
      class="input-field" 
      type="password" 
      placeholder="Password" 
      bind:value={password} 
    />

    <button class="submit-button" on:click={handleLogin}>
      Submit
    </button>

    <div style="margin: 16px;">
      <input type="checkbox" id="rememberMe" class="checkbox" />
      <label for="rememberMe" class="label">Remember Me</label>
    </div>

    <div class="links">
      <a href="/signup" use:link class="link">Create Account</a>
      <a href="/password-recovery" use:link class="link">Forgot Password?</a>
    </div>
  </div>
</div>
