package auth

import (
	"backend/model"

	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)


type AccountRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type TokenPair struct {
	AccessToken  string
	RefreshToken string
}

type RefreshInfo struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func hashString(str string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(str), bcrypt.DefaultCost)
	return string(hashed), err
}


// GenerateTokens creates an access token (short-lived) and a refresh token (long-lived)
func GenerateTokens(userID uint) (*TokenPair, error) {
	tokenPair := &TokenPair{}

	// 🔹 Access Token (Valid for 15 minutes)
	accessClaims := jwt.MapClaims{
		"user_id": userID,                                  // Stores user ID in the token
		"exp":     time.Now().Add(15 * time.Minute).Unix(), // Expiration time
	}

	accessTokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessToken, err := accessTokenObj.SignedString([]byte(os.Getenv("ACCESS_TOKEN_SECRET")))
	if err != nil {
		return nil, err // If token creation fails, return an error
	}
	tokenPair.AccessToken = accessToken

	// 🔹 Refresh Token (Valid for 7 days)
	refreshClaims := jwt.MapClaims{
		"user_id": userID,                                    // Stores user ID in the token
		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(), // Expiration time
	}
	refreshTokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshToken, err := refreshTokenObj.SignedString([]byte(os.Getenv("REFRESH_TOKEN_SECRET")))
	if err != nil {
		return nil, err // If token creation fails, return an error
	}
	tokenPair.RefreshToken = refreshToken

	return tokenPair, nil
}

func Register(c *gin.Context) {

	var req AccountRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}


	hashedPassword, err := hashString(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}

	var existingUser model.User

	usernameExists := model.DB.Where("username = ?", req.Username).First(&existingUser).Error == nil
	emailExists := model.DB.Where("email = ?", req.Email).First(&existingUser).Error == nil



	// Return specific errors if username already exists
	if usernameExists {
		c.JSON(http.StatusConflict, gin.H{"error": "Failed to create user. Username is already in use."})
		return
	}

	if emailExists {
		c.JSON(http.StatusConflict, gin.H{"error": "Failed to create user. Email is already in use."})
		return
	}

	user := model.User{
		Username: req.Username,
		Email:    req.Email, 
		Password: hashedPassword,
	}

	// Save user to database
	if err := model.DB.Create(&user).Error; err != nil {
		log.Println("Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create unique user."})
		return
	}

	token, err := GenerateTokens(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Send response with JWT token
	c.JSON(http.StatusCreated, gin.H{
		"message":       "Account created successfully",
		"access_token":  token.AccessToken,
		"refresh_token": token.RefreshToken,
		"user_ID": user.ID,
	})
}

func Login(c *gin.Context) {
	var req AccountRequest


	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user model.User

	if err := model.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}


	token, err := GenerateTokens(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successful",
		"access_token":  token.AccessToken,
		"refresh_token": token.RefreshToken,
		"user_ID": user.ID,

	})
}

// RefreshToken handles the renewal of access tokens using a valid refresh token.
func RefreshToken(c *gin.Context) {
	var req RefreshInfo

	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 🔹 Parse the refresh token
	token, err := jwt.Parse(req.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, http.ErrAbortHandler
		   }
		   return []byte(os.Getenv("REFRESH_TOKEN_SECRET")), nil
		  })
		 

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
			return
		   }

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := claims["user_id"].(float64)

		newTokens, err := GenerateTokens(uint(userID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new tokens"})
			return
	}

	// Send new tokens to frontend
	c.JSON(http.StatusOK, gin.H{
		"access_token": newTokens.AccessToken,
		"refresh_token": req.RefreshToken,
		"user_ID": userID,
	})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
	}
}
