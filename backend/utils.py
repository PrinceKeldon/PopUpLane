from typing import List


def assign_badges(merchant_data: dict) -> List[str]:
    """Auto-assign badges based on merchant data"""
    badges = []
    
    # Category-based badges
    category = merchant_data.get('category', '').lower()
    if category in ['tech', 'beauty', 'health']:
        badges.append(category.capitalize())
    
    # Sustainability keywords
    description = merchant_data.get('description', '') or ''
    story = merchant_data.get('story', '') or ''
    combined_text = f"{description.lower()} {story.lower()}"
    
    if any(word in combined_text for word in ['sustainable', 'organic', 'eco', 'ethical', 'green']):
        badges.append('Sustainable')
    
    if any(word in combined_text for word in ['handmade', 'artisan', 'craft', 'handcraft']):
        badges.append('Boutique')
    
    # Default badge for new merchants
    badges.append('Emerging')
    
    # Remove duplicates and limit to 3
    return list(set(badges))[:3]
