import os
import openai
from pathlib import Path
import logging
from typing import Tuple, Optional

# Set OpenAI API key from environment
OPENAI_API_KEY = os.environ.get('EMERGENT_LLM_KEY', 'sk-emergent-66f9bD814Ce5aDb97D')
openai.api_key = OPENAI_API_KEY

PODCAST_DIR = Path("/app/uploads/podcasts")
PODCAST_DIR.mkdir(exist_ok=True, parents=True)


def generate_founder_story_script(brand_name: str, founder_name: str, brand_story: str, mission: str) -> Tuple[str, str]:
    """Generate founder story podcast script (max 5 minutes)"""
    
    prompt = f"""
    Create an engaging, conversational podcast script for a founder story episode.
    
    Brand: {brand_name}
    Founder: {founder_name}
    Story: {brand_story}
    Mission: {mission}
    
    Requirements:
    - Warm, friendly tone
    - Maximum 5 minutes when spoken (roughly 750 words)
    - Introduce the brand, founder journey, and mission
    - Make it personal and authentic
    - End with excitement about the current season/deals
    
    Format:
    Title: [Create an engaging title]
    Script: [The full podcast script]
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a skilled podcast writer who creates warm, engaging brand stories."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=1500
        )
        
        content = response.choices[0].message.content
        
        # Extract title and script
        lines = content.split('\n')
        title = ""
        script = ""
        
        for i, line in enumerate(lines):
            if line.startswith('Title:'):
                title = line.replace('Title:', '').strip()
            elif line.startswith('Script:'):
                script = '\n'.join(lines[i+1:]).strip()
                break
        
        if not title:
            title = f"The {brand_name} Story with {founder_name}"
        if not script:
            script = content
        
        return title, script
    
    except Exception as e:
        logging.error(f"Error generating founder story script: {str(e)}")
        raise


def generate_drop_episode_script(product_name: str, description: str, features: str, price: str, discount: str, brand_name: str) -> Tuple[str, str]:
    """Generate drop episode podcast script (max 90 seconds)"""
    
    prompt = f"""
    Create a quick, exciting podcast script for a product drop announcement.
    
    Brand: {brand_name}
    Product: {product_name}
    Description: {description}
    Features: {features}
    Price: {price}
    Deal: {discount}
    
    Requirements:
    - Energetic, enthusiastic tone
    - Maximum 90 seconds when spoken (roughly 200 words)
    - Highlight key features and the special deal
    - Create urgency and excitement
    - End with a clear call-to-action
    
    Format:
    Title: [Create an engaging title]
    Script: [The full podcast script]
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an enthusiastic podcast host announcing exciting product drops."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.9,
            max_tokens=500
        )
        
        content = response.choices[0].message.content
        
        # Extract title and script
        lines = content.split('\n')
        title = ""
        script = ""
        
        for i, line in enumerate(lines):
            if line.startswith('Title:'):
                title = line.replace('Title:', '').strip()
            elif line.startswith('Script:'):
                script = '\n'.join(lines[i+1:]).strip()
                break
        
        if not title:
            title = f"Discover {product_name} - {discount}"
        if not script:
            script = content
        
        return title, script
    
    except Exception as e:
        logging.error(f"Error generating drop episode script: {str(e)}")
        raise


async def generate_audio_from_script(script: str, merchant_id: str, episode_id: str) -> Tuple[str, int]:
    """Generate audio file from script using OpenAI TTS"""
    
    try:
        # Create merchant podcast directory
        merchant_dir = PODCAST_DIR / merchant_id
        merchant_dir.mkdir(exist_ok=True, parents=True)
        
        # Generate audio file path
        audio_filename = f"{episode_id}.mp3"
        audio_path = merchant_dir / audio_filename
        
        # Generate audio using OpenAI TTS
        response = openai.Audio.create(
            model="tts-1",
            voice="nova",  # Warm, friendly voice
            input=script
        )
        
        # Save audio file
        with open(audio_path, 'wb') as f:
            f.write(response.content)
        
        # Calculate duration (approximate: 150 words per minute)
        word_count = len(script.split())
        duration_seconds = int((word_count / 150) * 60)
        
        # Return relative URL
        audio_url = f"/uploads/podcasts/{merchant_id}/{audio_filename}"
        
        return audio_url, duration_seconds
    
    except Exception as e:
        logging.error(f"Error generating audio: {str(e)}")
        raise


def format_transcript(script: str, title: str) -> str:
    """Format script as a readable transcript"""
    
    transcript = f"""# {title}\n\n"""
    
    # Split into paragraphs for readability
    paragraphs = script.split('\n\n')
    for para in paragraphs:
        if para.strip():
            transcript += f"{para.strip()}\n\n"
    
    return transcript.strip()
