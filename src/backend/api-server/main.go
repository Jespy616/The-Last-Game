package main

import (
	"log"
	"net/http"
	"github.com/gin-gonic/gin"
	"backend/game_manager"
	"backend/model"
	"github.com/gin-contrib/cors"
)

func main() {
	// Initialize Gin Router
	r := gin.Default()

	// Middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.Use(cors.New(cors.Config{
        AllowAllOrigins:  true,
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))

	// Initialize DB
	model.ConnectDB()
	model.MigrateDB() //Uncomment this line when you run main.go for the first time

	// Public Routes (No authentication required)
	//public := r.Group("/api")
	//{
		//public.POST("/register", auth.Register)
		//public.POST("/login", auth.Login)
		//public.POST("refreshToken", auth.RefreshToken)

	//}

	// Protected Routes (Require JWT)
	protected := r.Group("/api/protected")
	protected.Use() // Protect with JWT Authentication, encypt
	{
		// game stuff
		protected.GET("/create_game", game_manager.CreateGame)
		protected.GET("/create_floor", game_manager.CreateFloor)
		//protected.POST("/save_game", game_manager.SaveGame)
		//protected.POST("/subscribe", auth.Subscribe)
		//protected.POST("/unsubscribe", game_manager.Unsubscribe)

		// get models
		//protected.GET("/get_user/:userId", game_manager.GetUser)
		//protected.GET("/get_player/:playerId", game_manager.GetPlayer)
		//protected.GET("/get_game/:gameId", game_manager.GetGame)
		//protected.GET("/get_floor/:floorId", game_manager.GetFloor)
		//protected.GET("/get_enemy/:enemyId", game_manager.GetEnemy)
		//protected.GET("/get_room/:roomId", game_manager.GetRoom)
		//protected.GET("/get_chest/:chestId", game_manager.GetChest)
		//protected.GET("/get_weapon/:weaponId", game_manager.GetWeapon)

		// set and change models
		//protected.POST("/set_user/:userId", game_manager.SetUser)
		//protected.POST("/set_player/:playerId", game_manager.SetPlayer)
		//protected.POST("/set_game/:gameId", game_manager.SetGame)
		//protected.POST("/set_floor/:floorId", game_manager.SetFloor)
		//protected.POST("/set_enemy/:enemyId", game_manager.SetEnemy)
		//protected.POST("/set_room/:roomId", game_manager.SetRoom)
		//protected.POST("/set_chest/:chestId", game_manager.SetChest)
		//protected.POST("/set_weapon/:weaponId", game_manager.SetWeapon)
	}

	// Handle Not Found Routes
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
	})

	// Start the Server
	port := ":8081"
	log.Println("Server running on port", port)
	r.Run(port)
}