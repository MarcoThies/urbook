FROM node:18

WORKDIR /docker

# Install dependencies
COPY package*.json ./
RUN npm install

RUN apt-get update && apt-get install -y nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Bundle app source
COPY . .

EXPOSE 8081 8080

# Create a script that starts both services
RUN echo "nginx && npm start" > start.sh
RUN chmod +x start.sh

# Start both services when the container is run
CMD ["./start.sh"]