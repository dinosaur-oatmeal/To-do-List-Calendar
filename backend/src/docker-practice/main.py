import os
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

MONGODB_CONNECTION_STRING = os.environ.get("MONGODB_CONNECTION_STRING", "mongodb://localhost:27017")

# MongoDB client setup
client = AsyncIOMotorClient(MONGODB_CONNECTION_STRING, uuidRepresentation="standard")
db = client.todolist
todos = db.todos

# FastAPI app setup
app = FastAPI()

# Allows frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost"],  # Update this if needed for deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TodoItem(BaseModel):
    # ID should be _id for primary key
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    content: str

    # Make uuid into dict for compatibility
    def to_mongo(self):
        data = self.dict(by_alias=True)
        return data


class TodoItemCreate(BaseModel):
    content: str

# ROUTES

@app.post("/todos", response_model=TodoItem)
async def create_todo(item: TodoItemCreate):
    # Create new todo item
    new_todo = TodoItem(content=item.content)
    # Save item in mongodb database
    await todos.insert_one(new_todo.to_mongo())
    # Return new item
    return new_todo


@app.get("/todos", response_model=list[TodoItem])
async def read_todos():
    # Find all items in database
    result = await todos.find().to_list(length=None)
    # Convert MongoDB documents
    return [{"_id": doc["_id"], "content": doc["content"]} for doc in result]


@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    # Grab result and delete item in database
    delete_result = await todos.delete_one({"_id": todo_id})
    # Throw error if item not found
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"}
