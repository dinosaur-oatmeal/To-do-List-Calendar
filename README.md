# To-Do List with Calendar Integration

## Description

This project is a simple **To-Do List Application** integrated with a **Calendar View**, allowing users to:

* Add tasks with optional due dates.

* View tasks in a calendar layout, organized by date.

* Delete tasks directly from the calendar.

The application includes a **frontend** (JavaScript) and a **backend** (FastAPI with MongoDB). Deployment is supported via Docker.

# Features

* Add Tasks: Create new tasks and add them to the calendar.

* View Tasks by Date: Tasks are displayed on their respective calendar dates.

* Delete Tasks: Remove tasks directly from the calendar with a delete button.

* Month Navigation: Switch between months to view tasks for different dates.

* Dynamic Calendar: Automatically adjusts for the number of days in each month.

# Tech Stack

## Frontend

* HTML, CSS, JavaScript for rendering and interactions.

## Backend

* FastAPI: API framework for managing tasks.

* MongoDB: Database for storing tasks and their details.

## Deployment

* Docker: Both the frontend and backend are containerized for easy deployment.

# API Endpoints

**`POST /todos`**

* Description: Create a new to-do item.

* Request Body:

```bash
{
    "content": "Task description || YYYY-MM-DD"
}
``` 
* Response:

```bash
{
    "_id": "unique-task-id",
    "content": "Task description || YYYY-MM-DD"
}
```

**`GET /todos`**

* Description: Fetch all to-do items.

* Response:

```bash
[
    {
        "_id": "unique-task-id",
        "content": "Task description || YYYY-MM-DD"
    },
    ...
]
```

**`DELETE /todos/{id}`**

* Description: Delete a to-do item by its ID.

* Response:

```bash
{
    "message": "Todo deleted successfully"
}
```

