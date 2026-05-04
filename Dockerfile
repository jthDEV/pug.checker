FROM node:24-alpine

WORKDIR /app

ARG BUILD_SHA=unknown
ARG BUILD_TIME=unknown
ENV BUILD_SHA=${BUILD_SHA}
ENV BUILD_TIME=${BUILD_TIME}

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./
COPY public ./public

EXPOSE 3000

CMD ["node", "server.js"]
