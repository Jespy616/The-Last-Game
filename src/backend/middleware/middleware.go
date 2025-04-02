package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func verifyToken(tokenString string) (*jwt.Token, error) {
	// Parse the token with the secret key
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return os.Getenv("ACCESS_TOKEN_SECRET"), nil
	})

	// Check for verification errors
	if err != nil {
		return nil, err
	}

	// Check if the token is valid
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	// Return the verified token
	return token, nil
}

func AuthenticateMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Retrieve the token from the cookie
		tokenString, err := c.Cookie("token")
		if err != nil {
			log.Println("Token missing in cookie")
			c.Redirect(http.StatusSeeOther, "/api/login")
			c.Abort()
			return
		}

		// Verify the token
		token, err := verifyToken(tokenString)
		if err != nil {
			log.Printf("Token verification failed: %v\\n", err)
			c.Redirect(http.StatusSeeOther, "/api/login")
			c.Abort()
			return
		}

		// Print information about the verified token
		log.Printf("Token verified successfully. Claims: %+v\\n", token.Claims)

		// Extract claims and set userID in context
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			if sub, ok := claims["sub"].(float64); ok {
				userID := uint(sub)
				c.Set("userID", userID)
			} else {
				log.Println("Token missing 'sub' claim")
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token: missing sub"})
				return
			}
		} else {
			log.Println("Invalid token claims")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			return
		}

		// Continue with the next middleware or route handler
		c.Next()
	}
}
