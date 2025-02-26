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

func MigrateDB() {
	query := `
	CREATE TABLE IF NOT EXISTS floors (
		id SERIAL PRIMARY KEY,
		created_at TIMESTAMPTZ DEFAULT now(),
		updated_at TIMESTAMPTZ DEFAULT now(),
		deleted_at TIMESTAMPTZ,
		player_in_id BIGINT
	);`
	
	err := DB.Exec(query).Error
	if err != nil {
		log.Fatal("Failed to create floors table manually:", err)
	}
	log.Println("Floors table created successfully")
	
	err = DB.AutoMigrate(
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

	query = `
	DO $$ 
	BEGIN 
	    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
	                   WHERE table_name='floors' AND column_name='player_in_id') 
	    THEN 
	        ALTER TABLE floors ADD COLUMN player_in_id BIGINT;
	    END IF;
	    
	    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
	                   WHERE table_name='floors' AND constraint_name='fk_floors_player_in') 
	    THEN 
	        ALTER TABLE floors ADD CONSTRAINT fk_floors_player_in
	        FOREIGN KEY (player_in_id) REFERENCES rooms(id) ON DELETE SET NULL;
	    END IF;
	END $$;
	`

	err = DB.Exec(query).Error
	if err != nil {
		log.Fatal("Failed to alter floors table:", err)
	}
	log.Println("Floors table altered successfully")

	query = `
	ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor_id BIGINT;
	ALTER TABLE rooms ADD CONSTRAINT fk_rooms_floor
	FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE;
	`
	err = DB.Exec(query).Error
	if err != nil {
		log.Fatal("Failed to update rooms table:", err)
	}
	log.Println("Rooms table updated successfully with floor_id")
}

type User struct {
	gorm.Model
	Username	string
	Email	string `gorm:"unique"`
	password	string
	SubscriptionLevel	int
	stripeID	int
}

type Player struct {
	gorm.Model
	UserID uint
	User	User 
	Health	int
	PrimaryWeaponID uint
	PrimaryWeapon Weapon
	SecondaryWeaponID uint
	SecondaryWeapon Weapon
	SpriteID int
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
	StoryText	string
}

type Floor struct {
    gorm.Model
    Rooms      []Room `gorm:"foreignKey:FloorID;constraint:OnDelete:CASCADE;"`
    PlayerInID uint
    PlayerIn   *Room `gorm:"foreignKey:PlayerInID"`
}

type Room struct {
    gorm.Model
    FloorID       uint `gorm:"not null;index"`
    Floor         Floor `gorm:"constraint:OnDelete:CASCADE;"`
    Enemies       []Enemy `gorm:"foreignKey:RoomID;constraint:OnDelete:CASCADE;"`
    ChestID       uint
    Chest         Chest
    AdjacentRooms []*Room `gorm:"many2many:room_adjacency;"`
    Cleared       bool
    Tiles         string `gorm:"type:text"`
    XPos          uint
    YPos          uint
}

type Enemy struct {
	gorm.Model
	AttackLevel	int	
	Health	int
	WeaponID uint
	Weapon	Weapon
	SpriteID	int
	RoomID uint
	Room Room `gorm:"constraint:OnDelete:CASCADE;"`
	PosX	int
	PosY	int
}

type Weapon struct {
	gorm.Model
	AttackDamagae	int
	SpriteID	int
	Type	int
}

type Chest struct {
	gorm.Model
	RoomInID uint
	RoomIn	*Room `gorm:"constraint:OnDelete:CASCADE"`
	WeaponID uint
	Weapon	Weapon
}
