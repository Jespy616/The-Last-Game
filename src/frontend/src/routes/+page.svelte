<script lang="ts">
    import { goto } from "$app/navigation";
    let username: string = "";
    let password: string = "";
  
    async function handleLogin() {
        console.log("Logging in:", username, password);
    
        // TODO: Implement authentication API call
        goto("/settings"); // Navigate to settings after login
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
  