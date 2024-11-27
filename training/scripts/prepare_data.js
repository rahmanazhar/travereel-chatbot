import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Create MySQL connection pool
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

async function fetchConversations() {
    try {
        const [rows] = await pool.execute(
            'SELECT user_prompt, ai_response FROM chat_conversations WHERE response_status = "success"'
        );
        return rows;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
}

function transformToTogetherAIFormat(conversations) {
    return conversations.map(conv => ({
        messages: [
            {
                role: "system",
                content: "You are a helpful travel planning assistant that helps users plan their trips by providing detailed itineraries and travel recommendations."
            },
            {
                role: "user",
                content: conv.user_prompt
            },
            {
                role: "assistant",
                content: conv.ai_response
            }
        ]
    }));
}

async function saveToJSONL(data, outputPath) {
    try {
        const jsonlContent = data.map(item => JSON.stringify(item)).join('\n');
        await fs.writeFile(outputPath, jsonlContent);
        console.log(`Data saved successfully to ${outputPath}`);
    } catch (error) {
        console.error('Error saving JSONL file:', error);
        throw error;
    }
}

async function main() {
    try {
        // Create output directory if it doesn't exist
        const outputDir = path.join(process.cwd(), 'training', 'data');
        await fs.mkdir(outputDir, { recursive: true });

        // Fetch and transform data
        console.log('Fetching conversations from database...');
        const conversations = await fetchConversations();
        console.log(`Found ${conversations.length} conversations`);

        const transformedData = transformToTogetherAIFormat(conversations);
        
        // Save to JSONL file
        const outputPath = path.join(outputDir, 'training_data.jsonl');
        await saveToJSONL(transformedData, outputPath);

        console.log('Data preparation completed successfully!');
    } catch (error) {
        console.error('Error in data preparation:', error);
    } finally {
        await pool.end();
    }
}

main();
