# UniHub Team Roles and 2-Month Roadmap

Building a full-stack application with a team of three requires a clear division of roles. The following plan allocates responsibilities based on the core components of our technology stack, ensuring that each team member has a distinct and crucial part to play.

## Team Roles & Responsibilities

### 1. Frontend Developer
**Focus**: User Interface and Experience
This person is responsible for everything the user sees and interacts with. They will be the face of the application and the bridge to the backend services.
* **Key Responsibilities**:
    * Building the entire user interface using **React.js**.
    * Implementing the responsive design and styling with **Tailwind CSS**.
    * Managing the application's state with a tool like **Zustand**.
    * Developing all UI components: search page, dedicated major pages, resource cards, user profiles, discussion forums, and the resource upload form.
    * Integrating with the C++ backend's **RESTful API** to fetch and display data.
    * Handling the user authentication flow using the **Firebase Authentication** UI.

### 2. Backend Developer
**Focus**: Core Logic and API Development
This person is the engine of the application. They will implement the high-performance C++ logic and create the API endpoints that power the frontend.
* **Key Responsibilities**:
    * Implementing all core data structures in **C++**, including the **Trie** for search, the **Inverted Index** for fast lookups, and the **Tree** for discussion forums.
    * Developing the **RESTful API** endpoints using a C++ web server framework like **Crow** or **Pistache**.
    * Writing the core business logic for features such as resource search, filtering, ratings, and reviews.
    * Creating the C++ code to interact with the **MongoDB** database driver for all data persistence.
    * Handling the logic for file uploads and downloads, which will communicate with the file storage service.

### 3. DevOps & Database Engineer
**Focus**: Infrastructure, Data Management, and Deployment
This person is the architect and operations specialist. They are responsible for setting up and maintaining the entire application infrastructure, ensuring it is reliable and scalable.
* **Key Responsibilities**:
    * Designing the **MongoDB** database schema and optimizing it for performance.
    * Setting up and managing the entire **Google Cloud Platform (GCP)** infrastructure.
    * Configuring **Firebase Authentication** and managing user data.
    * Setting up and integrating **Google Cloud Storage** for all file uploads.
    * Deploying the React frontend and the C++ backend to GCP.
    * Implementing a caching layer with **Redis** to improve performance.
    * Setting up monitoring tools and ensuring the application runs smoothly in production.

---

## Two-Month Project Roadmap

This roadmap breaks down the project into four two-week sprints, each with clear objectives and milestones.

### Month 1: Foundational Setup and Core Development

#### Weeks 1-2: Project Setup & Schema Design
* **Frontend**: Create the React project, configure Tailwind CSS, and develop initial wireframes and UI mockups.
* **Backend**: Set up the C++ development environment and begin implementing the core data structures (**Trie** and **Inverted Index**). Define the API endpoint contracts.
* **DevOps**: Finalize the **MongoDB** schema, set up a cluster, and configure the basic project on **GCP** with **Firebase Authentication**.
* **Milestone**: All team members have their environments set up, the database schema is finalized, and the API endpoints are defined.

#### Weeks 3-4: Core Feature Implementation
* **Frontend**: Build the main structural components of the site (Header, Footer, Major/Department pages) and the basic resource listing page. Implement the user registration and login forms using Firebase.
* **Backend**: Implement the C++ API endpoints for user authentication, resource upload, and fetching a list of resources. Integrate the C++ code with the **MongoDB** driver.
* **DevOps**: Set up the file storage service and create the C++ backend's deployment environment on **GCP**.
* **Milestone**: The core functionality is working. A user can sign up, log in, view a list of resources, and upload a new resource, with data being persisted in the database.

### Month 2: Integration, Community Features, and Deployment

#### Weeks 5-6: Community Features & Search
* **Frontend**: Develop the UI for the rating and review system, the discussion forums, and the user dashboard. Integrate these components with the corresponding API calls.
* **Backend**: Implement the C++ API endpoints for ratings, reviews, and forum posts. Integrate the search functionality, leveraging the high-speed **Trie** and **Inverted Index** data structures.
* **DevOps**: Implement the **Redis** caching layer to optimize performance for popular resources. Begin setting up a basic CI/CD pipeline for automated deployments.
* **Milestone**: All major features are implemented. The search bar is functional, and users can interact with the community features.

#### Weeks 7-8: Finalization, Testing & Launch
* **Frontend**: Conduct a final pass on the UI, ensuring all pages are fully responsive and bug-free.
* **Backend**: Perform final code review, refactor any legacy code, and ensure all API endpoints are secure and handle errors gracefully.
* **DevOps**: Conduct comprehensive end-to-end testing of the entire application. Deploy the final production version of both the frontend and backend to **GCP**.
* **Milestone**: The UniHub platform is fully functional, tested, and live for the NIT Trichy community to use.