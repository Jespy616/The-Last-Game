# Requirement Analysis of Last Game
**Developers: NaN**

## Description of the Project:


## Functional Requirements:

### Must-Have:

* Example text
* example text

### Should-Have:

* Example text
* Example text 

### Could-Have
* Example Text
* Example text

### Won't-Have

* Example text
* Example text

## Nonfunctional Requirements:
_Perplexity was used to help generate ideas for the nonfunctional requirements section (noted with an *). Most of the ideas that were used from Perplexity were ideas that were at first thought to be included in design, but actually fit the requirements section. - Jaxton_

### Must-Have:
* There must be a warning to not send sensitive data to the AI because we won't have control of the server use due to costs as mentioned in the Wont-Have section. Sensitive information includes usernames, emails, passwords, addresses, etc.
* User information, such as passwords, usernames, and emails, must be protected (encrypted) during transit and when stored. In the event of a data leak, this will prevent malicious users from stealing other users' data.
* User interactions with the AI must be anonymous, or at the very least stored for no longer than needed. This will prevent the risk of data leaks and protect the user from any bias or hurtful statements that might come from the AI.
* There must be fail-safes in place if the AI generates an invalid response. The program must not crash if an invalid response is given.
* There must be a rate limit for AI interactions. This would help the server maintain its high level of uptime by preventing an attacker from attempting a Denial of Service (DoS) attack. This protection will also prevent malicious users from increasing the costs incurred by the AI.
* The game must be able to load all necessary screens and data within 5 seconds (no more than 10 seconds).
* The game must have smooth transitions between the different screens (home, settings, pause, etc.) and game levels.
* The tutorial must be short and to the point. Users must be able to understand all available options for game functions, including moves, settings, and AI interaction.
* Users must be able to log in using a username or email, and a password. Passwords must be hashed and securely stored in the database.
* The game must be accessible and playable from any browser: Firefox, Chrome, Edge, etc.
* The game must follow the 9 nines of availability.
* Users must be able to save game data such as inventory, level, skill, characters, and AI-generated user-specific gameplay.
* The game must have colors that are easily seen by people, including those with visual impairments.
* Users must be able to recover a forgotten password or username. This must be done via email or text link to a page that allows them to recover or reset their username or password.
* The game must have a warning page if the application servers are failing or unavailable.
* The AI will have restrictions on what type of games can be generated. All game styles must be appropriate. Users must not be able to generate anything deemed inappropriate in the game.
* The game must have the settings page navigator accessible at all times.
* The game must have the pause button accessible at all times.
* The user must be able to save their progress at any time in the game and be able to get back to that specific point in time when they log back in.
* The game must not be operating system specific and should work on all major operating systems: Mac, Linux, and Windows.

### Should-Have:
* The AI should respond or generate content in less than 3 seconds. The response time should be kept as small as possible to prevent the users from waiting for too long. The AI should not take any longer than 5 seconds to respond. If the AI is taking longer than expected, there should be a visual indicator that shows to let the user know that the AI is loading.
* The AI should provide consistent and coherent responses across all interactions with the user. The user should feel like the AI is creating a story or scenario that is consistent throughout the play session.
* The AI should have filters to prevent inappropriate content*. This could be built into the model depending on how it was trained. It **must** be verified that the filters exist before the game is deployed.
* Multiple users should be able to play the game at the same time. Because we won't have control over the servers, we will be unable to handle the scaling ourselves at this point. As such, it will need to be designed in a way that allows for the AI to handle several users at a time.
* The server the AI is on should have a high level of uptime, or should be available about 99.99% of the time. The actual uptime could be slightly lower if we use 3rd party services.
* The codebase should be structured modularly to allow for easy maintainability. This allows for quick bug finding and easy refactoring. It also allows for new additions to be made quickly and efficiently. 
* Testing should be quick and automatable to quickly check the functionality of the code and prevent bugs from arising. The tests should be run frequently after changes are made to verify the functionality of the changes.
* Menus should be easy to navigate. The design of the menus should be intuitive and simple. Confusing language should be avoided so that new users are able to learn it quickly.
* There should be options that allow for accessability control by the user. Some examples include changing the font size and a color blind mode.
* The game should scale to work on different screen sizes. Because users will most likely have different sizes of screens, the game needs to be able to be resized to allow for the user to have a comfortable experience no matter their screen size.
* The user should be able to toggle the sound effects of the game on and off.
* Users should be able to save AI generated levels/worlds and share them with other users.
* The game should have screen size adaptations for all different sizes of monitors: mobile phones, laptop screens, large monitors, Television sets, etc.
* The game should have a way to connect to a money processing api that allows users to purchase subcriptions plans in the game.
* The game should have a way to connect to an ad api such as google ads for different ways to produce ads in the game.
* The game should have a login attempt limit to protect against hackers using brute force attacks attempting to login to other users accounts and gain access to their data and personal information stored in the game.

### Could-Have
* The game could have an option to play offline if no internet is available. This would require the AI to be included in the game files which would significantly increase the storage size of the game. It would also require the user to have a GPU that is able to run the AI, which would limit the target audience. 
* There could be a backup system for if the AI server is down or unable to be reached where the game is still playable without AI. While this is possible, it would likely add a lot more work than we would have time for, as well as contraticting the customers requests.
* The game could word on mobile devices, such as smartphones or handheld consoles (Nintendo Switch, Steam Deck, etc). This would also require controller support, which could happen if there is enough time.
* The game could be set up in a way to allow for multiple language support*. However, as will be discussed in the [Won't-Have](#wont-have) section, it is not feasable to add multiple languages with our time constraint, so this is not a priority.
* We could use 3rd party services to host the AI. This would significantly lower the hardware that is needed to run the game which would allow more people to play the game.
* The game could have settings that allow the user to control the audio levels and remap the controls. While these are nice to have, there are ways that the user can control these already, so it is not a big priority for version 1.0.
* The server could use a mix of horizontal and vertical scaling, horizontal meaning more quantity of hardware with vertical meaning more quality (processing power). Horizontal scaling should be prioritized because it is unclear if vertical scaling would allow for the AI to respond fast enough if there are multiple users using the same instance of the AI. This would not be applicable until we are able to host our own server.
* The game could have PWA (Progressive Web Application) capabilities for easy an easy way to access the game. 
* The game could have multi-factor authentication for secure login and data saving through email or text code verification.
* The game could have theme music that is generated by the AI that is fitting for the display and personality of the game.
* The game could have a mobile application with the same form of AI generated gameplay and available in the different major mobile app stores.
* The game should have accessibility features such as aria with screen readers. Due to time constraints, there most likely won't be an accessability option for text-to-speech in version 1.0.

### Won't-Have
* The 1.0 version won't have support for multiple languages due to time and cost. This could be possible for future versions, but is not feasable with the current time restrictions.
* Due to costs, we won't be hosting our on server for the AI. It would be very expensive to get and run the hardware that is powerful enough to run the AI at a scale big enough to support multiple users. One alternative which is mentioned in the [Could-Have](#could-have) section is to ue a 3rd party service to host the models for a cheap cost, however this would also mean accepting their security risks as well.
* The code base won't be structured monolithically in order to improve maintainability. 
* The game won't have need for multi-player abilities: online multiplayer or in-person multiplayer with multiple controllers.
* The game won't have need for any multi-player latency requirements.
* Users won't have the ability to select different AI models to generate their gameplay.
* The game won't have need for 3D graphics and resolution as it will be a 2 dimensional game.
* The game won't have a way to chat with other users that are online whether through text or voide call.
* The game won't have need for switching between different game sights. Such as first and third person.
* The game won't have to work on different types of gaming consoles such as Playstation, XBox, or Nintendo.

## Business Requirements:

### Must-Have:

* Example text
* example text

### Should-Have:

* Example text
* Example text 

### Could-Have
* Example Text
* Example text

### Won't-Have

* Example text
* Example text

## User Requirements:

### Must-Have:

* Example text
* example text

### Should-Have:

* Example text
* Example text 

### Could-Have
* Example Text
* Example text

### Won't-Have

* Example text
* Example text

## Use Case Diagrams:

