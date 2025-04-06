package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func verifyToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		secret := os.Getenv("ACCESS_TOKEN_SECRET")
		if secret == "" {
			return nil, fmt.Errorf("missing ACCESS_TOKEN_SECRET environment variable")
		}

		return []byte(secret), nil
	})

	if err != nil {
		log.Printf("Token parsing error: %v", err)
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return token, nil
}

func AuthenticateMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		log.Printf("Authorization header received: %q", authHeader)

		const prefix = "Bearer "
		if authHeader == "" || !strings.HasPrefix(authHeader, prefix) {
			log.Println("Invalid or missing Authorization header")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header missing or malformed"})
			return
		}

		tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, prefix))
		log.Printf("Extracted token string: %q", tokenString)

		// Verify token
		token, err := verifyToken(tokenString)
		if err != nil {
			log.Printf("Token verification failed: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			log.Println("Invalid token claims")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			return
		}

		sub, ok := claims["sub"].(string)
		if !ok {
			log.Println("Token missing or invalid 'sub' claim")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token: missing 'sub'"})
			return
		}

		userID, err := strconv.ParseUint(sub, 10, 64)
		if err != nil {
			log.Println("Failed to parse 'sub' to uint")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid user ID format in token"})
			return
		}

		c.Set("userID", uint(userID))
		log.Printf("Token verified successfully. User ID: %d", userID)

		c.Next()
	}
}
