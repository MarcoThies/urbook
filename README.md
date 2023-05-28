# UrBook - Team 13

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
    SECRETKEY=  [your_secret_key]
    PORT=       [dev_port]

    API_SALT=    [some_bcrypt_balt]

    TYPEORM_HOST=           [db_host]
    TYPEORM_PORT=           [db_port]
    TYPEORM_USERNAME=       [db_user]
    TYPEORM_PASSWORD=       [db_password
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
- Run `npm run build` to build a deployable version of the server
- Upload to Docker / Host yourself

***

## Description
With innovative text- and image-generating AIs like Chat GPT or Midjourney, completely new and personalized children's books can be generated, tailored to each individual child. 
Currently, the individual AIs must be operated separately, and the generated content must be manually combined. 
There is high market potential in optimizing this process and offering it as a SaaS or "Children's Book Generation as a Service" on the internet.

In the first step we will develop an MVP for this use case to ensure the basic feasibility. 
The MVP also lays the foundation for demonstrating the potential of such a service to potential customers.

## Support
For support and questions email us at info@urbook.com

## Roadmap
After the MVP we plan to further develop the software into a proper commercial service.

- [x] Authentication
- [x] Dummybook generation in db and to pdf
- [ ] Book generation with AI data
- [ ] Prompt-optimisation
- [ ] Book-Quality control

## Project status
The project is currently in development. We antivipate that the MVP will be ready for demonstration by and the next steps are being planned.