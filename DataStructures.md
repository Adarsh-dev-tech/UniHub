# Proposed Data Structures for UniHub

Building on the project abstract and feature list, a successful implementation of UniHub will rely on a well-defined set of data structures. These structures are designed to manage the platform's core components—users, resources, and community interactions—efficiently and effectively.

## 1. User Data Structure
This structure will hold all information related to a registered student. It serves as the central point for authentication and personalization.
* `userId`: A unique identifier (e.g., UUID or a database-generated ID).
* `displayName`: The student's name, as they wish it to appear on the platform.
* `email`: The student's email address, used for login and notifications.
* `major`: A string or reference to the Major data structure.
* `joinedDate`: A timestamp of when the user registered.
* `contributions`: A list of references to resources the user has uploaded, useful for the contributor recognition system.
* `savedResources`: A list of references to resources the user has bookmarked.

## 2. Resource Data Structure
This is the most critical data structure, as it defines the core content of the platform. It must be flexible enough to handle various types of files and metadata.
* `resourceId`: A unique identifier for each resource.
* `title`: The title of the resource (e.g., "CSC101 Final Exam Paper 2023").
* `description`: A brief summary of the resource's content.
* `fileURL`: The URL where the file is stored (e.g., on a cloud storage service like Firebase Storage).
* `uploaderId`: A reference to the `userId` of the student who uploaded the resource.
* `uploadDate`: A timestamp of when the resource was uploaded.
* `majorId`: A reference to the Major data structure.
* `courseCode`: A string representing the course code (e.g., "CS-C11").
* `resourceType`: A string indicating the type (e.g., "Notes," "Past Paper," "Textbook," "Video").
* `tags`: A list of strings or references to a Tag data structure.
* `ratings`: An aggregate of all ratings, possibly an object containing a total score and a count.
* `reviews`: A list of references to the Review data structure.

## 3. Major Data Structure
This structure provides the organizational backbone for the entire platform, connecting resources to specific departments.
* `majorId`: A unique identifier (e.g., "CS" for Computer Science).
* `majorName`: The full name of the major (e.g., "Computer Science and Engineering").
* `courseCodes`: A list of course codes associated with the major.

## 4. Review Data Structure
To power the rating and review system, a separate structure is needed to store individual reviews and link them to users and resources.
* `reviewId`: A unique identifier for the review.
* `resourceId`: A reference to the `resourceId` being reviewed.
* `reviewerId`: A reference to the `userId` of the student who wrote the review.
* `rating`: A numerical value (e.g., 1-5).
* `comment`: The text of the review.
* `timestamp`: The date and time the review was submitted.

## 5. Tag Data Structure
While tags could be simple strings, a dedicated structure allows for better management, such as counting tag usage and providing auto-completion features.
* `tagId`: A unique identifier for the tag.
* `tagName`: The name of the tag (e.g., "final-prep," "lab-report").
* `resourceCount`: A count of how many resources use this tag, useful for popularity metrics.

## 6. Discussion Forum Structures
For the discussion forums, a hierarchical model is most effective.
* **Thread**:
    * `threadId`: Unique identifier.
    * `title`: The title of the discussion.
    * `creatorId`: A reference to the `userId` who started the thread.
    * `timestamp`: Creation date.
    * `majorId`: A reference to the Major data structure if the forum is major-specific.
    * `posts`: A list of references to Post data structures.
* **Post**:
    * `postId`: Unique identifier.
    * `threadId`: A reference back to the parent thread.
    * `authorId`: A reference to the `userId` who wrote the post.
    * `content`: The text of the post.
    * `timestamp`: Creation date.
    * `parentPostId`: An optional reference to another `postId` for replies.

---

## 7. Underlying Data Structures and Algorithms

The logical structures above would be implemented using more fundamental data structures to optimize for common operations.

* **Core Data Storage (Users, Resources, Majors)**: A key-value store (like a Hash Map in a database) would be the primary way to store and retrieve these objects. Each object's unique ID (`userId`, `resourceId`, etc.) would serve as the key, allowing for an average O(1) lookup time.
* **Search Functionality**: To enable fast and efficient searching of resource titles, course codes, and tags, an **Inverted Index** would be used. The index would map keywords (e.g., "CSC101," "final") to a list of `resourceId`s that contain those keywords. For search suggestions as a user types, a **Trie** (prefix tree) would be highly effective, allowing for rapid auto-completion.
* **User Contributions and Saved Items**: The `contributions` and `savedResources` fields in the User data structure would be implemented as a simple **Array** or a **List** of resource IDs.
* **Community Graph**: The relationships between users, resources, and reviews (who uploaded what, who reviewed what) can be conceptually modeled as a **Graph**. While not explicitly implemented with a graph data structure in a typical web backend, a graph database would be ideal for this, or it can be simulated with relational tables for efficient querying of these connections.
* **Discussion Threads**: The replies within a discussion thread naturally form a **Tree** data structure. Each post (node) has a link to its parent post. Traversing this tree allows for the correct display of a nested conversation.
* **Tags**: The `tags` field in the Resource data structure would be stored as a **Hash Set** for efficient O(1) checking of whether a specific tag is present.

This structured approach ensures that the data is organized logically, making it easy to query, update, and scale the application as the community grows.