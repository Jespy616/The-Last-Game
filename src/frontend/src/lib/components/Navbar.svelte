<script lang="ts">
  import { goto } from "$app/navigation";
</script>

<nav class="navbar">
  <div class="nav-links">
    <a href="/settings" style="font-size:16px" class="fa">&#xf013;</a>
</nav>

<style>
  /* Navbar Styles */
  .navbar {
    background-color: var(--primary-color);
    padding: 10px 20px;
    display: flex;
    justify-content: right;
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
