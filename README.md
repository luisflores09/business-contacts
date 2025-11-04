# business-contacts
An application serving up business contacts, via Node, Express, and React
## 👉 Client Dockerfile setup

1. Locate the client folder directory.
2. Create a new file named `Dockerfile` in the client directory.
3. Copy the following instructions into the `Dockerfile`:

```dockerfile

FROM node

WORKDIR /app

COPY . .

RUN npm install && npm run build

EXPOSE 1234

CMD ["node", "server.js"]

```

4. Make sure that all the project files are inside the directory, otherwise the `COPY . /app` command will not work correctly.

5. In the terminal, navigate to the project directory and run the following command:

```sh
docker build -t project-name 
```

This command will build the Docker image and tag it as "project-name".

6. To run the container, use the following command:

```sh
docker run -p 1234:1234 project-name
```

This command will run the container and map the host port 1234 to the container's port 1234.

7. The service can be accessed via http://localhost:1234

## 👉 Server Dockerfile setup

1. Create a new folder named `server` in your project directory.
2. Using a text editor, create a new file named `Dockerfile` in the `server` folder.
3. Copy the following instructions into the `Dockerfile`:

```dockerfile
FROM node
ENV NODE_ENV=development
WORKDIR /app
COPY package.json .
RUN npm install 
COPY . .
EXPOSE 3000
CMD [ "node", "server.js" ]
```

4. In the terminal, navigate to the server directory and run the following command:

```sh
docker build -t server-image 
```

This command will build the Docker image and tag it as "server-image".

5. To run the container, use the following command:

```sh
docker run -p 3000:3000 server-image
```


## Docker commands:

```sh
docker build -t name-of-image
docker run -p matchPort:matchPort name-of-image
```

# Options for Running
### Option 1 - Run in development (or just without docker)
The point of this example is _not_ to run the apps independently, but if you prefer, or if you're developing/updating them, you can run them independently:
- Open 2 terminals
- In one terminal, run `cd server` and `npm run start-dev` (runs in watch mode on port 3000)
- In the other terminal, run `cd client` and `npm start` (runs in watch mode on port 1234)
- Visit the app at [localhost:1234](https://localhost:1234)

### Option 2 - Running with `docker-compose`
**🚨 NOTE 🚨 If you have run the app locally first via above commands, you'll need to _delete the `node_modules` directory_ in at least the `client` project.** (this is because of a bug in one of the dependencies of Parcel, and a different version of Parcel is used in a Linux environment than in a Mac environment)

Once you have created the `docker-compose.yml`:
- If not done already, install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- run `docker-compose up`
- Visit the app at [localhost:1234](https://localhost:1234)
- To stop the app: `docker-compose down --rmi all` (this also removes all images)

## 🚀 Deployment to Render

### Prerequisites
1. Push your code to GitHub
2. Create a [Render account](https://render.com)

### Step 1: Deploy PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - Name: `business-contacts-db`
   - Database: `business_contacts`
   - Region: Choose closest to you
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (you'll need this for the server)

### Step 2: Deploy Backend Server

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `business-contacts-server`
   - **Root Directory**: `server`
   - **Runtime**: `Docker`
4. Add **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<paste-internal-database-url>
   CLIENT_URL=<your-frontend-url-from-step-3>
   ```
5. Set **Health Check Path**: `/health`
6. Click **"Create Web Service"**
7. **Copy the server URL** (e.g., `https://business-contacts-server.onrender.com`)

### Step 3: Deploy Frontend Client

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `business-contacts-client`
   - **Root Directory**: `client`
   - **Runtime**: `Docker`
4. Add **Environment Variables**:
   ```
   REACT_APP_API_URL=<server-url-from-step-2>
   ```
5. Click **"Create Web Service"**

### Step 4: Update Server Environment

Go back to your server settings and update `CLIENT_URL` with your actual client URL from Step 3.

### Testing Your Deployment

- Health check: `https://your-server.onrender.com/health`
- API: `https://your-server.onrender.com/contacts`
- Frontend: `https://your-client.onrender.com`

### Important Notes

- **Free tier**: Services spin down after 15 minutes of inactivity
- **First request**: May take 30-60 seconds to wake up
- **Database**: Free tier expires after 90 days
- **CORS**: Configured to accept requests from your client URL
