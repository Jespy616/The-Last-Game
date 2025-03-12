<script>
  import { link } from "svelte-spa-router"; // Import `link` for navigation

  let darkMode = false;

  function toggleDarkMode() {
      darkMode = !darkMode;
      console.log("Dark mode:", darkMode);
  }

  function editInfo() {
      console.log("Editing username/email");
  }

  function changePassword() {
      console.log("Changing password");
  }

  function manageSubscription() {
      console.log("Managing subscription");
      window.location.hash = "/subscription";
  }

  function saveChanges() {
      console.log("Saving changes");
      window.location.hash = "/";
  }

</script>
<div class="container">
  <div class="menu-background">
    <div class="page-header">
      <span class="back-arrow title page-title"><a href="/" use:link class="link">&lt;</a></span> 
      <h1 class="title page-title">SETTINGS</h1>
    </div>
    

    <button class="submit-button" on:click={editInfo}>
      Edit Username/Email
    </button>

    <button class="submit-button" on:click={changePassword}>
      Change Password
    </button>

    <button class="submit-button" on:click={manageSubscription}>
      Manage Subscription
    </button>

    <button class="toggle-button" on:click={toggleDarkMode}>
        Toggle Dark Mode: {darkMode ? "ON" : "OFF"}
    </button>

    <button class="save-button" on:click={saveChanges}>
      Save Changes
    </button>
  </div>
</div>
