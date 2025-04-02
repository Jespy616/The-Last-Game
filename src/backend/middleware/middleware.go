package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
	"backend/model"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)


func verifyToken(tokenString string) (*jwt.Token, error) {
	// Parse the token with the secret key
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("ACCESS_TOKEN_SECRET")), nil
	})

	// Check for verification errors
	if err != nil {
		return nil, err
	}

	// Check if the token is valid
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid claims")
	}

	if float64(time.Now().Unix()) > claims["exp"].(float64) {
		return nil, fmt.Errorf("token expired")
	}

	// Return the verified token
	return token, nil
}



func authenticateMiddleware(c *gin.Context) {
	// Retrieve the token from the cookie
	authHeader := c.GetHeader("Authorization")

	if authHeader ==""{
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is not found."})
		c.AbortWithStatus(http.StatusUnauthorized)	
		return
	}

	authToken := strings.Split(authHeader, " ")
	if len(authToken) != 2 || authToken[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Token Format."})
		c.AbortWithStatus(http.StatusUnauthorized)	
		return
	}

	tokenString := authToken[1]

	// Verify the token
	token, err := verifyToken(tokenString)
	if err != nil {
		log.Printf("Token verification failed: %v\\n", err)
		c.Redirect(http.StatusSeeOther, "/login")
		c.Abort()
		return
	}

	// Print information about the verified token
	log.Printf("Token verified successfully. Claims: %+v\\n", token.Claims)

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		c.Abort()
		return
	}

	var user model.User
	model.DB.Where("ID=?", claims["id"]).Find(&user)

	if user.ID == 0 {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	c.Set("currentUser", user)
	// Continue with the next middleware or route handler
	c.Next()
}
