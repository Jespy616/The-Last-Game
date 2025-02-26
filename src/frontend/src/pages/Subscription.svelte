<script lang="ts">
  function handleSubscription(type: "monthly" | "lifetime"): void {
    console.log("Subscribing to:", type);
    // TODO: Implement subscription API call
  }
</script>

<div class="container">
  <div class="menu-background">
    <h1 class="title page-title">Subscriptions</h1>

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

    <button class="subscription-button monthly" on:click={() => handleSubscription("monthly")}>
      Monthly - $4.99/Month
    </button>

    <button class="subscription-button lifetime" on:click={() => handleSubscription("lifetime")}>
      Lifetime - $99.99
    </button>
  </div>
</div>
