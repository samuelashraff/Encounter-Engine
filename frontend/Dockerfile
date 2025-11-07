# Frontend Dockerfile
FROM node:20-alpine

# Set working directory to /app inside the container
# From this point onward, all paths (for COPY, RUN, CMD, etc.) are relative to /app inside the container.
WORKDIR /app

# Copy only package.json and package-lock.json first.
# This allows Docker to cache npm install layers unless dependencies change.
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the React project files into the container.
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
