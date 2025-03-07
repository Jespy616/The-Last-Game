package main

import (
	"backend/auth"
	// "fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"

	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load("../../../.env") // Load the .env file
	if err != nil {
		log.Println("Warning: Could not load .env file")
	}
}

func main() {
	r := gin.Default()

	// Register authentication routes
	r.POST("/register", auth.Register)
	r.POST("/login", auth.Login)
	r.POST("/refresh", auth.RefreshToken)

	// Get the port from the environment (useful for Docker)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not specified
	}

	log.Printf("Starting server on port %s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
