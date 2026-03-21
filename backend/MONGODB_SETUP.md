# MongoDB Setup for VeritAI

## Option A — MongoDB Atlas (Cloud, Recommended for production)

1. Go to cloud.mongodb.com → Sign up free
2. Create a new project → "VeritAI"
3. Build a cluster → choose "M0 Free Tier" → select region
   closest to you (Mumbai / Singapore for India)
4. Under "Security" → "Database Access" → Add a user:
   - Username: veritai
   - Password: generate a secure password
   - Role: readWriteAnyDatabase
5. Under "Network Access" → Add IP Address → "Allow Access from Anywhere"
   (0.0.0.0/0) for development
6. Go to your cluster → "Connect" → "Drivers" →
   copy the connection string. It looks like:
   mongodb+srv://veritai:<password>@cluster0.xxxxx.mongodb.net
7. Replace <password> with your actual password
8. Set in backend/.env:
   MONGODB_URL=mongodb+srv://veritai:yourpassword@cluster0.xxxxx.mongodb.net
   MONGODB_DB_NAME=veritai

## Option B — Local MongoDB (Development only)

1. Install MongoDB Community:
   Windows: https://www.mongodb.com/try/download/community
   Mac: brew install mongodb-community
   Ubuntu: sudo apt install mongodb
2. Start MongoDB:
   Windows: net start MongoDB
   Mac/Linux: brew services start mongodb-community
3. Set in backend/.env:
   MONGODB_URL=mongodb://localhost:27017
   MONGODB_DB_NAME=veritai

## Collections created automatically on first use:
  - users                  (stores user accounts)
  - verification_history   (stores fact-check reports)

## No schema migration needed — MongoDB is schemaless.
## Indexes are created automatically on startup by main.py lifespan event.
