"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchableDropdown from './SearchableDropdown';
import countriesData from '../data/countries.json';
import Image from 'next/image';

const Wizard = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState({ country: '', city: '' });
  const [dates, setDates] = useState({ start: '', end: '' });
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    setCountries(Object.keys(countriesData));
  }, []);

  useEffect(() => {
    if (destination.country) {
      setCities(countriesData[destination.country] || []);
    } else {
      setCities([]);
    }
  }, [destination.country]);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ destination, dates, budget, interests });
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
                    onSelect={(country) => setDestination({ ...destination, country, city: '' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">City</label>
                  <SearchableDropdown
                    options={cities}
                    placeholder="Select a city"
                    onSelect={(city) => setDestination({ ...destination, city })}
                    disabled={!destination.country}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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
                <p className="text-gray-600 mb-4">Enter your travel budget to help us plan accordingly.</p>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">Budget (in USD)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Enter your budget"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                <p className="text-gray-600 mb-4">Tell us about your interests to personalize your travel experience.</p>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">Interests</label>
                  <textarea
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="Enter your interests (e.g., history, food, nature)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  ></textarea>
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
                  >
                    Submit
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
    </motion.div>
  );
};

export default Wizard;
