FROM node:20-bullseye

# Install system dependencies required by mediasoup
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python3-pip \
    git \
    libsrtp2-dev \
    libssl-dev \
    libglib2.0-dev \
    libuv1-dev \
    pkg-config && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose HTTP and Mediasoup UDP ports
EXPOSE 8085 40000-40100/udp

# Start the app
CMD ["node", "dist/main"]
