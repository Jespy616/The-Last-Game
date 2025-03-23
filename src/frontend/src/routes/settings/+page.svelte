<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
  
    let darkMode = false;
  
    // Check for user preference in local storage
    onMount(() => {
      darkMode = localStorage.getItem("theme") === "dark";
      updateTheme();
    });
  
    function toggleDarkMode() {
      darkMode = !darkMode;
      localStorage.setItem("theme", darkMode ? "dark" : "light");
      updateTheme();
    }

    // function updateTheme() {
    //     document.body.classList.toggle("dark-mode", darkMode);
    // }
  
    function updateTheme() {
      if (darkMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    }
    
    function editInfo() {
        console.log("Editing username/email");
    }
  
    function changePassword() {
        console.log("Changing password");
    }
  
    function saveChanges() {
        console.log("Saving changes");
        goto("/game");
    }
  
  </script>
  <div class="container">
    <div class="menu-background">
      <div class="page-header">
        <span class="back-arrow title page-title"><a href="/" class="link">&lt;</a></span> 
        <h1 class="title page-title">SETTINGS</h1>
      </div>
      
  
      <button class="button teal-button" on:click={editInfo}>
        Edit Username/Email
      </button>
  
      <button class="button teal-button" on:click={changePassword}>
        Change Password
      </button>
  
      <button class="button teal-button" on:click={() => goto("/subscription")}>
        Manage Subscription
      </button>
  
      <button class="button teal-button" on:click={toggleDarkMode}>
          Toggle Dark Mode: {darkMode ? "ON" : "OFF"}
      </button>
  
      <button class="button maroon-button" on:click={saveChanges}>
        Save Changes
      </button>
    </div>
  </div>
  