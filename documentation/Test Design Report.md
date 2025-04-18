### **Overview**

This document outlines a thorough testing plan for Last Game so the end result is stable, bug-free, and deployment-ready. Our plan consists of a range of unit tests, integration tests, system tests, and manual tests in both frontend and backend components. Each test will serve a specific purpose within the application. Testing is organized by components: Svelte (UI), Phaser (game engine), Go (backend services), PostgreSQL (database), Docker (containerization), and AI. Our goal is to emulate real user usage, identify edge cases, and confirm each feature is stable across the project.

### **Challenges**

- **Event-Driven Game Engine:** Since Phaser is primarily driven by events and a continuous update loop, it will be nigh-impossible to have full coverage using automated tests. Manual tests or a framework like Puppeteer will have to be used where timing is necessary, such as input validation.  
- **Docker Tests:** Finding ways to test that Docker properly loads up all the containers in the proper way will take some studying to figure out. Testing a proper connection between the containers will be difficult to come by to ensure consistency in loading up the docker-compose.  
- **Docker Database Tests:** Finding a way to have a docker container for a test database that will properly work on everyone’s machines will take some time to figure out. Especially if the docker container relies on different personal-test.env files depending on how we choose to go about that for security purposes.  
- **AI Tests:** Because the AI can produce an infinite amount of different responses, it is almost impossible to completely cover all of the possible ways that the AI can respond. This makes the testing very hard because the one response that might cause the program to fail could never happen during testing.  
- **Asynchronous API Handling for UI:** The UI components rely on async API responses. Simulating these in unit tests can be tricky due to the need for realistic delays and error conditions.  
- **Maintaining UI State Across Components:** The use of Svelte stores to manage global state can make testing more complex when testing interactions across multiple components.

### ---

**Backend \- AI**

**Unit Tests**  
	These tests will be robust to allow for checking different areas of AI generation regardless of the arguments that will be used. For example, a more thorough test will run all of the arguments, but the tests should also work with some of the arguments missing. 

1. test\_response\_structure():  
   - Checks if the response has all of the expected attributes  
2. test\_floor\_generation():  
   - Checks for expected and unexpected attributes  
   - Checks the structure of the ‘rooms’ dictionary that contains the rooms  
   - Checks that each room has the expected structure  
   - Checks the adjacency matrix to make sure every room is reachable  
3. test\_enemy\_generation():  
   - Checks for expected and unexpected attributes  
   - Checks to see if the attack & health are numbers that are greater than 0  
   - Checks to see if a valid sprite was chosen  
4. test\_weapon\_generation():  
   - Checks for expected & unexpected attributes  
   - Checks to see if attack & type are numbers that are greater than 0  
   - Checks to see if a valid sprite was chosen  
5. test\_story\_generation():  
   - Checks if the story is more than 50 characters  
   - Checks if the story ends in the middle of a sentence  
6. test\_invalid\_api\_key():  
   - Checks if the correct error message is returned when giving an invalid API key

### ---

**Backend \- Go**

**Unit Tests**

- Authorization:  
1. hashString():   
- Returns a hashed string  
- Returns an error if incorrect data is input (object, function)  
2. GenerateTokens():   
- Returns a struct with a correct access token and refresh token pair when a userID is provided  
- Both output tokens contain the user id and a proper expiration date with proper input  
- Fails when incorrect input is given (string, object, function)  
3. register():   
- Outputs a valid JSON object, fails otherwise  
- Fails if given a GET request  
- Outputs an error message when an incorrect (already used) username is provided and fails to create a new user  
- Outputs an error message when an incorrect (already used) email is provided and fails to create a new user  
- Fails if hashing or token creation fails  
4. refreshToken():   
- Outputs a valid JSON object, fails otherwise  
- Fails if given a GET request  
- Fails if the secret key is missing  
- Fails if token creation fails  
5. login():   
- Outputs a valid JSON object, fails otherwise  
- Fails if given a GET request  
- Outputs an error message when an incorrect username is provided   
- Outputs an error message when an incorrect password is provided  
- Fails if token creation fails  
6. verifyToken:   
- Outputs a valid JWT token  
- Fails if the secret key is missing  
- Fails if the token is invalid or if the claims are invalid  
- Fails if the expiration date in the token has passed

   
**Integration Tests**

- Authorization  
1. register():   
- Correctly queries the Postgres database to check for user data  
- Ensure this function returns, in a JSON object, an access token, refresh token, associated user id, and a success message when given proper input for a new user in a POST request from the front end   
- A POST request from the frontend containing form collected user data will result in the creation of a new user in the Postgres Database.  
- A POST request with incorrect data(non-unique data, injection attacks) does NOT create a new user in the database and returns an error message  
2. login():   
- Correctly queries the Postgres database to check for user data  
- Ensure this function returns, in a JSON object, an access token, refresh token, associated user id, and a success message when given proper input for a new user in a POST request from the front end   
- A POST request from the frontend containing form collected user data will result in the creation of access and refresh tokens associated with a specific user  
- A POST request with incorrect data(non-unique data, injection attacks) does NOT execute or allow logging in  
3. refreshToken():  
- A POST request from the frontend containing an expired access token and current refresh token will result in the creation of a new access token  
- A POST request with incorrect data(non-unique data, injection attacks) will fail  
4. authenticateMiddleware():  
- Extracts provided access token associated with a user, checks if it is expired, and allows access to the user if it is not expired

### ---

**Backend \- PostgreSQL**

**Schema Tests**

- A lot of these tests can be handled with the different query tests we will run. If a query test fails, it will tell us if a table column isn’t initialized properly.   
- We also have a safeguard in our docker compose file that makes the backend dependent on a successfully created and running database container. If the database container isn’t up and running properly then the backend image will not be started.

**Query Tests** 

- For query tests, we are hoping to be able to achieve a 100% coverage of the database query code and the related functions.  
- These tests will be performed using the built in test library for Go.  
- Tests will be performed using a test database that will be run locally on individual machines as of right now. We want to move to having a test database that can be run by docker so that everyone is using the same database.  
- There will be CRUD tests for each database table.  
1. Create\*\*\*\*():  
- This will test the ability to create an object from each table.  
- There will be different tests for creating objects making sure that the proper errors are handled for different table constraints ie. unique fields and any character limit restraints.  
2. Delete\*\*\*\*():  
- This will test the ability to properly delete values from the database.  
- There will be tests to ensure proper cascading of values that have foreign keys to other models/tables in the database.  
3. Read\*\*\*\*():   
- This will test the ability to properly retrieve and read values from the database.  
- There will be tests to ensure correct data representation for different queries throughout the database.  
- This will also help test our more complex queries that are utilized.  
4. Update\*\*\*\*():   
- This will test the ability to update values in the database that have already been created.  
- This also will include proper error handling for different database constraints and ensuring those restraints are withheld even with an update call.  
5. CreateGame():  
- A test will be utilized for ensuring our CreateGame endpoint function is making all the proper calls to the database and retrieving valid data from the ai.  
6. SaveGame():  
- A test will be utilized for ensuring our SaveGame endpoint function will properly update the data with correct values from the frontend. This test could potentially be broken up into smaller tests since the SaveGame function will be calling Update on all the different tables within the database that have been changed in the frontend.

### ---

**Backend \- Docker**

Because testing Docker amounts to running the docker containers to see if they work, we will ensure that Docker will work during system testing by running the docker-compose.yml file. If all the containers pass their tests and run, then Docker is working correctly. A Docker\_README.md file will be provided to give step-by-step instructions for running Docker in the project.   

### ---

**Frontend \- Svelte**

The goals of these tests are to provide confidence in the form validation logic and UI flow. This will assure that all of the login and signup forms will work properly and consistently. This will also help us to make sure that the UI components will interact and flow together correctly.  
**Unit Tests** 

1. Login  
   - testLoginFormValidation: Ensures submission is blocked if fields are empty or invalid  
   - testLoginApiSuccess: Mocks successful login API response and checks correct redirection  
   - testLoginApiFailure: Mocks failed login and checks for correct error message display  
2. Account Creation  
   - testSignupFieldValidation: Ensures all required fields are filled and valid  
   - testSignupSuccessRedirect: Confirms redirect after successful signup  
3. Settings  
   - testSettingsPreferenceSave: Verifies user preferences are saved

**Integration Tests**

- testFullLoginFlow: Tests full login process: input, submission, API response, and redirection  
- testSignupAndRedirect:Tests full user account creation form input, validation, and redirect  
- testPasswordResetFlow: Tests forgot password page and API call for password reset  
- testSettingsUpdateFlow: Validates that changes are saved and UI feedback is shown  
- testProtectedRouteRedirect: Checks that unauthenticated users are redirected away from protected pages

### ---

**Frontend \- Phaser**

**Unit Tests**  
Since Phaser is running in a Vite system, Vitest should be a sufficient unit-testing framework for most of the following functions. There are also frameworks, such as Phaser Mock, that make it easy to create lightweight scenes that will only provide the minimum necessary components for scene-dependent functions to run (like animations). Since animation management has been a particularly unstable part of our Phaser component, a wider coverage of tests might be necessary for these scene-specific functions.

1. Floor Generation Functions  
   - generateTileIDs: Returns the correct id for tiles based on their neighbors  
   - assignCollisions: Assigns correct collision values based on tile IDs  
   - convertToMatrix: Returns a 13x9 matrix given a string of w’s and .’s  
   - createTilemap: Utilizes the above functions to return a tilemap object  
2. Combat Functions  
   - enemyIsInRange: Returns true if there is an enemy in range of the player  
3. Animation Functions  
   - createPlayerAnimation: Adds a new player animation to the current scene’s Animation Manager  
   - createEnemyAnimation: Adds a new enemy animation to the current scene’s Animation Manager  
   - destroyAnimations: Removes all animations from the Animation Manager

**Manual Tests**  
Since Phaser relies heavily on timing and produces mostly visual results, manual tests will be necessary for the following components. Movement and combat are very intertwined in our Phaser application, so tests that utilize both at once might also be necessary. A significant portion of development time has been dedicated to these components due to their complexity, so thorough tests that include edge-cases will be used to ensure they work as intended. 

1. Combat  
   - Enemy/Player health bars correctly update when damage is taken  
   - Enemies are removed when their health falls below 0  
   - Game Over screen starts when player’s health falls below 0  
2. Movement  
   - Player cannot pass through collidable tiles  
   - Enemies move only when player moves  
   - Input functions are disabled while enemies are attacking  
   - Transitioning between rooms works as expected  
3. Floor Generation  
- Story Text is properly displayed before the floor is displayed  
- Floor transitions are stable and consistent

**Integration Tests**

- getGame: fetches a game object from the backend  
- saveGame: sends the current state of the game object to the backend  
- loadGame: loads the state of a previously-saved game from the backend

### 

### ---

**System Tests**

Our system tests should replicate the user experience, covering all basic functions that a user might perform.

\[Our system tests will use the following format\]

---

**Task**  
\[Provide a 1-sentence overview. Then, describe any context/prerequisites\]

1. \[Step description\]  
2. \[Step description\]  
3. …  
4. **Expected Output:** \[Output description\]

\[Screenshot\]  
---

The following will be our system tests to replicate E2E user journeys:

1. **Docker Setup**  
   1. Walk the user through setting up Docker via the README   
   2. Ensure that the application runs correctly in a web browser  
2. **Create Account**  
   1. Ensure that credentials are properly validated and stored (encrypted) within the database  
3. **Log In**  
   1. Ensure that valid credentials move the user to the main menu page  
   2. Ensure that invalid credentials yield an error and prompt the user to try again.  
4. **Start Game**  
   1. Ensure that the user is prompted to provide details for game creation.  
   2. Ensure that the game is created according to these specifications.  
5. **Save and Exit Game**  
   1. Ensure that the current state of the game is properly sent back to be processed and store in the backend.  
   2. Ensure that the User is sent to the main menu page.  
6. **Load Game**  
   1. Ensure that the exact state of the game that was previously saved to the database is loaded for the user to continue playing.