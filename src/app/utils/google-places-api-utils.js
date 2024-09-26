import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

export const fetchGoogleHotels = async (destination) => {
  try {
    // Step 1: Find the place ID for the destination
    const placeIdResponse = await axios.get(`${GOOGLE_PLACES_API_BASE_URL}/findplacefromtext/json`, {
      params: {
        input: destination,
        inputtype: 'textquery',
        fields: 'place_id',
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (!placeIdResponse.data.candidates || placeIdResponse.data.candidates.length === 0) {
      throw new Error('Destination not found');
    }

    const placeId = placeIdResponse.data.candidates[0].place_id;

    // Step 2: Search for hotels near the destination
    const hotelsResponse = await axios.get(`${GOOGLE_PLACES_API_BASE_URL}/nearbysearch/json`, {
      params: {
        location: placeId,
        radius: 5000, // 5km radius
        type: 'lodging',
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (!hotelsResponse.data.results) {
      throw new Error('No hotels found');
    }

    // Step 3: Get details for each hotel
    const hotelDetailsPromises = hotelsResponse.data.results.slice(0, 5).map(hotel =>
      axios.get(`${GOOGLE_PLACES_API_BASE_URL}/details/json`, {
        params: {
          place_id: hotel.place_id,
          fields: 'name,rating,formatted_address,price_level,website',
          key: GOOGLE_PLACES_API_KEY
        }
      })
    );

    const hotelDetailsResponses = await Promise.all(hotelDetailsPromises);

    // Step 4: Format the hotel details
    const hotels = hotelDetailsResponses.map(response => {
      const hotel = response.data.result;
      return {
        name: hotel.name,
        address: hotel.formatted_address,
        rating: hotel.rating,
        priceLevel: hotel.price_level,
        website: hotel.website
      };
    });

    return hotels;
  } catch (error) {
    console.error('Error fetching hotels from Google Places API:', error);
    throw error;
  }
};