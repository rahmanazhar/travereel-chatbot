-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS  hiroshiaki_travereel ;
USE  hiroshiaki_travereel ;

-- Table for storing Google Places API hotel results
CREATE TABLE IF NOT EXISTS hotel_searches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    search_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    destination VARCHAR(255) NOT NULL,
    search_radius INT DEFAULT 5000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    search_id BIGINT NOT NULL,
    place_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    rating DECIMAL(2,1),
    price_level TINYINT,
    website TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (search_id) REFERENCES hotel_searches(id),
    INDEX idx_place_id (place_id)
);

-- Table for storing Points of Interest (POI) searches and results
CREATE TABLE IF NOT EXISTS poi_searches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    search_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    destination VARCHAR(255) NOT NULL,
    search_radius INT DEFAULT 5000,
    search_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS points_of_interest (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    search_id BIGINT NOT NULL,
    place_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    type VARCHAR(50) NOT NULL,
    rating DECIMAL(2,1),
    user_ratings_total INT,
    price_level TINYINT,
    website TEXT,
    opening_hours TEXT,
    phone_number VARCHAR(20),
    photos_reference TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (search_id) REFERENCES poi_searches(id),
    INDEX idx_place_id (place_id),
    INDEX idx_type (type)
);

-- Table for storing chat conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_prompt TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    response_status VARCHAR(50) NOT NULL,
    processing_time INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation_timestamp (conversation_timestamp)
);

-- New tables for travel plans and itineraries
CREATE TABLE IF NOT EXISTS travel_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    persons INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_city_country (city, country),
    INDEX idx_dates (start_date, end_date)
);

CREATE TABLE IF NOT EXISTS travel_interests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    travel_plan_id BIGINT NOT NULL,
    interest VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (travel_plan_id) REFERENCES travel_plans(id),
    INDEX idx_interest (interest)
);

CREATE TABLE IF NOT EXISTS travel_places (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    travel_plan_id BIGINT NOT NULL,
    place_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    rating DECIMAL(2,1),
    user_ratings_total INT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (travel_plan_id) REFERENCES travel_plans(id),
    INDEX idx_place_id (place_id)
);

CREATE TABLE IF NOT EXISTS travel_itineraries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    travel_plan_id BIGINT NOT NULL,
    itinerary_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (travel_plan_id) REFERENCES travel_plans(id)
);

-- Add indexes for common queries
CREATE INDEX idx_hotel_searches_destination ON hotel_searches(destination);
CREATE INDEX idx_hotels_rating ON hotels(rating);
CREATE INDEX idx_hotels_price_level ON hotels(price_level);
CREATE INDEX idx_poi_searches_destination ON poi_searches(destination);
CREATE INDEX idx_poi_rating ON points_of_interest(rating);
CREATE INDEX idx_poi_price_level ON points_of_interest(price_level);
