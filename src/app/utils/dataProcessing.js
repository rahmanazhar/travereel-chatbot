import { generateItinerary } from './api';

async function searchPlacesByInterest(city, country, interest) {
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    console.error('Google Maps API is not loaded');
    return [];
  }

  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      query: `${interest} in ${city}, ${country}`,
      fields: ['name', 'formatted_address', 'place_id', 'geometry', 'rating', 'user_ratings_total'],
    };

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const places = results.slice(0, 5).map(place => ({
          name: place.name,
          address: place.formatted_address,
          placeId: place.place_id,
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total
        }));
        resolve(places);
      } else {
        console.error(`Error searching for ${interest} in ${city}, ${country}:`, status);
        resolve([]);
      }
    });
  });
}

export async function processTraveData(formData, isLoaded) {
  const { city, country, startDate, endDate, budget, persons, interests } = formData;

  if (!isLoaded) {
    console.error('Google Maps API is not loaded');
    return { error: 'Google Maps API is not loaded. Please try again later.' };
  }

  // Calculate the number of days for the trip
  const tripDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

  // Fetch places data based on interests
  const placesData = await Promise.all(
    interests.map(interest => searchPlacesByInterest(city, country, interest))
  );

  // Flatten the array of places and remove duplicates
  const uniquePlaces = Array.from(new Set(placesData.flat().map(place => place.placeId)))
    .map(id => placesData.flat().find(place => place.placeId === id));

  // Generate AI itinerary
  const prompt = `Create a detailed ${tripDays}-day itinerary for ${persons} person(s) visiting ${city}, ${country} with a total budget of $${budget}. 
  For each day, provide a schedule with suggested hours for activities, places to visit, and things to do. 
  Include local attractions, museums, parks, restaurants, and any must-see spots in ${city}. 
  Consider the season and typical weather for the trip dates: ${startDate} to ${endDate}.
  If possible, suggest free or low-cost activities to help stay within the budget.
  The following places of interest were found and should be included in the itinerary if relevant:
  ${uniquePlaces.map(place => `- ${place.name} (Rating: ${place.rating})`).join('\n')}
  Format the itinerary day by day, with times and brief descriptions for each activity.`;

  const itineraryData = await generateItinerary(prompt);

  return {
    places: uniquePlaces,
    itinerary: itineraryData.itinerary || 'No itinerary generated.'
  };
}
