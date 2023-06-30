FROM node:18

WORKDIR /docker

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
