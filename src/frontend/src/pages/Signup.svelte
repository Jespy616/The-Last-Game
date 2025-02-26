<script>
  let username = "";
  let email = "";
  let password = "";
  let confirmPassword = "";

  import { link } from "svelte-spa-router"; // Import `link` for navigation

  function handleSignup() {
      console.log("Creating account:", username, email, password);
      // TODO: Implement signup API call
  }
</script>

<div class="container">
  <div class="menu-background">
    <h1 class="title page-title">Create Account</h1>

    <input class="input-field" type="text" placeholder="Username" bind:value={username} />
    <input class="input-field" type="email" placeholder="Email" bind:value={email} />
    <input class="input-field" type="password" placeholder="Password" bind:value={password} />
    <input class="input-field" type="password" placeholder="Confirm Password" bind:value={confirmPassword} />
  
    <div style="margin: 16px;">
      <input type="checkbox" id="acceptTerms" class="checkbox" />
      <label for="acceptTerms" class="label">Accept Terms & Conditions</label>
    </div>

    <div class="links">
      <a href="/terms" use:link class="link">Terms & Conditions</a>
    </div>

    <button class="submit-button" style="margin: 16px;" on:click={handleSignup}>
        Create Account
    </button>
  </div>
</div>
