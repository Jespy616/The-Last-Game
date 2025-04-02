package main

import (
	"backend/auth"
	"backend/model"

	// "fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Register authentication routes
	r.POST("/api/register", auth.Register)
	r.POST("/api/login", auth.Login)
	r.POST("/api/refresh", auth.RefreshToken)

	model.ConnectDB()
	model.MigrateDB()

	// Get the port from the environment (useful for Docker)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not specified
	}

	log.Printf("Starting server for AI game on port %s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
