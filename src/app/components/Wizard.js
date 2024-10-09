"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchableDropdown from './SearchableDropdown';
import countriesData from '../data/countries.json';
import Image from 'next/image';
import { processTraveData } from '../utils/dataProcessing';
import ItinerarySuggestion from './ItinerarySuggestion';

const Wizard = () => {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState({ country: '', city: '' });
  const [dates, setDates] = useState({ start: '', end: '' });
  const [budget, setBudget] = useState('');
  const [numPersons, setNumPersons] = useState(1);
  const [interests, setInterests] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [travelData, setTravelData] = useState(null);

  useEffect(() => {
    setCountries(Object.keys(countriesData));
  }, []);

  useEffect(() => {
    if (destination.country) {
      setCities(countriesData[destination.country] || []);
      setDestination(prev => ({ ...prev, city: '' }));
    } else {
      setCities([]);
    }
  }, [destination.country]);

  const validateStep = () => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!destination.country) newErrors.country = "Please select a country";
        if (!destination.city) newErrors.city = "Please select a city";
        break;
      case 2:
        if (!dates.start) newErrors.startDate = "Please select a start date";
        if (!dates.end) newErrors.endDate = "Please select an end date";
        if (dates.start && dates.end && new Date(dates.start) > new Date(dates.end)) {
          newErrors.dateRange = "End date must be after start date";
        }
        break;
      case 3:
        if (!budget || budget <= 0) newErrors.budget = "Please enter a valid budget";
        if (!numPersons || numPersons < 1) newErrors.numPersons = "Please enter a valid number of travelers";
        break;
      case 4:
        if (interests.length === 0) newErrors.interests = "Please enter at least one interest";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      setIsLoading(true);
      const formData = {
        city: destination.city,
        country: destination.country,
        startDate: dates.start,
        endDate: dates.end,
        budget: parseFloat(budget),
        persons: numPersons,
        interests: interests
      };
      try {
        const result = await processTraveData(formData);
        setTravelData(result);
      } catch (error) {
        console.error('Error processing travel data:', error);
        setErrors({ submission: 'An error occurred while processing your request. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInterestsChange = (e) => {
    const interestsArray = e.target.value.split(',').map(interest => interest.trim()).filter(interest => interest !== '');
    setInterests(interestsArray);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const ProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
        style={{ width: `${(step / 4) * 100}%` }}
      ></div>
    </div>
  );

  if (travelData) {
    return <ItinerarySuggestion data={travelData} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto mt-10 p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl"
    >
      <ProgressBar />
      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-8"
            >
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6 text-blue-800">Where do you want to go?</h2>
                <p className="text-gray-600 mb-4">Choose your dream destination for this adventure.</p>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">Country</label>
                  <SearchableDropdown
                    options={countries}
                    placeholder="Select a country"
                    onSelect={(country) => setDestination({ country, city: '' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.country && <p className="text-red-500 mt-1">{errors.country}</p>}
                </div>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">City</label>
                  <SearchableDropdown
                    options={cities}
                    placeholder="Select a city"
                    onSelect={(city) => setDestination(prev => ({ ...prev, city }))}
                    disabled={!destination.country}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.city && <p className="text-red-500 mt-1">{errors.city}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition duration-300 text-lg font-semibold"
                >
                  Next
                </button>
              </div>
              <div className="w-1/3">
                <Image src="/images/traveling-63.png" alt="Destination" width={300} height={300} className="" />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-8"
            >
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6 text-blue-800">When are you planning to travel?</h2>
                <p className="text-gray-600 mb-4">Select the dates for your exciting journey.</p>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={dates.start}
                    onChange={(e) => setDates({ ...dates, start: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors.startDate && <p className="text-red-500 mt-1">{errors.startDate}</p>}
                </div>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">End Date</label>
                  <input
                    type="date"
                    value={dates.end}
                    onChange={(e) => setDates({ ...dates, end: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors.endDate && <p className="text-red-500 mt-1">{errors.endDate}</p>}
                </div>
                {errors.dateRange && <p className="text-red-500 mb-4">{errors.dateRange}</p>}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition duration-300 text-lg font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition duration-300 text-lg font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="w-1/3">
                <Image src="/images/calendar-55.png" alt="Calendar" width={300} height={300}/>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-8"
            >
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6 text-blue-800">What's your budget?</h2>
                <p className="text-gray-600 mb-4">Enter your travel budget and number of travelers to help us plan accordingly.</p>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">Budget (in USD)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Enter your budget"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                  {errors.budget && <p className="text-red-500 mt-1">{errors.budget}</p>}
                </div>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">Number of Travelers</label>
                  <input
                    type="number"
                    value={numPersons}
                    onChange={(e) => setNumPersons(parseInt(e.target.value))}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors.numPersons && <p className="text-red-500 mt-1">{errors.numPersons}</p>}
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition duration-300 text-lg font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition duration-300 text-lg font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="w-1/3">
                <Image src="/images/calculator-43.png" alt="Budget" width={300} height={300} />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-8"
            >
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6 text-blue-800">What are your interests?</h2>
                <p className="text-gray-600 mb-4">Tell us about your interests to personalize your travel experience. Separate each interest with a comma.</p>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">Interests</label>
                  <textarea
                    value={interests.join(', ')}
                    onChange={handleInterestsChange}
                    placeholder="Enter your interests (e.g., history, food, nature)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  ></textarea>
                  {errors.interests && <p className="text-red-500 mt-1">{errors.interests}</p>}
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition duration-300 text-lg font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition duration-300 text-lg font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Submit'}
                  </button>
                </div>
              </div>
              <div className="w-1/3">
                <Image src="/images/traveling-3.png" alt="Interests" width={300} height={300}/>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      {errors.submission && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {errors.submission}
        </div>
      )}
    </motion.div>
  );
};

export default Wizard;
