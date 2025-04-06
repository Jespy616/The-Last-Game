package auth

import (
	"backend/model"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"

	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/crypto/chacha20poly1305"
)


type RegisterAccountRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginAccountRequest struct {
	Username string `json:"username" binding:"required"`
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

// 🔹 Encrypt email using ChaCha20-Poly1305
func encryptEmail(email string) (string, error) {

	key := []byte(os.Getenv("EMAIL_ENCRYPTION_KEY"))

	if len(key) != chacha20poly1305.KeySize {
		return "", errors.New("errInvalidKeySize") // Pretty sure this is incorrect but need more research
	}

	aead, err := chacha20poly1305.NewX(key) // Use XChaCha20-Poly1305 for larger nonces
	if err != nil {
		return "", err
	}

	nonce := make([]byte, chacha20poly1305.NonceSizeX) // 24-byte nonce
	if _, err := rand.Read(nonce); err != nil {
		return "", err
	}

	ciphertext := aead.Seal(nil, nonce, []byte(email), nil) // Encrypt email
	encryptedData := append(nonce, ciphertext...)           // Store nonce + ciphertext

	return base64.StdEncoding.EncodeToString(encryptedData), nil // Encode to base64
}

// GenerateTokens creates an access token (short-lived) and a refresh token (long-lived)
func GenerateTokens(userID uint) (*TokenPair, error) {
	tokenPair := &TokenPair{}
	accessSecret := os.Getenv("ACCESS_TOKEN_SECRET")
	refreshSecret := os.Getenv("REFRESH_TOKEN_SECRET")

	if accessSecret == "" || refreshSecret == "" {
		return nil, errors.New("access or refresh secret is missing in environment variables")
	}

	// Stringify user ID for sub
	sub := fmt.Sprintf("%d", userID)
	now := time.Now()

	// 🔹 Access Token (valid for 15 minutes)
	accessClaims := jwt.MapClaims{
		"sub": sub,
		"iat": now.Unix(),
		"nbf": now.Unix(),
		"exp": now.Add(15 * time.Minute).Unix(),
	}

	accessTokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessToken, err := accessTokenObj.SignedString([]byte(accessSecret))
	if err != nil {
		return nil, err
	}
	tokenPair.AccessToken = accessToken

	// 🔹 Refresh Token (valid for 7 days)
	refreshClaims := jwt.MapClaims{
		"sub": sub,
		"iat": now.Unix(),
		"nbf": now.Unix(),
		"exp": now.Add(7 * 24 * time.Hour).Unix(),
	}

	refreshTokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshToken, err := refreshTokenObj.SignedString([]byte(refreshSecret))
	if err != nil {
		return nil, err
	}
	tokenPair.RefreshToken = refreshToken

	return tokenPair, nil
}


func Register(c *gin.Context) {

	var req RegisterAccountRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}


	hashedPassword, err := hashString(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}

	encryptedEmail, err := encryptEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error encrypting email"})
		return
	}
	log.Print(hashedPassword)
	log.Print(encryptedEmail)

// TODO: NEED LOGIC TO MAKE SURE THE SAME PERSON ISNT GETTING CREATED TWICE

	user := model.User{
		Username: req.Username,
		Email:    encryptedEmail, // Store encrypted email
		Password: hashedPassword,
	}

	// Save user to database
	if err := model.DB.Create(&user).Error; err != nil {
		log.Println("Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create a unique user. Username, Password, or Email is already in use."})
		return
	}

	token, err := GenerateTokens(user.ID)
	// token, err := GenerateTokens(1)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Send response with JWT token
	c.JSON(http.StatusCreated, gin.H{
		"message":       "Account created successfully",
		"access_token":  token.AccessToken,
		"refresh_token": token.RefreshToken,
		"user_id": user.ID,
	})
}

func Login(c *gin.Context) {
	var req LoginAccountRequest


	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Print(req)
	log.Print(c)

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
		userID := claims["sub"].(float64)

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
