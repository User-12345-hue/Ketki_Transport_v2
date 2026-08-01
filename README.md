# FleetWatch Pro

{

  "project_name": "FuelFlow Pro - Phase 1 (Fleet Tracker)",

  "project_purpose": "Serve as a streamlined Phase 1 tracking system for Indian transport owners to strictly monitor the IN (arrival at godown/yard) and OUT (dispatch to trip) status of their trucks.",

  "role_instruction": "Act as an expert full-stack developer specializing in frontend UI/UX and Supabase backend integration.",

  "tech_stack": {

    "frontend": "HTML, CSS (Tailwind/Bootstrap), JavaScript",

    "backend": "Supabase (PostgreSQL, Auth, and Realtime Subscriptions)"

  },

  "design_system": {

    "primary_dark": "Deep corporate Blue (#0A2540) for header and navigation",

    "accent_color": "Vibrant Sky Blue (#0066FF) for primary CTAs and active states",

    "surface_color": "Crisp White (#FFFFFF) card-based UI panels for truck data",

    "background_color": "Very pale Ice-Blue or Off-White background (#F5F8FA) for contrast",

    "typography": "Clean, highly legible sans-serif for quick status scanning by fleet owners"

  },

  "website_structure": {

    "authentication": {

      "login.html": "Simple, secure login screen connected to Supabase Auth. Option for mobile number (OTP) or email login."

    },

    "admin_dashboard": {

      "dashboard.html": "Central 'Control Tower' workspace focusing entirely on live fleet presence.",

      "top_bar": "Page title, real-time clock (IST), and a quick search bar to look up specific truck numbers (e.g., MH-12-AB-1234).",

      "kpi_cards": "Live metrics fetched from Supabase: Total Trucks, Currently IN (At Yard/Godown), Currently OUT (On Road).",

      "status_board": "Two main split columns or a Kanban-style board showing 'Trucks IN' vs 'Trucks OUT'.",

      "tables": "Recent Activity Log table showing Truck No, Driver Name, Action (IN/OUT), and Timestamp."

    },

    "management_modules": [

      "trucks.html - Basic truck directory (RTO Number, Driver assigned, Current Status).",

      "entry_exit.html - A dedicated interface for the gatekeeper/owner to quickly toggle a truck's status (Mark IN / Mark OUT) with a timestamp."

    ]

  },

  "database_schema_requirements": {

    "trucks_table": "Columns: id, vehicle_number (e.g., UP-16-CD-5678), capacity, status (IN/OUT).",

    "logs_table": "Columns: id, vehicle_id, action (IN/OUT), timestamp, location_note (e.g., 'Left for Mumbai', 'Arrived from Pune')."

  },

  "interactivity_requirements": [

    "One-click 'Mark IN' and 'Mark OUT' buttons that instantly update the Supabase database.",

    "Supabase Realtime integration so the dashboard updates instantly without refreshing when a truck enters or leaves.",

    "Color-coded status tags (Blue for IN, White/Outlined for OUT).",

    "Search filtering to instantly find a truck by its Indian number plate format."

  ]

}

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d2e53cfb-4470-4f7d-90eb-80b330a466ba).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
