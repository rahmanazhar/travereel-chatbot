import React, { useState, useEffect } from "react";
import { generateItinerary } from "../utils/api";
import { fetchGoogleHotels } from "../utils/google-places-api-utils";

const colors = {
  primary: '#F6C90E',
  secondary: '#131313',
  tertiary: '#F8FAFB',
  quarternary: '#C54AE2',
  success: '#17BF97',
  error: '#E0475F',
  textOnColored: '#443600',
};

const ItinerarySuggestion = ({ data }) => {
  const { itinerary, hotels } = data;
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [contextualPrompt, setContextualPrompt] = useState("");
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);

  useEffect(() => {
    const prompt = `The user's current itinerary is: ${itinerary}. 
    Please provide answers based on this context.`;
    setContextualPrompt(prompt);

    if (!hotels || hotels.length === 0) {
      fetchHotelSuggestions();
    }
  }, [itinerary, hotels]);

  const fetchHotelSuggestions = async () => {
    setIsLoadingHotels(true);
    try {
      const destination = extractDestination(itinerary);
      const googleHotels = await fetchGoogleHotels(destination);
      data.hotels = parseGoogleHotels(googleHotels);
    } catch (error) {
      console.error("Error fetching hotel suggestions:", error);
    } finally {
      setIsLoadingHotels(false);
    }
  };

  const extractDestination = (itinerary) => {
    const firstDay = itinerary.split("Day 1:")[1]?.split("\n")[0];
    return firstDay ? firstDay.trim() : "Paris";
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
    text = text.replace(/\*/g, '');
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  const formatItinerary = (itineraryText) => {
    const days = itineraryText
      .split(/Day \d+:/g)
      .filter((day) => day.trim() !== "");
    return days.map((day, index) => {
      const [date, ...activities] = day
        .split("\n")
        .filter((line) => line.trim() !== "");
      return (
        <div key={index} className="mb-8 bg-tertiary rounded-xl shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-xl">
          <h4 className="text-2xl font-bold mb-4 text-secondary">
            Day {index + 1}
            {date && `: ${parseBoldText(date.trim())}`}
          </h4>
          <ul className="space-y-3">
            {activities.map((activity, actIndex) => (
              <li key={actIndex} className="flex items-start">
                <span className="mr-2 mt-1 text-primary">•</span>
                <span className="text-secondary">{parseBoldText(activity.trim())}</span>
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
    <div className="w-full mx-auto p-6 bg-tertiary">
      <h2 className="text-4xl font-bold mb-8 text-center text-secondary">
        Your Personalized Itinerary
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 ease-in-out hover:shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-secondary">
              Your Itinerary
            </h3>
            <div className="prose max-w-none">
              {itinerary ? (
                typeof itinerary === "string" ? (
                  formatItinerary(itinerary)
                ) : (
                  <p className="text-error">
                    Itinerary format is not as expected. Please try again.
                  </p>
                )
              ) : (
                <p className="text-error">
                  No itinerary generated. Please try again.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 ease-in-out hover:shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-secondary">
              Recommended Hotels
            </h3>
            {isLoadingHotels ? (
              <p className="text-secondary">Loading hotel suggestions...</p>
            ) : hotels && hotels.length > 0 ? (
              <div className="space-y-4">
                {hotels.map((hotel, index) => (
                  <div key={index} className="border-b border-primary pb-4 last:border-b-0">
                    <h4 className="text-xl font-medium text-secondary">
                      {hotel.name}
                    </h4>
                    {hotel.lowestRate && (
                      <p className="text-secondary">
                        Price: {hotel.lowestRate} per night
                      </p>
                    )}
                    <p className="text-sm text-secondary opacity-75">
                      {hotel.address?.cityName}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary">No hotel suggestions available.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-secondary">
              Chat with Vicky
            </h3>
            <div className="h-64 overflow-y-auto mb-4 bg-tertiary p-4 rounded-lg">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <span
                    className={`inline-block p-2 rounded-lg ${
                      message.role === "user" ? "bg-primary text-textOnColored" : "bg-success text-tertiary"
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
                className="flex-grow border-2 border-primary rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-quarternary transition-all duration-300 ease-in-out"
              />
              <button
                type="submit"
                className="bg-primary text-textOnColored px-4 py-2 rounded-r-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-quarternary transition-all duration-300 ease-in-out"
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
