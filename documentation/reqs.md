## Performance
* The AI **should** respond/generate in less than 3 seconds
  * **should** not be more than 5 seconds
  * Kept as small as possible to prevent users from waiting
  * Provide an indicator if the model is taking longer than expected
* AI **should** provide consistent and coherente responses accross interactions
* **Should** have failsafes incase AI produces an invalid response

## Scalability
* AI **should** be scalable to work with multiple users
  * would use horizontal scaling - more hardware to support more users
  * Wouldn't need a history - fed information on the game and told to generate based on given info
  * allows for one model for a few users - reduces the need for more hardware -> reducing costs
* **Could** use a queue for handling many users

## Usability
* **Could** have option to play offline
  * would require the AI model to be included in the game files
  * depends on if the user has a GPU -> reduces importance
* **Could** work on mobile devices (smartphones, handheld consoles)
* **Could** have controller support
* **Wont** have multiple language support due to time constraints
  * **Could** be designed to support other languages later

## Availability
* AI server **should** have high level of uptime (~99.99%)
  * May be slightly lower due to not having control over the server itself
* **Could** have a backup system if the AI server is unreachable
* Game **Could** work on different OSs
  * **Should** work on different browsers

## Security
* Without a custom server for the AI, data most likely wont be able to be encrypted
  * Due to costs, we **wont** host a server with sufficient processing power to run the AI
    * Hopefully the server will have good security
  * **Must** Include a warning to not send personal info (passwords, addresses, etc.)
  * **Could** use 3rd party services for hosting AI models at a cheaper cost
    * relies on their security systems
* User information (passwords, username, email) **must** be protected/encrypted
* User interactions with the AI **must** be annonymous / stored no longer than needed
* **Should** have a rate limit for AI interactions
  * prevents attackers form using DoS attacks and increasing costs
* **Could** have filters on AI content to prevent inappropriate content
  * might be built in already depending on model

## Maintainability
* Code **should** be structured modularly to allow for easy maintainability
  * allows for code to be refactored easily and for quick bug identification
  * also allows for additions to be made quickly and efficiently
* Code **Wont** be strucured monolithically (not all in the same file)
* Testing **should** be quick and automatable to allow for quick checks for bugs
  * Tests **should** be run frequently (after changes are made) to verify the functionality

## Accessibility
* Menus **should** be easy to navigate
  * design should be intuitive and simple
    * Avoid confusing language 
  * new users that have never used it should be able to quickly learn
* **Should** have options to allow for accessability control by the user
  * change font size, color blind mode, etc.
* **Could** have other options in settings
  * Audio levels
  * Control remapping
* **Wont** have screen reader - due to time

## Compatibility
* **Should** scale to work on different monitor/screen sizes