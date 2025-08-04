# UniHub: Project Setup and Development Guide

Welcome to the UniHub project! This document provides detailed instructions for setting up your local development environment to start contributing to the project.

---

### Prerequisites

Before you begin, ensure you have the following software installed on your machine:

* **Node.js (LTS Version)**: Required to run the React frontend.

* **A C++ Compiler**: A modern compiler like GCC or Clang is needed to build the C++ backend.

* **Git**: For version control.

* **A Code Editor**: VS Code, Sublime Text, or a similar editor of your choice.

---

### 1. General Project Setup

1.  **Clone the Repository:**
    Start by cloning the project repository to your local machine.

    ```
    git clone https://github.com/Adarsh-dev-tech/UniHub.git
    cd UniHub
    ```

2.  **Install C++ Backend Dependencies:**
    The backend uses a C++ web framework and a MongoDB driver. You will need to install these based on your OS and package manager. For example, using a package manager like `vcpkg` or `conan` is recommended to manage C++ dependencies easily.

    * **MongoDB C++ Driver:** Follow the instructions [here](https://www.google.com/search?q=https://www.mongodb.com/docs/drivers/cxx/latest/install/) to install the official MongoDB C++ driver.

    * **Crow/Pistache Framework:** The specific framework will have its own installation steps. Follow the guide for the chosen framework.

---

### 2. Frontend Developer Setup

This section is for the team member responsible for the React frontend.

1.  **Navigate to the Frontend Directory:**

    ```
    cd frontend
    ```

2.  **Install Node.js Dependencies:**
    This command will install all the required libraries for React and Tailwind CSS.

    ```
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the `frontend` directory. You will need to add the backend API URL here. Your DevOps teammate will provide the correct value.

    ```
    # frontend/.env.local
    REACT_APP_API_BASE_URL=http://localhost:8080/api
    ```

4.  **Run the Development Server:**
    This will start the React application in development mode. It will be available at `http://localhost:3000`.

    ```
    npm start
    ```

---

### 3. Backend Developer Setup

This section is for the team member responsible for the C++ backend.

1.  **Navigate to the Backend Directory:**

    ```
    cd backend
    ```

2.  **Configure CMake:**
    The project uses CMake to manage the build process. You'll need to specify the paths to the MongoDB driver and other libraries.

    ```
    # backend/CMakeLists.txt
    # Ensure your paths to MongoDB and Crow/Pistache are correct
    find_package(mongocxx REQUIRED)
    find_package(Crow REQUIRED) # or Pistache
    # ... rest of the CMake configuration
    ```

3.  **Build the Project:**
    Create a `build` directory and compile the project.

    ```
    mkdir build
    cd build
    cmake ..
    make
    ```

4.  **Configure Database Connection:**
    Create a `config.json` or similar file in the `backend` directory to store your database connection string. This should not be committed to version control. The DevOps teammate will provide the connection string.

    ```
    // backend/config.json
    {
      "mongoDbUri": "mongodb://localhost:27017/unihub_db"
    }
    ```

5.  **Run the Backend Server:**
    Execute the compiled binary to start the API server.

    ```
    ./unihub_server
    ```

---

### 4. DevOps & Database Engineer Setup

This section outlines the infrastructure setup and is primarily for the DevOps engineer.

1.  **MongoDB Setup:**
    * Install MongoDB on your local machine or use a cloud service like **MongoDB Atlas**.
    * Create a database named `unihub_db` and collections for `users`, `resources`, `majors`, etc., according to the schema.
    * Provide the connection string to the Frontend and Backend team members.

2.  **Google Cloud Platform (GCP) & Firebase:**
    * Set up a new project on **GCP**.
    * Enable **Firebase Authentication** and other necessary services.
    * Create a **Google Cloud Storage** bucket for file uploads and configure its access.
    * Provide the necessary API keys and service account credentials to the Backend developer for integration.

3.  **Redis Caching (Optional):**
    * Install Redis locally.
    * Configure the C++ backend to connect to the Redis instance.

---

### 5. Running the Full Application

To run the full application, you need to have both the backend and frontend servers running simultaneously.

1.  In one terminal, navigate to the `backend` directory and run the C++ server.

2.  In a second terminal, navigate to the `frontend` directory and run the React development server.

You should now be able to access the application at `http://localhost:3000`.

---

### Troubleshooting

* **`npm install` fails:** Check your Node.js version and ensure it's up to date. Delete the `node_modules` folder and `package-lock.json` and try again.

* **Backend won't compile:** Double-check your CMake configuration and ensure all C++ dependencies are correctly installed and linked.

* **Frontend can't connect to backend:** Verify that the backend server is running and the `REACT_APP_API_BASE_URL` in your `.env.local` file is correct.