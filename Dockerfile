# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
