import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Store travel plan and related data
export async function storeTravelPlan(formData, places, itinerary) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert travel plan
        const [planResult] = await connection.execute(
            `INSERT INTO travel_plans 
            (city, country, start_date, end_date, budget, persons) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [formData.city, formData.country, formData.startDate, 
             formData.endDate, formData.budget, formData.persons]
        );
        const planId = planResult.insertId;

        // Insert interests
        for (const interest of formData.interests) {
            await connection.execute(
                'INSERT INTO travel_interests (travel_plan_id, interest) VALUES (?, ?)',
                [planId, interest]
            );
        }

        // Insert places
        for (const place of places) {
            await connection.execute(
                `INSERT INTO travel_places 
                (travel_plan_id, place_id, name, address, rating, 
                user_ratings_total, latitude, longitude) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [planId, place.placeId, place.name, place.address, 
                 place.rating, place.userRatingsTotal, 
                 place.location.lat, place.location.lng]
            );
        }

        // Insert itinerary
        await connection.execute(
            'INSERT INTO travel_itineraries (travel_plan_id, itinerary_text) VALUES (?, ?)',
            [planId, itinerary]
        );

        await connection.commit();
        return planId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Store hotel search results
export async function storeHotelSearch(destination, searchRadius, hotels) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert hotel search
        const [searchResult] = await connection.execute(
            'INSERT INTO hotel_searches (destination, search_radius) VALUES (?, ?)',
            [destination, searchRadius]
        );
        const searchId = searchResult.insertId;

        // Insert hotels
        for (const hotel of hotels) {
            await connection.execute(
                `INSERT INTO hotels (search_id, place_id, name, address, rating, 
                price_level, website) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [searchId, hotel.place_id, hotel.name, hotel.address, 
                 hotel.rating, hotel.price_level, hotel.website]
            );
        }

        await connection.commit();
        return searchId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Store POI search results
export async function storePOISearch(destination, searchRadius, searchType, pois) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert POI search
        const [searchResult] = await connection.execute(
            'INSERT INTO poi_searches (destination, search_radius, search_type) VALUES (?, ?, ?)',
            [destination, searchRadius, searchType]
        );
        const searchId = searchResult.insertId;

        // Insert POIs
        for (const poi of pois) {
            await connection.execute(
                `INSERT INTO points_of_interest 
                (search_id, place_id, name, address, type, rating, user_ratings_total, 
                price_level, website, opening_hours, phone_number, photos_reference) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [searchId, poi.place_id, poi.name, poi.address, poi.type, poi.rating,
                poi.user_ratings_total, poi.price_level, poi.website, 
                JSON.stringify(poi.opening_hours), poi.phone_number, 
                JSON.stringify(poi.photos_reference)]
            );
        }

        await connection.commit();
        return searchId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Store chat conversation
export async function storeChatConversation(userPrompt, aiResponse, modelName, status, processingTime) {
    try {
        const [result] = await pool.execute(
            `INSERT INTO chat_conversations 
            (user_prompt, ai_response, model_name, response_status, processing_time) 
            VALUES (?, ?, ?, ?, ?)`,
            [userPrompt, aiResponse, modelName, status, processingTime]
        );
        return result.insertId;
    } catch (error) {
        throw error;
    }
}

// Test database connection
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to MySQL database');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error connecting to MySQL database:', error);
        return false;
    }
}

// Initialize database connection
export async function initDatabase() {
    try {
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Failed to connect to database');
        }
        console.log('Database connection pool initialized');
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}
