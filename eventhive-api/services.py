import requests
import os

def fetch_ticketmaster_events(city="New York"):
    """
    Fetches events from Ticketmaster API based on a city.
    """
    API_KEY = os.getenv('TICKETMASTER_API_KEY')
    URL = "https://app.ticketmaster.com/discovery/v2/events.json"
    
    params = {
        "apikey": API_KEY,
        "city": city,
        "size": 20,  # Get 20 events
        "sort": "date,asc"
    }

    try:
        response = requests.get(URL, params=params)
        response.raise_for_status() # Raises an error for bad responses (4xx, 5xx)
        data = response.json()
        
        # Ticketmaster nesting is deep: _embedded -> events
        events = data.get('_embedded', {}).get('events', [])
        
        # Let's clean up the data so our frontend handles it easily
        cleaned_events = []
        for event in events:
            event_data = {
                "id": event.get('id'),
                "name": event.get('name'),
                "date": event.get('dates', {}).get('start', {}).get('localDate'),
                "time": event.get('dates', {}).get('start', {}).get('localTime'),
                "venue": event.get('_embedded', {}).get('venues', [{}])[0].get('name', "Unknown Venue"),
                "image": event.get('images', [{}])[0].get('url'), # Get the first image
                "url": event.get('url')
            }
            cleaned_events.append(event_data)
            
        return cleaned_events

    except requests.exceptions.RequestException as e:
        print(f"Error fetching events: {e}")
        return []