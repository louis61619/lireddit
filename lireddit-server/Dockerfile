FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY yarn.lock ./

RUN yarn

# Bundle app source
COPY . .
COPY .env.production .env

RUN yarn build

EXPOSE 4000
CMD [ "node", "dist/index.js" ]
USER node

# build
# docker build -t lireddit .

# run
# docker run -p 4000:4000  -it lireddit
