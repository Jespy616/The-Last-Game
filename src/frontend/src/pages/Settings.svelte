<script>
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
    <h1 class="title page-title">Settings</h1>

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
