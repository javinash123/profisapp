# Single File Deployment Guide for PegPro Backend

## Quick Start
1. Copy `bundle.js` and `package.json` (renamed from `package.server.json`) to your server.
2. Install dependencies: `npm install`
3. Set your environment variables (see below).
4. Run: `node bundle.js`

## Environment Variables (.env)
```env
MONGODB_URI=mongodb+srv://jainavinash0007_db_user:pgwcgFuZus7iRpjx@cluster0.9apgqnv.mongodb.net/
SESSION_SECRET=your_random_secret_here
BASE_PATH=/pegpro
PORT=5000
```

## Note on Dependencies
Even with a bundle, some heavy binary or driver-specific libraries (like `bcryptjs` and `mongoose`) need to be installed on the target system to ensure they match the server's OS architecture.
