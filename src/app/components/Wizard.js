"use client";
import React, { useState } from "react";
import {
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { processTraveData } from '../utils/dataProcessing';
import ItinerarySuggestion from "./ItinerarySuggestion";

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    country: "",
    city: "",
    startDate: "",
    endDate: "",
    budget: "",
    persons: "",
  });

  const [itineraryData, setItineraryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await processTraveData(formData);
      setItineraryData(data);
      setStep(4); 
    } catch (error) {
      console.error("Error processing travel data:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold mb-6">
              Where do you want to go?
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="country"
                >
                  Country
                </label>
                <div className="relative">
                  <MapPinIcon className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                  <input
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    id="country"
                    type="text"
                    placeholder="Enter country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="city"
                >
                  City
                </label>
                <div className="relative">
                  <MapPinIcon className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                  <input
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    id="city"
                    type="text"
                    placeholder="Enter city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold mb-6">When are you traveling?</h2>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="startDate"
                >
                  Start Date
                </label>
                <div className="relative">
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                  <input
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="endDate"
                >
                  End Date
                </label>
                <div className="relative">
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                  <input
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold mb-6">
              Tell us more about your trip
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="budget"
                >
                  Budget (USD)
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                  <input
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    id="budget"
                    type="number"
                    placeholder="Enter your budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="persons"
                >
                  Number of Travelers
                </label>
                <div className="relative">
                  <UsersIcon className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                  <input
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    id="persons"
                    type="number"
                    placeholder="Enter number of travelers"
                    name="persons"
                    value={formData.persons}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-[100%] mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {step < 4 ? (
        <form onSubmit={handleSubmit}>
          {renderStep()}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                type="button"
                onClick={handlePrev}
              >
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="button"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                type="submit"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      ) : (
        <ItinerarySuggestion data={itineraryData} />
      )}
      {isLoading && <p>Loading your personalized itinerary...</p>}
    </div>
  );
}
