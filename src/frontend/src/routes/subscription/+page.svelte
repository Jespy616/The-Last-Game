<script lang="ts">
    import { goto } from "$app/navigation";
  
    async function handleSubscription(type: "monthly" | "lifetime") {
        console.log("Subscribing to:", type);

        // TODO: Implement real API call
        goto("/settings");
    }
  </script>
  
  <div class="container">
    <div class="menu-background">
      <div class="page-header">
        <span class="back-arrow title page-title"><a href="/settings" class="link">&lt;</a></span> 
        <h1 class="title page-title" style="font-size: clamp(1rem, 6vw, 5rem);">SUBSCRIPTIONS</h1>
      </div>
  
      <div class="premium-box">
        <div>
          <p class="premium-title">PREMIUM BENEFITS</p>
        </div>
        <ul>
          <li>- ACCESS TO ALL GAME MODES</li>
          <li>- MORE THEMES & CHARACTER SPRITES</li>
          <li>- CREATE MULTIPLE CHARACTERS</li>
          <li>- DEEPER AI INTEGRATION</li>
        </ul>
      </div>
  
      <button class="button maroon-button monthly" on:click={() => handleSubscription("monthly")}>
        Monthly - $4.99/Month
      </button>
  
      <button class="button maroon-button lifetime" on:click={() => handleSubscription("lifetime")}>
        Lifetime - $99.99
      </button>
    </div>
  </div>
  