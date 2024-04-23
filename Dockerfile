FROM alpine

RUN adduser -D node
RUN addgroup node node
RUN apk add --update nodejs npm

RUN mkdir -p /home/node/fivembot/node_modules 
RUN chown -R node:node /home/node/fivembot

WORKDIR /home/node/fivembot

COPY package*.json ./
RUN chown node:node /home/node/fivembot/package-lock.json
USER node
RUN npm install

COPY --chown=node:node . .

# Copy the .env file to the root folder of the container
COPY .env .

# Expose custom port if specified in .env file
ARG PORT
ENV PORT=${PORT:-3000}
EXPOSE $PORT

CMD [ "npm", "run", "start"]