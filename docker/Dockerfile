# Use the official Node.js 18 LTS version
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install FFmpeg in Alpine
RUN apk add --no-cache ffmpeg

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Command to start the application
CMD ["npm", "start"]
