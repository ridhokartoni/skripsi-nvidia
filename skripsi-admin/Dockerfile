# Build dependencies
FROM node:20.5.0-alpine as dependencies
WORKDIR /app
ENV PORT 3000
ENV HOST 0.0.0.0
COPY package.json .
COPY prisma ./prisma/

COPY . .
RUN npm install

RUN npx prisma generate

# Set NODE_ENV environment variable
ENV DATABASE_URL="postgresql://qaisjabbar:123@172.18.0.2:5432/nvidia"
ENV JWT_ACCESS_SECRET="SECRET123"
ENV JWT_REFRESH_SECRET="ANOTHER_SECRET123"

# Install Docker client
RUN apk add --no-cache curl
ENV DOCKERVERSION=20.10.18
RUN curl -fsSLO https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKERVERSION}.tgz \
  && tar xzvf docker-${DOCKERVERSION}.tgz --strip 1 \
                 -C /usr/local/bin docker/docker \
  && rm docker-${DOCKERVERSION}.tgz

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
