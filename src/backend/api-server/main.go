package main

import (
	"backend/auth"
	"backend/game_manager"
	"backend/middleware"
	"backend/model"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Register authentication routes
	r.POST("/register", auth.Register)
	r.POST("/login", auth.Login)
	r.POST("/refresh", auth.RefreshToken)

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, 
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
	}))

	// Initialize DB
	model.ConnectDB()
	model.MigrateDB() //Uncomment this line when you run main.go for the first time

	// Public Routes (No authentication required)
	public := r.Group("/api")
	{
		public.POST("/register", auth.Register)
		public.POST("/login", auth.Login)
		public.POST("/refreshToken", auth.RefreshToken)

	}

	// Protected Routes (Require JWT)
	protected := r.Group("/api/protected")
	protected.Use(middleware.AuthenticateMiddleware()) // Protect with JWT Authentication, encypt //DELETE middleware.Auth... to access without logging in
	{
		// game stuff
		protected.POST("/create_game", game_manager.CreateGame)
		protected.POST("/create_floor", game_manager.CreateFloor)
		protected.POST("/save_game", game_manager.SaveGame)
		//protected.POST("/subscribe", auth.Subscribe)
		//protected.POST("/unsubscribe", game_manager.Unsubscribe)

		// get models
		protected.GET("/get_user/:userId", game_manager.GetUser)
		protected.GET("/get_player/:playerId", game_manager.GetPlayer)

		// Enemy routes
		protected.GET("/get_enemy/:enemyId", game_manager.GetEnemy)
		protected.PUT("/enemy/:id/health", game_manager.SetEnemyHealthHandler)
		protected.PUT("/enemy/:id/weapon", game_manager.SetEnemyWeaponHandler)
		protected.DELETE("/enemy/:id", game_manager.DeleteEnemyHandler)

		// Room routes
		protected.GET("/room/:id", game_manager.GetRoomHandler)
		protected.PUT("/room/:id/cleared", game_manager.SetRoomClearedHandler)
		protected.PUT("/room/:id/chest", game_manager.SetRoomChestHandler)
		protected.DELETE("/room/:id", game_manager.DeleteRoomHandler)

		// Chest routes
		protected.GET("/chest/:id", game_manager.GetChestHandler)
		protected.PUT("/chest/:id/weapon", game_manager.SetChestWeaponHandler)
		protected.DELETE("/chest/:id/weapon", game_manager.RemoveChestWeaponHandler)
		protected.DELETE("/chest/:id", game_manager.DeleteChestHandler)

		// Weapon routes
		protected.GET("/weapon/:id", game_manager.GetWeaponHandler)
		protected.PUT("/weapon/:id/damage", game_manager.SetWeaponDamageHandler)
		protected.DELETE("/weapon/:id", game_manager.DeleteWeaponHandler)

		// Floor routes
		protected.GET("/floor/:id", game_manager.GetFloorHandler)
		protected.PUT("/floor/:id/player", game_manager.SetFloorPlayerInHandler)
		protected.DELETE("/floor/:id", game_manager.DeleteFloorHandler)
		protected.PUT("/floor/:id/story", game_manager.SetFloorStoryTextHandler)

		// Game routes
		protected.GET("/game/:id", game_manager.GetGameHandler)
		protected.PUT("/game/:id/level", game_manager.SetGameLevelHandler)
		protected.DELETE("/game/:id", game_manager.DeleteGameHandler)
	}

	// Handle Not Found Routes
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
	})

	// Start the Server
	port := ":8080"
	log.Println("Server running on port", port)
	r.Run(port)
}
