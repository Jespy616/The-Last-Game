from groq import Groq
from pydantic import BaseModel, Field

def storyWorkflow(prevArea, nextArea, prevStory, apiKey):
    agent = Groq(api_key=apiKey, timeout=5)
    story = makeStory(agent, prevArea, nextArea, prevStory, "")
    return story

def makeStory(agent, prevArea, nextArea, prevStory, story):
    """
    Prompts the LLM to create a story given the previous story, previous area, and next story\n
    """
    try:
        chat_completion = agent.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are a dungeon master that outputs a story in text. You will be given the previous area and story and the next story to base your story off of. Do not use names for the player or for locations.\n The story must be a string."
                },
                {
                    "role": "user",
                    "content": f"Previous area: {prevArea}\nNext area: {nextArea}\nPrevious story: {prevStory}"
                }
            ],
            model="qwen-2.5-32b",
            temperature=1,
            max_tokens=250,
        )
        story = chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Error: {e}")
        if "Invalid API Key" in str(e):
            story = "Invalid API Key"
        elif "Rate limit reached" in str(e):
            story = "Rate limit reached"
        else:
            story = "An error occurred while generating the story"
    return story