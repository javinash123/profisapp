# Deployment Guide for PegPro Backend (AWS EC2 - Amazon Linux 2023)

## Prerequisites
- Node.js 20+ installed on EC2
- Apache installed with `mod_proxy` and `mod_proxy_http` enabled
- MongoDB Atlas (your live database)

## Step 1: Prepare the Files
1. Copy the following files/folders to your EC2 server (e.g., to `/var/www/pegpro-api`):
   - `server/`
   - `package.server.json` (rename to `package.json` on the server)
   - `tsconfig.server.json` (rename to `tsconfig.json` on the server)

## Step 2: Install and Build
On your EC2 server:
```bash
cd /var/www/pegpro-api
npm install
npm run build
```

## Step 3: Configure Environment Variables
Create a `.env` file in the root of your project:
```env
MONGODB_URI=mongodb+srv://jainavinash0007_db_user:pgwcgFuZus7iRpjx@cluster0.9apgqnv.mongodb.net/
SESSION_SECRET=your_random_secret_here
BASE_PATH=/pegpro
PORT=5000
```

## Step 4: Configure Apache Reverse Proxy
Edit your Apache configuration (e.g., `/etc/httpd/conf-enabled/pegpro.conf`):

```apache
<Location /pegpro>
    ProxyPass http://localhost:5000/pegpro
    ProxyPassReverse http://localhost:5000/pegpro
</Location>
```
Restart Apache: `sudo systemctl restart httpd`

## Step 5: Run the Server
Use PM2 to keep the server running:
```bash
npm install -g pm2
pm2 start dist/index.js --name pegpro-api
pm2 save
pm2 startup
```
