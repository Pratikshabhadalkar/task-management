# Task Management API 🚀

Welcome to the Task Management API! This RESTful API allows you to manage tasks with features like task creation, update, deletion, and advanced functionalities like search, archiving, and user authentication. 

## Table of Contents 📚

- [Features](#features)
- [Endpoints](#endpoints)
- [Running the Server](#running-the-server)
- [Testing the API](#testing-the-api)
- [License](#license)

## Features ✨

- **Authentication**: Login and secure endpoints with JWT tokens.
- **Task Management**: Create, read, update, and delete tasks.
- **Filtering**: Search tasks by keyword, filter by status, priority, and category.
- **Overdue & Due Soon**: Retrieve tasks that are overdue or due soon.
- **Bulk Operations**: Create multiple tasks at once.
- **Archiving**: Archive completed tasks and retrieve them.
- **Comments**: Add comments to tasks.
- **History Tracking**: Track changes made to tasks.
- **Task Sharing**: Generate shareable links for tasks.
- **Complete All**: Mark all pending tasks as completed.

## Endpoints 📌

### Authentication

- **Login**: `POST /login`
  - Request body: `{ "username": "admin", "password": "admin123" }`
  - Response: `{ "token": "your_jwt_token" }`

### Task Management

- **Create Task**: `POST /tasks`
  - Request body: `{ "name": "New Task", "dueDate": "2024-09-01", "status": "pending" }`
  - Response: `{ "id": 4, "name": "New Task", "dueDate": "2024-09-01", "status": "pending", "history": [], "comments": [] }`

- **Get All Tasks**: `GET /tasks`
  - Query parameters: `status`, `priority`, `category`
  - Response: `[ { "id": 1, "name": "Task 1", "dueDate": "2024-08-24", "completed": false } ]`

- **Get Task by ID**: `GET /tasks/:id`
  - Response: `{ "id": 1, "name": "Task 1", "dueDate": "2024-08-24", "completed": false }`

- **Update Task**: `PUT /tasks/:id`
  - Request body: `{ "name": "Updated Task" }`
  - Response: `{ "id": 1, "name": "Updated Task", "dueDate": "2024-08-24", "completed": false }`

- **Patch Task Priority**: `PATCH /tasks/:id/priority`
  - Request body: `{ "priority": "high" }`
  - Response: `{ "id": 1, "name": "Task 1", "dueDate": "2024-08-24", "priority": "high" }`

- **Patch Task Assignment**: `PATCH /tasks/:id/assign`
  - Request body: `{ "assignedTo": "user123" }`
  - Response: `{ "id": 1, "name": "Task 1", "assignedTo": "user123" }`

- **Bulk Create Tasks**: `POST /tasks/bulk`
  - Request body: `[ { "title": "Task 1", "description": "Description", "dueDate": "2024-09-01" } ]`
  - Response: `[ { "id": 4, "title": "Task 1", "description": "Description", "dueDate": "2024-09-01" } ]`

- **Archive Task**: `PATCH /tasks/:id/archive`
  - Response: `{ "id": 1, "status": "archived" }`

- **Retrieve Archived Tasks**: `GET /tasks/archived`
  - Response: `[ { "id": 1, "name": "Archived Task", "status": "archived" } ]`

- **Unassign Task**: `PATCH /tasks/:id/unassign`
  - Response: `{ "id": 1, "assignedTo": null }`

- **Delete Task**: `DELETE /tasks/:id`
  - Response: `204 No Content`

- **Delete Completed Tasks**: `DELETE /tasks/delete-completed`
  - Response: `{ "count": 3 }`

- **Search Tasks**: `GET /tasks/search`
  - Query parameter: `q`
  - Response: `[ { "id": 1, "name": "Task 1" } ]`

- **Tasks Due Soon**: `GET /tasks/due-soon`
  - Query parameter: `days`
  - Response: `[ { "id": 1, "name": "Task Due Soon" } ]`

- **Complete All Tasks**: `PATCH /tasks/complete-all`
  - Response: `[ { "id": 1, "status": "completed" } ]`

- **Get Task History**: `GET /tasks/:id/history`
  - Response: `[ { "timestamp": "2024-08-24T12:00:00Z", "changes": { "status": "completed" }, "changedBy": "user123" } ]`

- **Duplicate Task**: `POST /tasks/:id/duplicate`
  - Response: `{ "id": 5, "name": "Duplicated Task" }`

- **Share Task**: `POST /tasks/:id/share`
  - Response: `{ "shareableLink": "http://localhost:3000/tasks/1/view-only" }`



## Running the Server 🏃‍♂️

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/task-management-api.git
2.**Navigate to the Project Directory**:
cd task-management-api

3.**Install Dependencies:**:
npm install


4.**Start the Server:**
node server.js

The server will start on port 3000 by default. 🎉

Testing the API 🧪
You can use Postman or curl to test the endpoints. Make sure to include the JWT token in the Authorization header for authenticated endpoints.


License 📜
This project is licensed under the MIT License - see the LICENSE file for details.


