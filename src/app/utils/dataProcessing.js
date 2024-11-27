import { generateItinerary } from './api';

async function storePOIData(destination, searchType, pois) {
  try {
    const response = await fetch('/api/poi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination,
        searchRadius: 5000,
        searchType,
        pois
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to store POI data');
    }
    console.log('Successfully stored POI data:', data);
    return data.searchId;
  } catch (error) {
    console.error('Error storing POI data:', error);
    // Don't throw the error, just log it and continue
  }
}

async function searchPlacesByInterest(city, country, interest) {
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    console.error('Google Maps API is not loaded');
    return [];
  }

  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      query: `tourist attractions ${interest} in ${city}, ${country}`,
      fields: [
        'name', 
        'formatted_address', 
        'place_id', 
        'geometry', 
        'rating', 
        'user_ratings_total', 
        'types',
        'opening_hours',
        'price_level',
        'business_status'
      ],
      type: ['tourist_attraction', 'point_of_interest']
    };

    service.textSearch(request, async (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        // Filter results to only include tourist attractions
        const filteredResults = results.filter(place => 
          place.types && (
            place.types.includes('tourist_attraction') || 
            place.types.includes('point_of_interest')
          )
        );

        const places = filteredResults.slice(0, 5).map(place => ({
          name: place.name,
          address: place.formatted_address,
          placeId: place.place_id,
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          types: place.types,
          openingHours: place.opening_hours?.weekday_text || null,
          priceLevel: place.price_level,
          priceRange: place.price_range,
          businessStatus: place.business_status
        }));

        // Get detailed place information for each place
        const detailedPlaces = await Promise.all(
          places.map(place => 
            new Promise((resolve) => {
              service.getDetails(
                {
                  placeId: place.placeId,
                  fields: ['opening_hours', 'price_level']
                },
                (result, detailStatus) => {
                  if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve({
                      ...place,
                      openingHours: result.opening_hours?.weekday_text || null,
                      priceLevel: result.price_level
                    });
                  } else {
                    resolve(place);
                  }
                }
              );
            })
          )
        );

        try {
          // Format POIs for database storage
          const poisForDb = detailedPlaces.map(place => ({
            place_id: place.placeId,
            name: place.name,
            address: place.address,
            type: interest,
            rating: place.rating || null,
            user_ratings_total: place.userRatingsTotal || null,
            price_level: place.price_range?.start_price || null,
            website: null,
            opening_hours: place.openingHours ? JSON.stringify(place.openingHours) : null,
            phone_number: null,
            photos_reference: null
          }));

          // Store POIs using the API route
          await storePOIData(`${city}, ${country}`, interest, poisForDb);
        } catch (error) {
          console.error('Error preparing POI data:', {
            error: error.message,
            stack: error.stack,
            city,
            country,
            interest
          });
        }

        resolve(detailedPlaces);
      } else {
        console.error(`Error searching for ${interest} in ${city}, ${country}:`, status);
        resolve([]);
      }
    });
  });
}

async function searchHotels(city, country) {
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    console.error('Google Maps API is not loaded');
    return [];
  }

  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      query: `hotels in ${city}, ${country}`,
      fields: [
        'name', 
        'formatted_address', 
        'place_id', 
        'geometry', 
        'rating', 
        'user_ratings_total', 
        'price_level', 
        'website', 
        'types',
        'opening_hours',
        'business_status'
      ],
      type: ['lodging', 'hotel']
    };

    service.textSearch(request, async (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        // Filter results to only include hotels
        const filteredResults = results.filter(place => 
          place.types && (
            place.types.includes('lodging') || 
            place.types.includes('hotel')
          )
        );

        const hotels = filteredResults.slice(0, 5).map(hotel => ({
          name: hotel.name,
          address: { cityName: hotel.formatted_address },
          placeId: hotel.place_id,
          location: {
            lat: hotel.geometry.location.lat(),
            lng: hotel.geometry.location.lng()
          },
          rating: hotel.rating,
          userRatingsTotal: hotel.user_ratings_total,
          priceLevel: hotel.price_level,
          website: hotel.website,
          lowestRate: hotel.price_range?.start_price ? `${"$".repeat(hotel.price_range?.start_price)}` : "N/A",
          types: hotel.types,
          openingHours: hotel.opening_hours?.weekday_text || null,
          businessStatus: hotel.business_status
        }));

        // Get detailed hotel information
        const detailedHotels = await Promise.all(
          hotels.map(hotel => 
            new Promise((resolve) => {
              service.getDetails(
                {
                  placeId: hotel.placeId,
                  fields: ['opening_hours', 'price_level', 'website']
                },
                (result, detailStatus) => {
                  if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve({
                      ...hotel,
                      openingHours: result.opening_hours?.weekday_text || null,
                      priceLevel: result.price_level,
                      website: result.website || hotel.website
                    });
                  } else {
                    resolve(hotel);
                  }
                }
              );
            })
          )
        );

        try {
          // Format hotels for database storage
          const hotelsForDb = detailedHotels.map(hotel => ({
            place_id: hotel.placeId,
            name: hotel.name,
            address: hotel.address.cityName,
            type: 'hotel',
            rating: hotel.rating || null,
            user_ratings_total: hotel.userRatingsTotal || null,
            price_level: hotel.priceLevel || null,
            website: hotel.website || null,
            opening_hours: hotel.openingHours ? JSON.stringify(hotel.openingHours) : null,
            phone_number: null,
            photos_reference: null
          }));

          // Store hotels using the API route
          await storePOIData(`${city}, ${country}`, 'hotel', hotelsForDb);
        } catch (error) {
          console.error('Error preparing hotel data:', {
            error: error.message,
            stack: error.stack,
            city,
            country
          });
        }

        resolve(detailedHotels);
      } else {
        console.error(`Error searching for hotels in ${city}, ${country}:`, status);
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

  // Fetch hotel data
  const hotelsData = await searchHotels(city, country);

  // Flatten the array of places and remove duplicates
  const uniquePlaces = Array.from(new Set(placesData.flat().map(place => place.placeId)))
    .map(id => placesData.flat().find(place => place.placeId === id));

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const startDay = new Date(startDate).getDay();
  
  // Generate AI itinerary using only provided information
  const prompt = `Create a ${tripDays}-day itinerary for ${persons} person(s) visiting ${city}, ${country} with a budget of $${budget}. 
  Trip dates: ${startDate} to ${endDate}

  Available tourist attractions (use only these places, do not make up additional places):
  ${uniquePlaces.map(place => {
    const dayHours = place.openingHours ? 
      place.openingHours[startDay] || 'Hours not available' :
      'Hours not available';
    return `- ${place.name}
    Rating: ${place.rating}/5 from ${place.userRatingsTotal} reviews
    Opening Hours: ${dayHours}
    Price Level: ${place.priceLevel ? '$'.repeat(place.priceLevel) : 'Not available'}`
  }).join('\n\n')}

  Available hotels (use only these for accommodation recommendations):
  ${hotelsData.map(hotel => `- ${hotel.name}
    Rating: ${hotel.rating}/5
    Price Level: ${hotel.lowestRate}
    ${hotel.openingHours ? `Check-in hours: ${hotel.openingHours[startDay] || 'Not specified'}` : ''}`
  ).join('\n\n')}

  For each day:
  1. List activities with specific times
  2. Only include places from the provided tourist attractions
  3. Include actual ratings, reviews, and opening hours when mentioning places
  4. Suggest one of the provided hotels for accommodation
  5. Consider the budget and opening hours when suggesting activities
  6. Ensure suggested times align with the places' opening hours

  Format each day as:
  Day X:
  - Time: 
    Activity
    Place (include actual rating, reviews, and opening hours)
  - Time: 
    Activity
    Place (include actual rating, reviews, and opening hours)
  etc.`;

  const itineraryData = await generateItinerary(prompt);

  return {
    places: uniquePlaces,
    hotels: hotelsData,
    itinerary: itineraryData.itinerary || 'No itinerary generated.'
  };
}
