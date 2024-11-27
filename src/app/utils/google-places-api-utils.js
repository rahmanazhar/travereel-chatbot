import axios from 'axios';
import { storeHotelSearch, storePOISearch } from './database';

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
        place_id: hotel.place_id,
        name: hotel.name,
        address: hotel.formatted_address,
        rating: hotel.rating,
        price_level: hotel.price_level,
        website: hotel.website
      };
    });

    // Step 5: Store hotels in database
    await storeHotelSearch(destination, 5000, hotels);

    return hotels;
  } catch (error) {
    console.error('Error fetching hotels from Google Places API:', error);
    throw error;
  }
};

export const fetchPointsOfInterest = async (destination, type = 'tourist_attraction') => {
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

    // Step 2: Search for POIs near the destination
    const poisResponse = await axios.get(`${GOOGLE_PLACES_API_BASE_URL}/nearbysearch/json`, {
      params: {
        location: placeId,
        radius: 5000,
        type: type,
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (!poisResponse.data.results) {
      throw new Error('No points of interest found');
    }

    // Step 3: Get details for each POI
    const poiDetailsPromises = poisResponse.data.results.slice(0, 10).map(poi =>
      axios.get(`${GOOGLE_PLACES_API_BASE_URL}/details/json`, {
        params: {
          place_id: poi.place_id,
          fields: 'name,rating,formatted_address,price_level,website,opening_hours,formatted_phone_number,photos,user_ratings_total',
          key: GOOGLE_PLACES_API_KEY
        }
      })
    );

    const poiDetailsResponses = await Promise.all(poiDetailsPromises);

    // Step 4: Format the POI details
    const pois = poiDetailsResponses.map(response => {
      const poi = response.data.result;
      return {
        place_id: poi.place_id,
        name: poi.name,
        address: poi.formatted_address,
        type: type,
        rating: poi.rating,
        user_ratings_total: poi.user_ratings_total,
        price_level: poi.price_level,
        website: poi.website,
        opening_hours: poi.opening_hours?.weekday_text,
        phone_number: poi.formatted_phone_number,
        photos_reference: poi.photos?.map(photo => photo.photo_reference)
      };
    });

    // Step 5: Store POIs in database
    await storePOISearch(destination, 5000, type, pois);

    return pois;
  } catch (error) {
    console.error('Error fetching points of interest from Google Places API:', error);
    throw error;
  }
};
