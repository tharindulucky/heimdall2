FROM node:alpine
WORKDIR /usr/src/app
COPY ./package.json ./
COPY ./package-lock.json ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./data ./data
COPY ./.env ./
RUN npm i && npm run build
CMD ["npm", "start"]