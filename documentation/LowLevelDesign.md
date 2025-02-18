# Low Level Design

# [Please Look at this Link!! It has the rubric and needs for our document](https://usu.instructure.com/courses/769837/assignments/4714896)

## Introduction

---

## Backlog Development Plan
- ### Sprint Breakdown (Sprint Goals)
<<<<<<< documentation/LowLevelDesign.md
  - **Sprint 1**
  Implement the basic UI structure, authentication, and API connections. 
  - **Sprint 2**
  Integrate game UI, refine navigation, and improve accessibility. 
  - **Sprint 3**
  Final testing, performance optimization, and deployment setup.  
>>>>>>> documentation/LowLevelDesign.md

### Sprint Task Breakdown (Tasks to acheive Goals)
#### Sprint 1
- **Front end:**
  - **Svelte**
    - **Login Page (`Login.svelte`)**
      - [ ] Fields: **Username, Password**
      - [ ] Buttons: **Login, Forgot Password, Create Account**
      - [ ] API Call: `POST /api/login`
      - [ ] Handles: **Error messages, input validation**
    - **Signup Page (`Signup.svelte`)**
      - [ ] Fields: **Username, Email, Password, Confirm Password**
      - [ ] Form Validation:
        - [ ] **Username availability check**
        - [ ] **Email format validation**
        - [ ] **Password strength enforcement**
      - [ ] API Call: `POST /api/register`
      - [ ] Redirects to **Login page** after successful registration.
    - **Subscription Page (`Subscription.svelte`)**
      - [ ] Displays **subscription tiers** (Monthly, Lifetime).
      - [ ] API Calls:
        - [ ] `GET /api/subscription` (fetch available plans)
        - [ ] `POST /api/subscribe` (process Stripe payment)
      - [ ] Handles:
        - [ ] **Success message for payment**
        - [ ] **Error message if payment fails**
    - **Settings Page (`Settings.svelte`)**
      - [ ] Fields:
        - [ ] **Change Username**
        - [ ] **Change Email**
        - [ ] **Dark Mode Toggle**
      - [ ] API Calls:
        - [ ] `GET /api/settings` (fetch preferences)
        - [ ] `POST /api/settings` (save preferences)
      - [ ] Saves **preferences in localStorage & Svelte Store**.
    - **Global UI Components**
      - [ ] **Navbar (`Navbar.svelte`)**
        - Links to: **Home, Subscription, Settings**
        - Updates **active page state** using Svelte Stores.
      - [ ] **Reusable Components**
        - `Button.svelte` – Standardized buttons.
        - `FormInput.svelte` – Handles input fields.
    - **Accessibility Focus**
      - [ ] **Keyboard Navigation**: Tab-based control.
      - [ ] **Screen Reader Support**: ARIA labels for important elements.
  - **Phaser**
    - **Scene Management**
      - [ ] Implement `MainMenuScene` with navigation buttons.
      - [ ] Implement `ThemeSelectionScene` and store the selected theme.
      - [ ] Implement `DifficultySelectionScene` and pass selection to the backend.
      - [ ] Implement `GameScene` as an empty shell.
      - [ ] Implement `GameOverScene` and ensure it triggers `SetHighScore(level)`.
    - **Backend API Calls**
      - [ ] Implement `GetFloor(difficultyLevel, theme)` to fetch level data.
      - [ ] Implement `Save(floorObject)` to update enemy/chest data.
      - [ ] Implement `SetHighScore(level)` to update leaderboard.
      - [ ] Implement `GetText()` to fetch AI-generated story text.
    - **Basic Player Controls**
      - [ ] Implement `move(direction)`.
      - [ ] Implement `checkCollision(Player, direction)`.
    - **Basic Enemy System**
      - [ ] Implement enemy movement towards the player (`enemyPathfind(Enemy, Player)`).
      - [ ] Implement simple enemy melee attack (`attack(Player)`).
- **Back end:**

#### Sprint 2
- **Front end:**
  - **Svelte**
    - **UI/UX Improvements**
      - [ ] Improve **form validation & error messages**.
    - **Authentication Improvements**
      - [ ] **Forgot Password Page (`ForgotPassword.svelte`)**
        - API Call: `POST /api/reset-password`
        - Handles: **Sending password reset link via email**.
      - [ ] **Change Password Page (`ChangePassword.svelte`)**
        - Fields: **Current Password, New Password, Confirm Password**
        - API Call: `POST /api/update-password`
        - Requires **current password validation**.
    - **Navigation & Accessibility**
      - [ ] Improve **keyboard shortcuts** for better navigation.
      - [ ] Implement **high contrast mode** for visually impaired users.
  - **Phaser**
    - **Room Management**
      - [ ] Implement `RoomObject` and different room types (`NormalRoom`, `ChestRoom`, `StairRoom`).
      - [ ] Implement `getRoomAt(x, y)`.
      - [ ] Implement `loadRoom(Room room)`.
      - [ ] Implement `generateFloor(FloorObject floor)`.
      - [ ] Implement `generateRoom(RoomObject room)`.

    - **Combat & Health System**
      - [ ] Implement `attack(Player)` logic.
      - [ ] Implement enemy health tracking.
      - [ ] Implement player health tracking.

    - **Phaser-Svelte Integration**
      - [ ] Implement event handling to pause/resume Phaser when Svelte UI is open.
      - [ ] Ensure seamless UI overlay with proper layering.

    - **UI & Overlays**
      - [ ] Implement `ChestOpeningScene`.
      - [ ] Implement `LoseLifeScene`.
      - [ ] Implement `SettingsScene`.
- **Back end:**

#### Sprint 3
- **Front end:**
  - **Svelte**
    - **Final Testing & Debugging**
      - [ ] **Unit Testing** with **Svelte Testing Library**.
      - [ ] **End-to-End Testing** with **Cypress**.
      - [ ] **Accessibility Testing** using **Google Lighthouse**.
  - **Phaser**
    - **Save Optimization (Phaser)**
      - [ ] Implement `compareFloorState(Floor oldFloor, Floor newFloor)`.
      - [ ] Ensure `Save()` only updates changed elements.
      - [ ] Call `Save()` when opening a chest (`openChest(Chest chest)`).
      - [ ] Call `Save()` when progressing to a new floor (`progressToNextFloor()`).
    - **Final Polish (Phaser)**
      - [ ] Optimize floor loading to load only adjacent rooms.
      - [ ] Implement animations for movement, attacks, and UI transitions.
      - [ ] Implement additional sound effects for interaction.
      - [ ] Final round of playtesting for balancing and bug fixes.

- **Back end:**

### All Tasks Outline (Summary of all Tasks)

---
## System Architecture
### Subsystems and UML Class Diagrams

#### **Scene Structure & UML Layout - Phaser**

The game consists of the following **scenes**:

1. **MainMenuScene** - Displays title screen, allows navigation to settings or new game.
2. **ThemeSelectionScene** - Lets the player choose a theme between 3 options.
3. **DifficultySelectionScene** - Selects difficulty (Easy-Medium-Hard); passes to backend for floor generation.
4. **StoryScene** - Displays AI-generated story text while a new floor loads.
5. **GameScene** - Main gameplay scene (handles player movement, enemy interactions, etc.).
6. **LoseLifeScene** - Triggered when the player dies but has remaining lives.
7. **GameOverScene** - Triggered when the player loses all lives; passes level to backend for high-score update.
8. **ChestOpeningScene** - Displays chest contents after opening; triggers save.
9. **SettingsScene** - Allows the player to manually save, adjust settings, or return to the main menu.

##### **Scene Interactions**
- `MainMenuScene` → `ThemeSelectionScene` → `DifficultySelectionScene` → `StoryScene` → `GameScene`
- `GameScene` → (`LoseLifeScene` or `ChestOpeningScene`) → `GameScene`
- `GameScene` → `GameOverScene` → `MainMenuScene`
- `SettingsScene` is accessible from `GameScene` at any time.

#### **Class Design & Inheritance - Phaser**
Phaser will be passed all of this information from the backend when calling the `create-game` endpoint. It will create copies of all of these classes to update as the User interacts with the game. The following are the names and descriptions of all the classes that Phaser will use:

##### **Rooms**
```plaintext
Room (abstract)
│-- NormalRoom
│-- ChestRoom (contains a Chest)
│-- StairRoom (contains a Stair)
```
- `Room`
  - `number type` 0: Normal, 1: Chest, 2: Stair.
  - `string[][] tiles` Contains single-character entries denoting the type of tile.
  - `EnemyObject[] enemies` Contains all enemies within the room.
  - `boolean isCleared()`
  - `updateEnemies(EnemyObject[])`

##### **Interactable Objects**
```plaintext
Interactable (abstract)
│-- Chest
│-- Stair
```
- `Interactable`
  - `boolean interact(Player)`

##### **Other Classes**
- `Floor`
  - `String theme` The theme of the dungeon.
  - `number level` 
  - `RoomObject[][] rooms` Contains all room objects in the floor
  - `RoomObject getRoomAt(number x, number y)` Returns a given RoomObject
- `Player`
  - `number health, posX, posY`
  - `move(direction)` Updates posX and posY.
  - `Item primaryWeapon, secondaryWeapon`
- `Enemy`
  - `number health, posX, posY`
  - `Item weapon`
  - `attack(Player)`
- `Item`
  - `string sprite`
  - `number damage`
  - `number type` 0: Melee, 1: Ranged, 2: Sweep, 3: AoE

#### **Backend Interactions - Phaser**

##### **API Endpoints**

| Endpoint | Request | Response | Purpose |
|----------|---------|----------|---------|
| `GetFloor(number difficultyLevel, String theme)` | `difficultyLevel, theme` | `FloorObject` | Retrieves floor layout, rooms, enemies. |
| `Save(Floor floorObject)` | `floorObject` | `200 OK` | Saves only updated enemy/chest attributes. |
| `GetText()` | None | `String` | Returns AI-generated story text. |
| `SetHighScore(number level)` | `level` | `200 OK` | Updates leaderboard on game over. |

#### **Utility Functions - Phaser**

##### **1. Room & Floor Management**
- `loadRoom(Room room)`: Loads a room when entered.
- `generateFloor(FloorObject floor)`: Initializes floor data from backend response.
- `generateRoom(RoomObject room)`: Places tiles, enemies, and objects.

##### **2. Collision & Movement**
- `checkCollision(Player, direction)`: Ensures movement is valid.
- `enemyPathfind(Enemy, Player)`: Moves enemies toward the player.

##### **3. Save & Compare Changes**
- `compareFloorState(Floor oldFloor, Floor newFloor)`: Determines what changed before saving. This optimizes Save() by only sending to the backend what changed.
- `openChest(Chest chest)`: Calls `Save()` when a chest is opened. Prompts the user to take or leave the item.
- `progressToNextFloor()`: Calls `GetFloor()` for the next level.

#### **Phaser-Svelte Interaction**

- **Svelte UI overlays Phaser**, pausing the game when active.
- Phaser listens for an event to **resume** gameplay when UI is closed.
- Svelte handles **login, leaderboards, accessibility settings, and subscription services**; Phaser handles **all other UI**.

#### Front-End Objects - Svelte

The frontend follows a **Component-Based Architecture** using **Svelte** with modular, reusable components.

#### **Frontend Subsystems & Component Breakdown - Svelte**
Each subsystem is implemented using **Svelte components**.

| **Component**       | **Purpose** |
|---------------------|------------|
| `Login.svelte` | Handles user authentication UI (input fields, validation) |
| `Signup.svelte` | UI for account registration, form validation |
| `Subscription.svelte` | UI for selecting and processing payments via Stripe API |
| `Settings.svelte` | User preferences (Appearance, Account settings) |
| `Game.svelte` | Embeds **Phaser.js** for game rendering |
| `Navbar.svelte` | Persistent navigation bar |
| `Button.svelte` | Reusable button component |
| `FormInput.svelte` | Handles form inputs (text, password) |
| `Modal.svelte` | Displays popups (notifications, alerts) |
| `ToastNotification.svelte` | Shows success/error messages |
| `LoadingSpinner.svelte` | Displays a loading animation while waiting for API responses |

#### **State Management**
We use **Svelte Stores** to efficiently manage UI state.

| **Store Name**  | **Purpose** |
|----------------|------------|
| `authStore.js` | Stores authentication state (user session, token) |
| `uiStore.js` | Stores UI preferences (dark mode, accessibility settings) |

### **Key User Interactions**
1. **User visits the Login Page (`Login.svelte`)**
   - Enters credentials → API Request → Redirect to Dashboard.
   - If incorrect credentials → Display **error message**.
   - If a new user → Clicks “Create Account” → Redirects to Signup.

   - **Elements:** Username, Password fields, Submit button.
   - **Interactions:** Redirects to Dashboard if login is successful.
   - **Accessibility:** Supports **keyboard navigation & screen readers**.

2. **Signup Process (`Signup.svelte`)**
   - User fills out form → API Request to register.
   - Email validation check → If invalid, **error message**.
   - If successful → Redirect to **Login Page**.
   - **Elements:** Username, Email, Password fields, Submit button.
   - **Interactions:** Redirects to Dashboard if signup is successful.
   - **Accessibility:** Supports **keyboard navigation & screen readers**.

3. **Subscription Process (`Subscription.svelte`)**
   - User selects plan → Processes payment via **Stripe API**.
   - If successful → Grants **premium features**.
   - **Elements:** Monthly & Lifetime subscription options.
   - **Interactions:** Payment processing via **Stripe API**.
   - **Error Handling:** Displays **errors on failed transactions**.

4. **Settings Page (`Settings.svelte`)**
- **Elements:** Change Username, Update Preferences.
- **Interactions:** Saves settings in **local storage & database**.

#### Accessibility

We ensure **UI accessibility compliance** with **WCAG standards**.

**Keyboard Navigation** – `Tab` key support for form fields  
**Color Contrast Compliance** – Ensuring readability for visually impaired users  
**Screen Reader Support** – Adding `aria-label` attributes to key elements  

#### Flow and Design for Pages
The Phaser application containing all game-related UI will be embeded within a Svelte page. Each component will work independently in a sort-of baton pass system to display all the necessary pages. The following UML diagram displays this interaction and outlines all frontend pages and scenes.

![Front-End UML](./assets/Frontend%20UML.png)

## **Database Interaction (API Endpoints)**
The frontend communicates with **backend APIs** to fetch/update user data.

| **API Endpoint**       | **Purpose** |
|-----------------------|------------|
| `POST /api/login` | Authenticates users |
| `POST /api/register` | Creates new accounts |
| `GET /api/subscription` | Fetches available plans |
| `POST /api/subscribe` | Processes payment |
| `GET /api/settings` | Fetches user preferences |
| `POST /api/settings` | Updates user preferences |

### Database Tables

### Backend UML

### System Performance

### Security Risks
Last Game is structured in such a way as to block as many potential security risks as possible from the get-go. Last Game will only collect information that is absolutely necessary for a functioning game with accounts, including username, password, and email. Collecting little information will lessen risks of sensitive data leaks due to bad actors, This will also ensure Last Game complies with privacy Laws such as GDPR. Security for other portions of the project are handleded by the external services, such as Stripe or the Groq AI, that Last Game will make API calls to. For more information on how the security of these services will work with Last Game, see the following sections:

[Stripe](#stripe) | [Groq](#groq) | [Postgres](#postgres)

For other security concerns mentioned in the High-Level Design Document, NaN's approach is to divide them between the following sections:

#### Authentication
Last Game will use JWT tokens for authenticating players. This approach will validate users that have logged in and will engage both the back end and front end to ensure user's game sessions are unique to them. When users create an account or log in, a token will be created and sent to the front end. The front end will then send the token through the Authorization header to the backend, which will validate that the user is authorized to retrieve relevant information. This approach will help with validating if users are subscribed or not in regards to Stripe and will keep each user's game experience consistent throughout their sessions and after playing and saving the game. 

Implementation of JWT authentication will be done using the robust Go module jwt-go found at https://github.com/golang-jwt/jwt. This module offers multiple methods that will be helpful:

### Key  Methods
| Method | Purpose |
|---------------|---------|
| `jwt.NewWithClaims(jwt.SigningMethodHS256, claims)` | Creates a new JWT token with claims. |
| `token.SignedString(secretKey)` | Signs the JWT with a secret key and generates the token string. |
| `jwt.Parse(tokenString, keyFunc)` | Parses and validates a JWT token. |
| `jwt.ParseWithClaims(tokenString, claims, keyFunc)` | Parses a token and extracts claims. |
| `jwt.NewNumericDate(time.Now().Add(time.Hour * 24))` | Sets an expiration time for a token. |

### Common JWT Claim Fields
| Claim | Description |
|-------|-------------|
| `sub` | Subject (user ID). |
| `exp` | Expiration time. |
| `iat` | Issued at timestamp. |
| `email` | Stores encrypted email (for additional security). |

Encryption of user passwords will be done using Go's cryptography package and will use specifically bycrypt, found at golang.org/x/crypto/bcrypt. Bycrypt automatically adds salt to encrypted strings and has provisions for cost factors. The following are related methods offered that will be used:

### Methods for Hashing & Verifying Sensitive Data
| **Method** | **Purpose** |
|------------|------------|
| `bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)` | Hashes a password securely. |
| `bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))` | Compares a hashed password with a plaintext password. |
| `bcrypt.DefaultCost` | Default security level (cost factor of **10**). |
| `bcrypt.MinCost` | Lowest security (cost **4**, will probably not be used). |
| `bcrypt.MaxCost` | Maximum security (cost **31**, very slow). |


For authentication specifically, these methods will be used in the following:
* Create_account()
    - recieves user information (username, password, email) from front end, encrypts the password and email, and creates a JWT token (jwt.NewWithClaims(), token.SignedString()), and sends it to the database for storage
* Login()
  - recieves user information, checks it against the database, if match then sign in and create JWT token ((jwt.NewWithClaims(), token.SignedString())), if not then rejects sign in
* Refresh_token()
  - Creates a refresh token that will be sent with the access token so that new access tokens can be created without logging out the user. 

#### Encryption in Middleware
Following initial encryption and token creation in authentication, any time the user does something that needs authenticating from the front end, endpoints called will be wrapped in middleware. One of these middlewares will be isAuthenticated(), which will be used in the following process: 

| **Step** | **Action** |
|----------|-----------|
| **1. User Logs In** | `login()` verifies password → Issues JWT token. |
| **2. User Makes Request** | Frontend sends JWT in the `Authorization` header. |
| **3. Middleware Runs** | `isAuthenticated()` extracts and verifies the token. |
| **4. If Token is Valid** | The request is allowed; user ID is extracted and added to context. |
| **5. If Token is Invalid** | Request is blocked (`401 Unauthorized`). |

The middleware checks the JWT token by:

1. Extracting the token from the Authorization header.
2. Validating the token's signature, expiration, and claims.
3. Extracting user data from the token and attaching it to the request context.
4. Allowing or blocking the request based on validation.

This will ensure that the requested data is sent to the correct users. 

---
## Programming Languages and Frameworks
### Front End

| **Technology**  | **Purpose** |
|---------------|------------|
| **Svelte (TypeScript & HTML)** | Reactive UI framework |
| **Tailwind CSS** | UI styling |

### Back End
### APIs and External Interfaces

#### **Stripe:**
Stripe will be used to process payment information for subscriptions to Last Game. Code related to executing Stripe functions  will reside in the Authentication file. Payment information will be input through the front end subscription page, and related information will be sent to the back end and processed in the Authentication file. 
* Create Developer Account with Stripe
* Secure API key and store in environment variables to keep key secure
* Use the Stripe SDK built for Go, github.com/stripe/stripe-go/ to accomplish the following taks:

| Task | Prebuilt in SDK | Custom Code Needed |
|------|-----------------|---------------------|
| Create a customer |  `customer.New()` | Store `customer.ID` in DB |
| Subscribe a customer |  `sub.New()` | Store subscription details (isSubscribed(), subscription ID) |
| Handle webhook events (did payment go through?) |  `webhook.ConstructEvent()` | Update user’s premium access |
| Check subscription status | ❌ | Query database for existence of customer ID and subscription ID |

* Back end recieves a Stripe Id that will be processed via process_payment() in the authentication file. The method will check that the email associated with the Stripe ID matches the email associated with the current user and either validate or deny moving forward with the subscription.

* The back end will return a Stripe URL to the front end that will take the user to the payment screen. After processing payment and verifying with the backend through the webhook that the payment was successful or rejected, Stripe will redirect to our front end site. 

This approach  should increase security by removing the need to store payment information in the database. The database will only interact with customer and subscription IDs, meaning the database will never see sensitive payment information. That information and security will be offloaded to Stripe, which is well known and trusted in the community.


## Deployment Plan
### These are ideas! I took them from the best example, we can come up with our own!

### Docker
Docker allows the team to avoid "it works on my machine" issues, removes the need for each team member to download every software on the front end and back end to test the game, and makes deployment simple long term. Every team member will be able to fully focus on their respective components or assignments, allowing for a smoother development and testing process. As such, setting up docker for the game is a high priority task and involves the following steps:

1. Make docker account and download docker
2. Create Dockerfile for the back end (GO)
3. Create a Dockerfile for the front end (Svelte + Phaser)
4. Combine separate dockerfiles into an aggregate docker-compose.yml file (this file will encapsulate the Postgres database as well)
5. Ensure External APIS are properly called from the aggregate file by the following table:

| API | How It's Accessed | Example Code |
|------|----------------|---------|
| **Stripe** | Backend makes HTTPS calls | `payments.HandleStripeWebhook()` |
| **AI (Groq)** | Backend sends HTTP requests | `ai.GenerateRoomLayout()` |
| **Phaser.js** | Runs in frontend, served via browser | `import Phaser from "phaser";` |
| **PostgreSQL** | Runs in Docker, backend connects via `DATABASE_URL` | `gorm.Open(postgres.Open(dsn))` |
6. Use docker compose to start and stage the project
 


- **Development Environment Setup**
- **Staging Environment**
- **User Acceptance Testing**
- **Production Environment Testing**
- **Production Deployment**
- **Monitoring and Maintenance**
- **Scaling**