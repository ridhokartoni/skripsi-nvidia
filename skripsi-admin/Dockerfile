# Stage 1: build dependencies with Node
FROM node:20-bullseye-slim AS build
WORKDIR /app
ENV PORT=3000 HOST=0.0.0.0
COPY package.json ./
COPY prisma ./prisma/
COPY . .
RUN npm install && npx prisma generate

# Stage 2: runtime on NVIDIA CUDA base (includes nvidia-smi)
FROM nvidia/cuda:12.3.2-base-ubuntu22.04 AS runtime
WORKDIR /app
ENV PORT=3000 HOST=0.0.0.0

# Install Node.js 20 and curl
RUN apt-get update \
  && apt-get install -y curl ca-certificates gnupg \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update \
  && apt-get install -y nodejs \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Copy built app
COPY --from=build /app /app

# Optional: Docker CLI for existing scripts that rely on it
RUN apt-get update && apt-get install -y docker.io && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
