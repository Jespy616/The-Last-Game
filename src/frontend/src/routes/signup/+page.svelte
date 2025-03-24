<script>
    import { goto } from "$app/navigation";

    let username = "";
    let email = "";
    let password = "";
    let confirmPassword = "";
  
    async function handleSignup() {
        console.log("Creating account:", username, email, password);
    
        // TODO: Implement signup API call
        goto("/settings"); // Redirect after signup
    }
  </script>
  
  <div class="container">
    <div class="menu-background">
      <div class="page-header">
        <span class="back-arrow title page-title"><a href="/" class="link">&lt;</a></span> 
        <h1 class="title page-title" style="font-size: clamp(2rem, 5vw, 5rem);">CREATE ACCOUNT</h1>
      </div>
  
      <div style="display: flex; justify-content: space-around; align-items: center; width: 80%;">
        <div class="text-input-box" style="width: fit-content;">
          <p class="dark-label">Username</p>
          <p class="dark-label">Email</p>
          <p class="dark-label">Password</p>
          <p class="dark-label">Confirm<br>Password</p>
        </div>
    
        <div class="text-input-box">
          <input class="input-field signup-text" type="text" placeholder="Username" bind:value={username} />
          <input class="input-field signup-text" type="email" placeholder="Email" bind:value={email} />
          <input class="input-field signup-text" type="password" placeholder="Password" bind:value={password} />
          <input class="input-field signup-text" type="password" placeholder="Confirm Password" bind:value={confirmPassword} />
        </div>
      </div>
    
      <div style="margin: 16px; display: flex; align-items: center;">
        <input type="checkbox" id="acceptTerms" class="checkbox" />
        <label for="acceptTerms" class="label">Accept Terms & Conditions</label>
      </div>
  
      <div class="links">
        <a href="/terms" class="link">Terms & Conditions</a>
      </div>
  
      <button class="button teal-button" style="margin: 16px;" on:click={handleSignup}>
          Create Account
      </button>
    </div>
  </div>