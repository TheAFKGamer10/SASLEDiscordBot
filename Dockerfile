FROM alpine

RUN mkdir -p /home/node/fivembot/node_modules && chown -R node:node /home/node/fivembot
WORKDIR /home/node/fivembot
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .

# Expose custom port if specified in .env file
ARG PORT
ENV PORT=${PORT:-3000}
EXPOSE $PORT

CMD [ "npm", "run", "start"]