export async function fetchHotels(city, checkin, checkout, occupancy) {
  // First, we need to get the property IDs for the city
  const regionResponse = await fetch(`/api/expedia?endpoint=regions&city=${encodeURIComponent(city)}`);
  const regionData = await regionResponse.json();

  if (!regionResponse.ok) {
    console.error('Region API Error:', regionData);
    throw new Error(`Failed to fetch region information: ${regionData.error || 'Unknown error'}`);
  }

  console.log('Region Data:', JSON.stringify(regionData, null, 2));

  // Extract property IDs from the correct part of the response
  let propertyIds = [];
  if (regionData.entities && regionData.entities.length > 0) {
    propertyIds = regionData.entities[0].propertyIds || [];
  }

  if (propertyIds.length === 0) {
    console.warn('No properties found for the city:', city);
    return []; // Return an empty array instead of throwing an error
  }

  // Now fetch availability for these properties
  const params = new URLSearchParams({
    endpoint: 'availability',
    property_id: propertyIds.join(','),
    checkin,
    checkout,
    occupancy: occupancy.toString(),
  });

  const availabilityResponse = await fetch(`/api/expedia?${params}`);
  const availabilityData = await availabilityResponse.json();

  if (!availabilityResponse.ok) {
    console.error('Availability API Error:', availabilityData);
    throw new Error(`Failed to fetch hotel availability: ${availabilityData.error || 'Unknown error'}`);
  }

  return availabilityData;
}

export async function generateItinerary(prompt) {
  const response = await fetch('/api/togetherAi', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    throw new Error('Failed to generate itinerary');
  }
  const data = await response.json();
  console.log('TogetherAI Response:', JSON.stringify(data, null, 2));
  
  // Extract the content from the AI response
  const content = data.choices[0]?.message?.content || 'No itinerary generated.';
  
  return { itinerary: content };
}