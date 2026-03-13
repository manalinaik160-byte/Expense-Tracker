# Mini Kanban Board

## Project Overview

This project is a simple Kanban-style task management application inspired by Trello. It allows users to manage tasks across three stages: Todo, Doing, and Done.

The application is built using HTML, TailwindCSS, and Vanilla JavaScript.

## Features

### Core Features
- Create tasks
- Move tasks between columns
- Delete tasks
- Persistent data using localStorage

### Bonus Features
- Drag and Drop functionality
- Task priority labels (High, Medium, Low)
- Task due dates
- Dark mode toggle
- Smooth UI animations
- Task counters for each column

## Technologies Used

- HTML
- TailwindCSS
- Vanilla JavaScript
- Browser localStorage

## Folder Structure
Mini Kanban Board/ │ 
                   ├── index.html 
                   ├── script.js 
                   └── README.md

## Data Storage
Tasks are stored in the browser using localStorage in the following structure:
{ "todo": [], "doing": [], "done": [] }
This ensures tasks remain even after refreshing the page.

## How It Works

1. Users create tasks using the input field.
2. Tasks initially appear in the Todo column.
3. Tasks can be moved between columns using buttons or drag and drop.
4. Tasks can be deleted when completed.
5. All task data is saved automatically.

## Future Improvements

Possible enhancements include:

- Task editing
- User authentication
- Backend database integration
- Notifications for due dates

## Author

Mini Kanban Board Project  
Created for learning UI, DOM manipulation, and JavaScript application logic.