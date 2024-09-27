import React, { useState, useEffect } from "react";
import { generateItinerary } from "../utils/api";
import { fetchGoogleHotels } from "../utils/google-places-api-utils";

const ItinerarySuggestion = ({ data, userPreferences }) => {
  const { itinerary } = data;
  const [hotels, setHotels] = useState(data.hotels || []);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [contextualPrompt, setContextualPrompt] = useState("");
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);

  useEffect(() => {
    const prompt = `The user has the following preferences: ${JSON.stringify(
      userPreferences
    )}. 
    Their current itinerary is: ${itinerary}. 
    Please provide answers based on this context.`;
    setContextualPrompt(prompt);

    if (!data.hotels || data.hotels.length === 0) {
      fetchHotelSuggestions();
    }
  }, [userPreferences, itinerary, data.hotels]);

  const fetchHotelSuggestions = async () => {
    setIsLoadingHotels(true);
    try {
      // Extract the destination from the itinerary or user preferences
      const destination = extractDestination(itinerary, userPreferences);
      const googleHotels = await fetchGoogleHotels(destination);
      setHotels(parseGoogleHotels(googleHotels));
    } catch (error) {
      console.error("Error fetching hotel suggestions:", error);
    } finally {
      setIsLoadingHotels(false);
    }
  };

  const extractDestination = (itinerary, preferences) => {
    // This function should extract the main destination from the itinerary or preferences
    // For simplicity, let's assume it's mentioned in the first day of the itinerary
    const firstDay = itinerary.split("**Day 1:")[1]?.split("\n")[0];
    return firstDay ? firstDay.trim() : preferences.destination || "Paris"; // Default to Paris if no destination found
  };

  const parseGoogleHotels = (googleHotels) => {
    return googleHotels.map((hotel) => ({
      name: hotel.name,
      lowestRate: hotel.priceLevel ? `${"$".repeat(hotel.priceLevel)}` : "N/A",
      address: { cityName: hotel.address },
      rating: hotel.rating,
      website: hotel.website,
    }));
  };

  const parseBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const formatItinerary = (itineraryText) => {
    const days = itineraryText
      .split(/\*\*Day \d+:/g)
      .filter((day) => day.trim() !== "");
    return days.map((day, index) => {
      const [date, ...activities] = day
        .split("\n")
        .filter((line) => line.trim() !== "");
      return (
        <div key={index} className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h4 className="text-2xl font-bold mb-4 text-indigo-600">
            Day {index + 1}
            {date && `: ${parseBoldText(date.trim())}`}
          </h4>
          <ul className="space-y-3">
            {activities.map((activity, actIndex) => (
              <li key={actIndex} className="flex items-start">
                <span className="mr-2 mt-1 text-indigo-500">•</span>
                <span>{parseBoldText(activity.trim())}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    });
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = { role: "user", content: chatMessage };
    setChatHistory((prev) => [...prev, userMessage]);
    setChatMessage("");

    try {
      const response = await generateItinerary(
        `${contextualPrompt}\n\nUser question: ${chatMessage}`
      );
      const aiMessage = { role: "assistant", content: response.itinerary };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="w-[100%] mx-auto p-6 bg-gray-100">
      <h2 className="text-4xl font-bold mb-8 text-center text-indigo-800">
        Your Personalized Itinerary
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700">
              Your Itinerary
            </h3>
            <div className="prose max-w-none">
              {itinerary ? (
                typeof itinerary === "string" ? (
                  formatItinerary(itinerary)
                ) : (
                  <p className="text-red-500">
                    Itinerary format is not as expected. Please try again.
                  </p>
                )
              ) : (
                <p className="text-red-500">
                  No itinerary generated. Please try again.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700">
              Recommended Hotels
            </h3>
            {isLoadingHotels ? (
              <p className="text-gray-600">Loading hotel suggestions...</p>
            ) : hotels && hotels.length > 0 ? (
              <div className="space-y-4">
                {hotels.map((hotel, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h4 className="text-xl font-medium text-indigo-600">
                      {hotel.name}
                    </h4>
                    {hotel.lowestRate && (
                      <p className="text-gray-600">
                        Price: ${hotel.lowestRate} per night
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {hotel.address?.cityName}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No hotel suggestions available.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700">
              Chat with Vicky
            </h3>
            <div className="h-64 overflow-y-auto mb-4 bg-gray-100 p-4 rounded">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <span
                    className={`inline-block p-2 rounded-lg ${
                      message.role === "user" ? "bg-indigo-100" : "bg-green-100"
                    }`}
                  >
                    {parseBoldText(message.content)}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="flex">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about your itinerary..."
                className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItinerarySuggestion;
