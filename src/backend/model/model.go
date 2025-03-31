package model

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	err := godotenv.Load(".env-personal")
	if err != nil {
		log.Println("No .env-personal found, falling back to .env")
		_ = godotenv.Load(".env")
	}

	dsn := "host=" + os.Getenv("DB_HOST") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" port=" + os.Getenv("DB_PORT") +
		" sslmode=" + os.Getenv("DB_SSLMODE") +
		" TimeZone=" + os.Getenv("DB_TIMEZONE")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB = db
	log.Println("Database connected successfully")
}

func ConnectTestDB() {
	// Load .env-test first, fallback to .env if missing
	err := godotenv.Load(".env-test")
	if err != nil {
		log.Println("No .env-test found, falling back to .env")
		_ = godotenv.Load(".env")
	}

	// Get environment variables
	testDBName := os.Getenv("DB_NAME") // Should be "last_game_test"
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")     // Test user (e.g., "testuser")
	dbPass := os.Getenv("DB_PASSWORD")
	dbPort := os.Getenv("DB_PORT")
	sslMode := os.Getenv("DB_SSLMODE")
	timeZone := os.Getenv("DB_TIMEZONE")

	if testDBName == "" {
		log.Fatal("DB_NAME is not set in the environment")
	}

	// Connect to PostgreSQL *without specifying a database*
	rootDSN := "host=" + dbHost +
		" user=postgres" + // Use PostgreSQL superuser to create the DB
		" password=" + dbPass +
		" port=" + dbPort +
		" sslmode=" + sslMode

	rootDB, err := gorm.Open(postgres.Open(rootDSN), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to PostgreSQL as superuser:", err)
	}

	// Check if the test database exists
	var exists bool
	rootDB.Raw("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ?)", testDBName).Scan(&exists)

	// If the database doesn't exist, create it
	if !exists {
		log.Println("Creating test database:", testDBName)
		rootDB.Exec("CREATE DATABASE " + testDBName + " OWNER " + dbUser)
		log.Println("Test database created successfully")
	} else {
		log.Println("Test database already exists:", testDBName)
	}

	// Now connect to the test database as the test user
	dsn := "host=" + dbHost +
		" user=" + dbUser +
		" password=" + dbPass +
		" dbname=" + testDBName +
		" port=" + dbPort +
		" sslmode=" + sslMode +
		" TimeZone=" + timeZone

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to test database:", err)
	}

	DB = db
	log.Println("Connected to test database:", testDBName)
}

func TeardownTestDB() {
	log.Println("Cleaning up test database...")

	// Close the active connection
	sqlDB, err := DB.DB()
	if err != nil {
		log.Println("Error retrieving DB connection:", err)
		return
	}
	sqlDB.Close()

	// Reconnect without specifying a database to drop the test DB
	rootDSN := "host=" + os.Getenv("DB_HOST") +
		" user=" + "postgres" +
		" password=" + os.Getenv("DB_PASSWORD") +
		" port=" + os.Getenv("DB_PORT") +
		" sslmode=" + os.Getenv("DB_SSLMODE")

	rootDB, err := gorm.Open(postgres.Open(rootDSN), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to reconnect to PostgreSQL before dropping test DB:", err)
	}

	// Drop the test database
	testDBName := os.Getenv("DB_NAME")
	log.Println("Dropping test database:", testDBName)
	rootDB.Exec("DROP DATABASE IF EXISTS " + testDBName)
	log.Println("Test database dropped successfully")
}

func MigrateDB() {
	err := DB.AutoMigrate(
		&Floor{},
		&Room{},
		&Chest{},
		&Weapon{},
		&Enemy{},
		&Player{},
		&Game{},
		&User{},
		)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migrated successfully")
}

func CloseDB(db *gorm.DB) {
	sqlDB, err := db.DB()
	if err != nil {
		log.Println("Error getting DB instance:", err)
		return
	}
	sqlDB.Close()
}

type User struct {
	gorm.Model
	Username	string
	Email	string `gorm:"unique"`
	Password	string
	SubscriptionLevel	int
	StripeID	int
}

type Player struct {
	gorm.Model
	//UserID uint
	//User	User
	Health	int
	PrimaryWeaponID *uint
	PrimaryWeapon *Weapon
	SecondaryWeaponID *uint
	SecondaryWeapon *Weapon
	Sprite     	 string	 `gorm:"type:text"`
	PosX	int
	PosY	int
}

type Game struct {
	gorm.Model
	Level	int
	FloorID uint
	Floor	Floor
	PlayerSpecifications	string
	PlayerID uint
	Player	Player
}

type Floor struct {
    gorm.Model
    Rooms      []Room `gorm:"foreignKey:FloorID;constraint:OnDelete:CASCADE;"`
    PlayerInID uint `gorm:"default:null"`
	FloorMap   string `gorm:"type:text"` // Store floor layout as JSON
	Adjacency  string `gorm:"type:text"` // Store adjacency matrix as JSON
	StoryText  string
}

type Room struct {
    gorm.Model
	FloorID      *uint  `gorm:"default:null"`
    Floor        *Floor  `gorm:"constraint:OnDelete:CASCADE;"`
    Enemies      []Enemy `gorm:"foreignKey:RoomID;constraint:OnDelete:CASCADE;"`
    ChestID      *uint   `gorm:"default:null"`
    Chest        *Chest   `gorm:"constraint:OnDelete:SET NULL;"`
    TopID        *uint  `gorm:"constraint:OnDelete:SET NULL;"`
    BottomID     *uint  `gorm:"constraint:OnDelete:SET NULL;"`
    LeftID       *uint  `gorm:"constraint:OnDelete:SET NULL;"`
    RightID      *uint  `gorm:"constraint:OnDelete:SET NULL;"`
    Cleared      bool
    Tiles        string `gorm:"type:text"`
    XPos         uint
    YPos         uint
}


type Enemy struct {
    gorm.Model
    AttackLevel  int
    Health       int
    WeaponID     *uint   `gorm:"default:null"`
    Weapon       *Weapon `gorm:"foreignKey:WeaponID;constraint:OnDelete:SET NULL;"`
    Sprite     	 string	 `gorm:"type:text"`
    RoomID       uint   `gorm:"index"`
    PosX         int
    PosY         int
}

type Weapon struct {
	gorm.Model
	AttackDamage	int
	Sprite     	 string	 `gorm:"type:text"`
	Type	int
}

type Chest struct {
    gorm.Model
    RoomInID  *uint   `gorm:"default:null"` // Nullable Room reference
    WeaponID  *uint   `gorm:"default:null"` // ✅ Keep as a pointer to allow NULL
    Weapon    *Weapon `gorm:"foreignKey:WeaponID;constraint:OnDelete:SET NULL;"` // Remove weapon reference if deleted
}

