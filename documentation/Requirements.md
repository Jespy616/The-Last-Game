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
* There must be a warning to not send sensitive data to the AI because we won't have control of the server use due to costs as mentioned in the [Wont-Have](#wont-have) section. Sensitive information includes usernames, emails, passwords, addresses, etc.
* User information, such as passwords, usernames, and email, must be protected (encrypted) during transit and when stored. In the event of a data leak, this will prevent malicious users from stealing other users data.
* User interactions with the AI must be annonymous, or at the very least stored for no longer than is needed*. This will prevent the risk of data leaking as well as protecting the user from any bias or hurtful statements that might come from the AI.
* There must be fail-safes for if the AI generates an invalid response. The program must not crash if an invalid response is given.
* There must be a rate limit for AI interactions*. This would help the server to maintain its high level of uptime by preventing an attacker trying to do a Denial of Service (DoS) attack. This protection will also prevent malicious users from increasing the costs incurred by the AI. 

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


### Could-Have
* The game could have an option to play offline if no internet is available. This would require the AI to be included in the game files which would significantly increase the storage size of the game. It would also require the user to have a GPU that is able to run the AI, which would limit the target audience. 
* There could be a backup system for if the AI server is down or unable to be reached where the game is still playable without AI. While this is possible, it would likely add a lot more work than we would have time for, as well as contraticting the customers requests.
* The game could word on mobile devices, such as smartphones or handheld consoles (Nintendo Switch, Steam Deck, etc). This would also require controller support, which could happen if there is enough time.
* The game could be set up in a way to allow for multiple language support*. However, as will be discussed in the [Won't-Have](#wont-have) section, it is not feasable to add multiple languages with our time constraint, so this is not a priority.
* We could use 3rd party services to host the AI. This would significantly lower the hardware that is needed to run the game which would allow more people to play the game.
* The game could have settings that allow the user to control the audio levels and remap the controls. While these are nice to have, there are ways that the user can control these already, so it is not a big priority for version 1.0.
* The server could use a mix of horizontal and vertical scaling, horizontal meaning more quantity of hardware with vertical meaning more quality (processing power). Horizontal scaling should be prioritized because it is unclear if vertical scaling would allow for the AI to respond fast enough if there are multiple users using the same instance of the AI. This would not be applicable until we are able to host our own server.

### Won't-Have
* The 1.0 version won't have support for multiple languages due to time and cost. This could be possible for future versions, but is not feasable with the current time restrictions.
* Due to costs, we won't be hosting our on server for the AI. It would be very expensive to get and run the hardware that is powerful enough to run the AI at a scale big enough to support multiple users. One alternative which is mentioned in the [Could-Have](#could-have) section is to ue a 3rd party service to host the models for a cheap cost, however this would also mean accepting their security risks as well.
* The code base won't be structured monolithically in order to improve maintainability. 
* Due to time constraints, there won't be an accessability option for text-to-speech in version 1.0.


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

