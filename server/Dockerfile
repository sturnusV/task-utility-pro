# Dockerfile for Express app
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# This step is separate to leverage Docker's layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the Express app listens on
# This should match the PORT in the config.ts (3001 by default)
EXPOSE 3001

# Command to run the compiled application
# This assumes the compiled entry point is dist/index.js or similar
CMD ["node", "dist/index.js"]