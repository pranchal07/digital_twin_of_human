# Digital Twin - Frontend

## Web Interface for Student Health Tracking

This is the frontend web interface built with vanilla HTML, CSS, and JavaScript.

## Features

- User authentication (login/signup)
- Health data entry forms
- Interactive dashboard with charts
- Analytics and insights
- Profile management
- Responsive design

## Setup

1. Ensure backend is running at http://localhost:8000
2. Start a web server in this directory:
   ```
   python -m http.server 5500
   ```
3. Open http://localhost:5500 in your browser

## Files

- **index.html** - Landing page
- **dashboard.html** - Main dashboard
- **manual-entry.html** - Data entry form
- **profile.html** - User profile
- **analytics.html** - Analytics page
- **about.html** - About page

### JavaScript
- **api-config.js** - Backend API connection (IMPORTANT!)
- **main.js** - Main application logic
- **dashboard.js** - Dashboard functionality
- **forms.js** - Form handling
- **data-manager.js** - Data management
- **theme-manager.js** - Theme switching

### CSS
- **styles.css** - Main styles
- **dashboard.css** - Dashboard styles
- **components.css** - Component styles
- **forms.css** - Form styles
- **charts.css** - Chart styles
- **responsive.css** - Responsive design

## Important

The **api-config.js** file connects the frontend to the backend API. 
If your backend runs on a different port, update the BASE_URL in this file.

## Usage

1. Create an account on the landing page
2. Login with your credentials
3. Go to "Data Entry" to add health data
4. View your data on the "Dashboard"
5. Check "Analytics" for insights
6. Manage your profile in "Profile" page

Enjoy!
