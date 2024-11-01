

# Devflix Backend

Welcome to the **Devflix** backend repository! This backend, built on Node.js and Express, powers the core features of Devflix, a video streaming platform with functionalities similar to YouTube, designed especially for developers. It includes features like user authentication, video uploads, playlists, comments, likes, and many more.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **User Authentication**: Secure login and signup with JWT-based authentication.
- **Video Management**: Upload, update, and delete videos, with support for Cloudinary storage.
- **Playlists**: Create and manage playlists.
- **Likes and Comments**: Like videos and add comments, with toggle functionality.
- **Real-time Alerts**: Event-driven alerts for likes and comments.

---

## Tech Stack

- **Node.js**
- **Express**
- **MongoDB**
- **Mongoose**
- **JWT Authentication**
- **Cloudinary** for file storage
- **dotenv** for environment variables

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Pratik4230/devflix.git
   cd devflix
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a .env file in the root of the project and add the following:
    
   ```bash
   MONGO_URI=
   CLOUDINARY_URL=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   CLOUDINARY_CLOUD_NAME=
   PORT=
   ACCESS_TOKEN_SECRET=
   REFRESH_TOKEN_SECRET=
   CORS_ORIGIN=
   ```

---

## Usage

- **Start the server:** Ensure .env variables are configured and run:
  
  ```bash
  npm start
  ```

- **Testing API Endpoints:** Use tools like Postman to test each endpoint.

- **Connecting Frontend:** This backend is designed to work seamlessly with the Devflix frontend, enabling smooth communication across all API routes.

---

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

---

## License

This project is licensed under the MIT License.
