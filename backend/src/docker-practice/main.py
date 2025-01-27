import os
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

# Get MongoDB connection and default to "mongodb://localhost:27017" (local instance)
MONGODB_CONNECTION_STRING = os.environ.get("MONGODB_CONNECTION_STRING", "mongodb://localhost:27017")

# Create connection to MongoDB database
client = AsyncIOMotorClient(MONGODB_CONNECTION_STRING, uuidRepresentation="standard")

# Database and table setup
db = client.todolist
todos = db.todos

# Initialize FastAPI
app = FastAPI()

# Allows frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost"],
    allow_credentials=True,
    # Must allow all HTTP Methods (Get, Post, Delete)!
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TodoItem(BaseModel):
    '''
    Generate Unique IDs for todoitems in database (db)
        ID should be _id for primary key
    '''
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")

    # Text field for todo item
    content: str

    # Make uuid into dict for MongoDB compatibility
    def to_mongo(self):
        data = self.dict(by_alias=True)
        return data

# Format of incoming data into database (only needs string content)
class TodoItemCreate(BaseModel):
    content: str

# ROUTES

# Define endpoint at /todos
@app.post("/todos", response_model=TodoItem)
async def create_todo(item: TodoItemCreate):

    # Create new todo item object with unique ID
    new_todo = TodoItem(content=item.content)

    # Insert item into todos collection in MongDB database
    await todos.insert_one(new_todo.to_mongo())

    # Return new item to client
    return new_todo

# Define endpoint at /todos
@app.get("/todos", response_model=list[TodoItem])
async def read_todos():

    # Find all items in database
    result = await todos.find().to_list(length=None)

    # Convert MongoDB items into a Python list
    return [{"_id": doc["_id"], "content": doc["content"]} for doc in result]

# Define endpoint at /todos/{todo_id}
@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):

    # Delete item with matching _id in todos
    delete_result = await todos.delete_one({"_id": todo_id})

    # Throw error if item not found
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"}