💰 Smart Expense Tracker

A modern personal expense tracking web application built using HTML, TailwindCSS, and Vanilla JavaScript.
This project allows users to record, manage, and visualize daily expenses through a clean dashboard-style interface.

The application focuses on UI design, data handling, and client-side storage while providing a professional fintech-style user experience.

---

🚀 Features

📊 Dashboard Summary

The application includes three interactive summary cards:

- Total Expenses – Displays the total money spent
- Total Transactions – Number of recorded expenses
- Highest Spending Category – Category with the most spending

These values update automatically whenever an expense is added or deleted.

---

➕ Add Expense

Users can add a new expense using the input form.

Input Fields

- Expense Name
- Amount
- Category

Available Categories

- Food
- Transport
- Shopping
- Entertainment
- Bills
- Other

Validation

The application ensures:

- Expense name cannot be empty
- Amount must be greater than zero

---

📋 Expense History Table

All expenses are displayed in a structured table with:

Field| Description
Name| Expense description
Category| Expense type
Amount| Money spent
Date| Date of transaction
Action| Delete button

Table Features

- Hover highlight effect
- Category color badges
- Smooth row animation when a new expense is added
- Responsive layout

---

🗑 Delete Expense

Each row includes a Delete button.

When clicked:

- The expense is removed from the table
- The total expense updates automatically
- The chart updates instantly
- Data is saved back to Local Storage

---

🔎 Category Filter

Users can filter expenses by category.

Example:

- Show only Food expenses
- Show only Transport expenses
- Show All expenses

The dropdown visually highlights the selected category.

---

📈 Expense Chart

The dashboard includes a dynamic doughnut chart powered by Chart.js.

The chart shows spending distribution by category.

Example:

Food → 40%
Shopping → 25%
Transport → 20%

The chart updates automatically when:

- Expenses are added
- Expenses are deleted

---

💾 Local Storage Persistence

All expense data is stored in browser LocalStorage.

This means:

- Data remains after page refresh
- Data is restored when the user revisits the page
- No backend or database is required

---

📥 Export to CSV

Users can export all expenses as a CSV file.

The exported file contains:

Name,Category,Amount,Date
Lunch,Food,250,2026-03-12
Bus Ticket,Transport,50,2026-03-12

This allows users to open their expenses in:

- Excel
- Google Sheets
- Spreadsheet software

---

🌙 Dark Mode

The application includes a Dark Mode toggle.

Features:

- Toggle between Light and Dark themes
- Theme preference is saved in LocalStorage
- Automatically restores when the page reloads

---

✨ UI / UX Features

The interface is designed with a modern dashboard style.

Design Elements

- Gradient background
- Glassmorphism cards
- Rounded components
- Soft shadows
- Responsive layout

Animations

- Card hover lift effect
- Button hover glow
- Smooth row fade-in animation
- Animated number counters

These effects create a professional and interactive user experience.

---

🛠 Technologies Used

Technology| Purpose
HTML5| Application structure
TailwindCSS| Styling and responsive design
Vanilla JavaScript| Application logic
Chart.js| Expense visualization
LocalStorage API| Data persistence

---

📂 Project Structure

project/
│
├── index.html
├── script.js
└── README.md

index.html

Contains the application layout including:

- Dashboard cards
- Expense form
- Expense table
- Chart section
- UI components

script.js

Handles:

- Expense management
- LocalStorage operations
- Chart updates
- Filtering logic
- UI interactions
- Dark mode functionality

---

▶️ How to Run the Project

1. Download or clone the repository

git clone https://github.com/yourusername/smart-expense-tracker.git

2. Open the project folder

3. Open index.html in your browser

No installation or backend setup is required.

---

📱 Responsive Design

The application works across multiple devices:

- Desktop
- Tablet
- Mobile

TailwindCSS responsive utilities ensure a smooth experience on different screen sizes.

---

📊 Example Workflow

1. Add an expense (e.g., Lunch ₹250)
2. The expense appears in the table
3. Dashboard totals update automatically
4. The chart updates to reflect the new spending category
5. Data is saved in LocalStorage
6. Page refresh keeps all data intact

---

🔮 Future Improvements

Possible enhancements for future versions:

- Monthly expense reports
- Budget limit notifications
- Category editing
- Search functionality
- Expense editing feature
- Advanced analytics dashboard

---

👨‍💻 Author

Developed as a frontend project to demonstrate UI design, JavaScript logic, and data visualization skills.

---
