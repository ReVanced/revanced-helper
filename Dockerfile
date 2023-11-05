FROM node:latest

ENV WIT_AI_TOKEN $WIT_AI_TOKEN
ENV MONGODB_URI $MONGODB_URI
ENV DISCORD_TOKEN $DISCORD_TOKEN

# Create app directory and install dependencies
WORKDIR /usr/src/revanced-helper
COPY . .
RUN npm i

# Install the server
WORKDIR /usr/src/revanced-helper/apps/server/src
RUN npm i

# Install the client for the server
WORKDIR /usr/src/revanced-helper/packages/client
RUN npm i

# Install the bot
WORKDIR /usr/src/revanced-helper/apps/bot-discord/src
RUN npm i

WORKDIR /usr/src/revanced-helper
CMD ["npm", "run", "start"]