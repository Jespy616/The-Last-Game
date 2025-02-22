package game_manager

import (
	"net/http"
	"backend/model"

	"github.com/gin-gonic/gin"
)



func GetUser(c *gin.Context) {
	playerID := c.Param("userId")

	var player model.User
	result := model.DB.First(&player, "userId = ?", playerID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}

	c.JSON(http.StatusOK, player)
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





