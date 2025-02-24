package game_manager

import (
	"net/http"
	"backend/model"

	"github.com/gin-gonic/gin"
)



func GetUser(c *gin.Context) {
	userID := c.Param("userId")

	var user model.User
	result := model.DB.First(&user, "ID = ?", userID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func GetPlayer(c *gin.Context) {
	playerID := c.Param("playerId")

	var player model.Player
	result := model.DB.First(&player, "playerId = ?", playerID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}

	c.JSON(http.StatusOK, player)
}





