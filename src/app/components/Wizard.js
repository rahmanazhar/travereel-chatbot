"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchableDropdown from './SearchableDropdown';
import countriesData from '../data/countries.json';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl"
    >
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4">Where do you want to go?</h2>
              <div className="mb-4">
                <label className="block mb-2">Country</label>
                <SearchableDropdown
                  options={countries}
                  placeholder="Select a country"
                  onSelect={(country) => setDestination({ ...destination, country, city: '' })}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">City</label>
                <SearchableDropdown
                  options={cities}
                  placeholder="Select a city"
                  onSelect={(city) => setDestination({ ...destination, city })}
                  disabled={!destination.country}
                />
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
              >
                Next
              </button>
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
            >
              <h2 className="text-2xl font-bold mb-4">When are you planning to travel?</h2>
              <div className="mb-4">
                <label className="block mb-2">Start Date</label>
                <input
                  type="date"
                  value={dates.start}
                  onChange={(e) => setDates({ ...dates, start: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">End Date</label>
                <input
                  type="date"
                  value={dates.end}
                  onChange={(e) => setDates({ ...dates, end: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
                >
                  Next
                </button>
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
            >
              <h2 className="text-2xl font-bold mb-4">What's your budget?</h2>
              <div className="mb-4">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Enter your budget"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
                >
                  Next
                </button>
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
            >
              <h2 className="text-2xl font-bold mb-4">What are your interests?</h2>
              <div className="mb-4">
                <textarea
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Enter your interests (e.g., history, food, nature)"
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-200"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default Wizard;
