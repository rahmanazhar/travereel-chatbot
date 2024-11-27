# Training Data Preparation for Together AI

This directory contains scripts and utilities for preparing training data for Together AI custom model fine-tuning.

## Directory Structure

```
training/
├── data/               # Directory where prepared training data will be saved
├── scripts/           
│   └── prepare_data.js # Script to prepare training data from database
└── README.md          # This file
```

## Data Preparation

The `prepare_data.js` script:
1. Connects to the MySQL database
2. Fetches successful conversations from the chat_conversations table
3. Transforms the data into Together AI's required format:
   ```json
   {
     "messages": [
       {"role": "system", "content": "System prompt"},
       {"role": "user", "content": "User message"},
       {"role": "assistant", "content": "Assistant response"}
     ]
   }
   ```
4. Saves the transformed data as a JSONL file in the `data` directory

## Usage

1. Ensure your `.env` file contains the necessary MySQL database credentials:
   ```
   MYSQL_HOST=your_host
   MYSQL_USER=your_user
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=your_database
   MYSQL_PORT=your_port
   ```

2. Install dependencies if not already installed:
   ```bash
   npm install mysql2 dotenv
   ```

3. Run the data preparation script:
   ```bash
   node training/scripts/prepare_data.js
   ```

4. The script will create a `training_data.jsonl` file in the `training/data` directory.

## Data Format

The output JSONL file will contain one JSON object per line, with each object following Together AI's required format for conversational fine-tuning. Each conversation includes:

- A system message defining the assistant's role
- The user's prompt from the database
- The assistant's response from the database

This format ensures compatibility with Together AI's fine-tuning requirements while maintaining the context of our travel planning assistant.


## Data Check
From Root Folder

together --api-key=<your-together-ai-api-key> files check training/data/training_data.jsonl 

## Data Upload
From Root Folder

together --api-key=<your-together-ai-api-key> files upload training/data/training_data.jsonl 

together fine-tuning list-events FINETUNE_ID