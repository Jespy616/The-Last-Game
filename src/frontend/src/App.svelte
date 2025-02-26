<script lang="ts">
  import Router from "svelte-spa-router";
  import Navbar from "./components/Navbar.svelte";
  import Login from "./pages/Login.svelte";
  import Signup from "./pages/Signup.svelte";
  import Subscription from "./pages/Subscription.svelte";
  import Settings from "./pages/Settings.svelte";

  // Define the route mappings inside the <script> block
  const routes: Record<string, unknown> = {
    "/": Login,
    "/signup": Signup,
    "/subscription": Subscription,
    "/settings": Settings
  };
</script>

<Router {routes} />
