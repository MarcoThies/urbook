# UrBook - Team 13
### Repository for a backend API that generates children's books with AI

---
### Live Demo: [urbook.de](http://urbook.de)
(requires closed beta key to access)

---
The repository for the frontend can be found [here](https://gitlab.rz.htw-berlin.de/s0577395/urbook-frontend).

---
## Team
- [x] Theo Kolb
- [x] Marco Thies
- [x] Sönke Tenckhoff

## System
- Nest.js (Node.js)
- Typescript

***

## Installation and requirements
1) Clone the repository
2) Ask the team for the .env file -> contains live db-credentials
   - Place the .env file in the root directory
   - (optional) create your own .env file with the following attributes:
   
   ```
    JWT_SECRETKEY=       [your_secret_key]
    JWT_EXPIRATION          = 1h
    JWT_IGNORE_EXPIRATION   = false
    
    # Server API Port
    PORT        = 8081
    
    # File Server URL
    FILE_URL = localhost
    FILE_PORT   = 8080
    FILE_SSL    = false

    API_SALT=    [some_bcrypt_balt]
    
    OPENAI_API_KEY=  [ai_key]
    OPENAI_API_ORG=  [ai_org]
    
    # MidJourney auth token
    MID_SALAI=   [discord_account_key]
    # MidJounrey Discord Server and Channel
    MID_SERVER  = [discord_server_number]
    MID_CHANNEL = [discord_channel_number]
    
    TYPEORM_HOST=           [db_host]
    TYPEORM_PORT=           [db_port]
    TYPEORM_USERNAME=       [db_user]
    TYPEORM_PASSWORD=       [db_password]
    TYPEORM_DATABASE=       [db_name]
    TYPEORM_SYNC=           true

   ```
3) Run 'npm install' in the root directory to solve dependencies

## Usage and Testing
- Run `npm run dev:start` to start the server in development mode
- Use our [Postman-collection](https://lunar-rocket-10344.postman.co/workspace/7e704c2b-6900-4e9a-bcc4-36b2ea9c021f) to test the API
  - Make sure to select the `Development Env`-Environment in Postman to make use of the variables
  - Try `Collections` for different server test

## Deployment
- Run `docker build -t urbook-docker .` in the main dir to build a deployable image of the api
- Run `docker run -p 8081:8081 -p 8080:8080 urbook-docker` to start the container
- The nginx file server is running on port 8080, the api is running on port 8081

***

## Description
With innovative text- and image-generating AIs like Chat GPT or Midjourney, completely new and personalized children's books can be generated, tailored to each individual child. 
Currently, the individual AIs must be operated separately, and the generated content must be manually combined. 
There is high market potential in optimizing this process and offering it as a SaaS or "Children's Book Generation as a Service" on the internet.

In the first step we will develop an MVP for this use case to ensure the basic feasibility. 
The MVP also lays the foundation for demonstrating the potential of such a service to potential customers.

## Support
For support and questions email us at admin@urbook.com

## Roadmap
After the MVP we plan to further develop the software into a proper commercial service.

- [x] Authentication
- [x] Dummybook generation in db and to pdf
- [x] Book generation with AI data
- [x] Prompt-optimisation
- [ ] Upload photo of child for story main character similarity
- [ ] Book-Quality control

Bonus:

- [x] Integrate AWS Cloud
- [x] Create frontend
- [x] get it running in docker

## Project status
The project is currently in development. We anticipate that the MVP will be ready for demonstration by and the next steps are being planned.