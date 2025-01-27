// Point to backend server address
const API_URL = "http://localhost:8000";

// Global array of all items in todo list
let allTodos = [];

// Global date for current day (render current date's calendar on page load)
let currentDate = new Date(); 

// Fetch todo items
async function fetchTodos() {
    try
    {
    // Call backend API and wait for reply
    const response = await fetch(`${API_URL}/todos`);
    const todos = await response.json();

    // Store all todo items in array
    allTodos = todos;

    // Re-render calendar to show all items in db with correct dates
    renderCalendar();
    }

    // Debug message if error occurs
    catch (error)
    {
        console.error("Error fetching todos:", error);
    }
}

// Add item to list
async function addItem()
{
    // Get text for item and associated date
    const textInput = document.getElementById("newItem");
    const dateInput = document.getElementById("todoDate");

    // Don't add to database if item is empty
    if (textInput.value.trim() === "")
    {
        return;
    }

    // Format entry for database into "Task||YYYY-MM-DD"
    let contentString = textInput.value;
    if (dateInput.value)
    {
        contentString += `||${dateInput.value}`;
    }

    // Post to /todos
    try
    {
        // Call backend to add item
        const response = await fetch(`${API_URL}/todos`,
        {
            // POST to create a new task
            method: "POST",

            // Send content at JSON
            headers:
            {
                "Content-Type": "application/json",
            },

            // Send actual content to backend at /todos
            body: JSON.stringify({ content: contentString }),
        });

        // Ensure response is successful
        if (response.ok)
        {
            // Clear inputs
            textInput.value = "";
            dateInput.value = "";

            // Fetch todos again to update calendar
            fetchTodos();
        }
        
        // Debug message if error occurs
        else
        {
            console.error("Failed to create todo:", response.statusText);
        }

    }
    
    // Debug message if error occurs
    catch (error)
    {
        console.error("Error creating todo:", error);
    }
}

// Delete item from list
async function deleteItem(id)
{
    try
    {
        // Call backend to delete item with ID of item
        const response = await fetch(`${API_URL}/todos/${id}`,
        {
            method: "DELETE",
        });

        // Ensure response is successful
        if (response.ok)
        {
            // Fetch todos again to update calendar
            fetchTodos();
        }

        // Debug message if error occurs
        else
        {
            console.error(`Failed to delete todo with id: ${id}`);
        }
    }
    
    // Debug message if error occurs
    catch (error)
    {
        console.error("Error deleting todo:", error);
    }
}

// Render Calendar
function renderCalendar()
{
    const calendarGrid = document.getElementById("calendarGrid");
    const calendarMonthYear = document.getElementById("calendarMonthYear");

    // Ensure calendar elements exist
    if (!calendarGrid || !calendarMonthYear) return;

    // Clear existing calendar cells to remake
    calendarGrid.innerHTML = "";

    // Clone currentDate to avoid mutating it
    const tempDate = new Date(currentDate.getTime());

    // Grab first date of month and associated data
    tempDate.setDate(1);
    const month = tempDate.getMonth();
    const year = tempDate.getFullYear();

    // Update header to be readable with month and year
    calendarMonthYear.textContent = tempDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
    });

    // Find what day of week 1st falls on
    const firstDayIndex = tempDate.getDay(); 

    // Find total days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Blank cells for days before the 1st
    for (let i = 0; i < firstDayIndex; i++)
    {
        // Each cell gets its own div
        const blankCell = document.createElement("div");

        // Ensure consistency with regular cells
        blankCell.classList.add("calendar-day", "blank");

        // Append blank cells to calendar
        calendarGrid.appendChild(blankCell);
    }

    // Create cell of each day in month
    for (let day = 1; day <= daysInMonth; day++)
    {
        // Each cell gets its own div and class (consistency)
        const cell = document.createElement("div");
        cell.classList.add("calendar-day");

        // Top portion is cell's date
        const dayNumber = document.createElement("div");
        dayNumber.classList.add("day-number");
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        // Container for any tasks that match date
        const tasksContainer = document.createElement("div");
        tasksContainer.classList.add("day-tasks");

        // Build cell's date in YYYY-MM-DD format
        const dayString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        // Filter tasks that have same date in content: "Task||YYYY-MM-DD" (loops through all todos array)
        const tasksForThisDay = allTodos.filter((todo) => {

            // Check if content has the pattern "||" (all items should)
            if (!todo.content.includes("||")) return false;
            // Split and compare item with cell's date
            const splitContent = todo.content.split("||");
            return splitContent[1] === dayString;
    });

    // Create element for each matched task
    tasksForThisDay.forEach((task) =>
    {
        // Get content before "||" (date delimiter)
        const splitContent = task.content.split("||");
        const actualText = splitContent[0];

        // Create div for each task
        const taskEl = document.createElement("div");
        taskEl.classList.add("task-item");
        // Add text to div
        taskEl.textContent = actualText;

        // Delete button for each tast
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "x";
        deleteBtn.classList.add("inline-delete");
        // Call delete when clicked
        deleteBtn.onclick = () => deleteItem(task._id);

        // Append text and delete button to task element
        taskEl.appendChild(deleteBtn);
        tasksContainer.appendChild(taskEl);
    });

    // Append each task element to day
    cell.appendChild(tasksContainer);

    // Append each day element to cell
    calendarGrid.appendChild(cell);
    }
}

// Previous month button
function prevMonth()
{
    // Decrement month by 1 and re-render calendar
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

// Next month button
function nextMonth()
{
    // Increment month by 1 and re-render calendar
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Fetch todos from database on page load (renders calendar)
fetchTodos();