<script lang="ts">
  import { link } from "svelte-spa-router"; // Import `link` for navigation
</script>

<nav class="navbar">
  <div class="nav-links">
    <a href="/" use:link>Login</a>
    <a href="/signup" use:link>Signup</a>
    <a href="/subscription" use:link>Subscription</a>
    <a href="/settings" use:link>Settings</a> 
  </div>
</nav>

<style>
  /* Navbar Styles */
  .navbar {
    background-color: var(--primary-color);
    padding: 10px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  /* Navigation Links */
  .nav-links {
    display: flex;
    gap: 20px;
  }

  .nav-links a {
    text-decoration: none;
    color: white;
    font-size: 1rem;
    transition: color 0.3s ease-in-out;
  }

  .nav-links a:hover {
    color: var(--secondary-color);
  }
</style>
