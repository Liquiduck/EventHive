import requests
import os
from datetime import datetime

def fetch_ticketmaster_events(city="New York"):
    """
    Fetches UPCOMING events from Ticketmaster API based on a city.
    """
    API_KEY = os.getenv('TICKETMASTER_API_KEY')
    URL = "https://app.ticketmaster.com/discovery/v2/events.json"
    
    current_time = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    
    params = {
        "apikey": API_KEY,
        "city": city,
        "size": 20,
        "sort": "date,asc",
        "startDateTime": current_time 
    }

    try:
        response = requests.get(URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        events = data.get('_embedded', {}).get('events', [])
        
        cleaned_events = []
        for event in events:
            event_data = {
                "id": event.get('id'),
                "name": event.get('name'),
                "date": event.get('dates', {}).get('start', {}).get('localDate'),
                "time": event.get('dates', {}).get('start', {}).get('localTime'),
                "venue": event.get('_embedded', {}).get('venues', [{}])[0].get('name', "Unknown Venue"),
                "image": event.get('images', [{}])[0].get('url'),
                "url": event.get('url')
            }
            cleaned_events.append(event_data)
            
        return cleaned_events

    except requests.exceptions.RequestException as e:
        print(f"Error fetching events: {e}")
        return []