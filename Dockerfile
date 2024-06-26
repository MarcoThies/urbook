FROM node:18

WORKDIR /docker

# Install dependencies
COPY package*.json ./
RUN npm install

RUN apt-get update

# Bundle app source
COPY . .

EXPOSE 8081

# Create a script that starts both services
RUN echo "npm start" > start.sh
RUN chmod +x start.sh

# Start both services when the container is run
CMD ["./start.sh"]