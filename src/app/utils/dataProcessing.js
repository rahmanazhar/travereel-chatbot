import { fetchHotels, generateItinerary } from './api';

export async function processTraveData(formData) {
  const { city, country, startDate, endDate, budget, persons } = formData;

  // Calculate the number of days for the trip
  const tripDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

  // Fetch hotel data
  let hotelData;
  try {
    hotelData = await fetchHotels(city, startDate, endDate, persons);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    hotelData = [];
  }

  // Filter hotels based on budget, if any hotels were found
  const budgetPerNight = budget / tripDays;
  const suitableHotels = Array.isArray(hotelData) ? hotelData.filter(hotel => hotel.lowestRate <= budgetPerNight) : [];

  // Generate AI itinerary
  const prompt = `Create a detailed ${tripDays}-day itinerary for ${persons} person(s) visiting ${city}, ${country} with a total budget of $${budget}. 
  For each day, provide a schedule with suggested hours for activities, places to visit, and things to do. 
  Include local attractions, museums, parks, restaurants, and any must-see spots in ${city}. 
  Consider the season and typical weather for the trip dates: ${startDate} to ${endDate}.
  If possible, suggest free or low-cost activities to help stay within the budget.
  ${suitableHotels.length > 0 ? `Some hotel options include: ${suitableHotels.map(h => h.name).join(', ')}.` : 'No specific hotels were found within the budget, so focus on the itinerary and activities.'}
  Format the itinerary day by day, with times and brief descriptions for each activity.`;

  const itineraryData = await generateItinerary(prompt);

  return {
    hotels: suitableHotels,
    itinerary: itineraryData.itinerary || 'No itinerary generated.'
  };
}