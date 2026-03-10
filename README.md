<h1 align="center">Racetrack Info-Screens</h1>

<p align="center"><em>Real-time race management</em></p>

---

## Overview

A complete real-time race management built with Node.js and Socket.IO. Manage races, track lap times, control safety flags, and inform spectators with synchronized displays across multiple screens.

## ✨ Features

- **Real-time Updates** - All displays sync instantly via WebSocket
- **Race Management** - Configure sessions, assign drivers, start/stop races
- **Live Lap Timing** - Record and display lap times with millisecond precision
- **Dynamic Leaderboard** - Real-time standings sorted by fastest lap
- **Safety Flag System** - Control race modes (Safe/Hazard/Danger/Finish) across all displays
- **Secure Access** - Role-based authentication for employee interfaces
- **Data Persistence** - Sessions survive server restarts with SQLite

## 🏗️ Built With

- **Backend**: Node.js + Express
- **Real-time**: Socket.IO
- **Database**: SQLite (better-sqlite3)
- **Frontend**: Vanilla JavaScript + Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js v14 or higher
- npm v6 or higher

### Installation

1. **Clone the repository**

   ```bash
   git clone https://gitea.kood.tech/hugojohandimaria/info-screens
   cd info-screens
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set environment variables** (required)

   ```bash
   export RECEPTIONIST_KEY=your_receptionist_key
   export SAFETY_KEY=your_safety_key
   export OBSERVER_KEY=your_observer_key
   ```

   Example:

   ```bash
   export RECEPTIONIST_KEY=8ded6076
   export SAFETY_KEY=a2d393bc
   export OBSERVER_KEY=662e0f6c
   ```

4. **Start the server**

   Production mode (10-minute races):

   ```bash
   npm start
   ```

   Development mode (1-minute races):

   ```bash
   npm run dev
   ```

The server will be running at `http://localhost:3000`

## 📁 Project Structure

```
racetrack-info-screens/
├── public/                # Frontend
│   ├── js/                # Client-side scripts
│   └── *.html             # Interface pages
├── server/                # Backend
│   ├── index.js           # Server setup
│   ├── auth.js            # Authentication
│   ├── socket-events.js   # Socket.IO handlers
│   ├── state.js           # Race state management
│   ├── timer.js           # Race timer
│   ├── stopwatch.js       # Lap timing
│   └── data.js            # Database operations
├── sessions.db            # SQLite database (auto-generated)
└── README.md
```

## 📖 User Guide

### System Interfaces

**Employee Interfaces** (password-protected):

| Route               | User            | Purpose                    |
| ------------------- | --------------- | -------------------------- |
| `/front-desk`       | Receptionist    | Configure race sessions    |
| `/race-control`     | Safety Official | Start races, control flags |
| `/lap-line-tracker` | Lap Observer    | Record lap times           |

**Public Displays** (no password):

| Route             | Audience   | Purpose                  |
| ----------------- | ---------- | ------------------------ |
| `/leader-board`   | Spectators | Live race standings      |
| `/next-race`      | Drivers    | Upcoming race info       |
| `/race-countdown` | Drivers    | Race timer               |
| `/race-flags`     | Drivers    | Full-screen flag display |

### Quick Workflow

1. **Front Desk** - Create a race session and add drivers (max 8)
2. **Race Control** - Start the race when drivers are ready
3. **Lap Tracker** - Press car buttons as they cross the lap line
4. **Leaderboard** - Displays update in real-time for spectators
5. **Race Control** - Change flags (Safe/Hazard/Danger) as needed
6. **Race Control** - End session when race finishes and cars return to pit

### Detailed Interface Guides

#### Front Desk (`/front-desk`)

**Purpose**: Configure and manage race sessions

**Key Actions**:

- Create new sessions with up to 8 drivers
- Edit driver lists (comma-separated names must be unique)
- Delete sessions that haven't started
- Remove individual drivers from sessions

**Note**: Only sessions in "next-race" or "pending" state can be edited.

#### Race Control (`/race-control`)

**Purpose**: Start races and control safety flags

**Race Modes**:

- **Safe** (Green) - Normal racing
- **Hazard** (Yellow) - Caution, slow down
- **Danger** (Red) - Stop racing immediately
- **Finish** (Checkered) - Return to pit lane

**Key Actions**:

- Start race (begins 10-minute countdown)
- Change race mode during race
- Manually finish race early
- End session (removes it from system, queues next race)

#### Lap Tracker (`/lap-line-tracker`)

**Purpose**: Record lap times as cars cross the lap line

**How It Works**:

- Large buttons (1-8) for each car
- First tap starts the stopwatch
- Subsequent taps record lap times and update fastest lap
- Buttons disabled when race ends
- Works in portrait or landscape mode

#### Leaderboard (`/leader-board`)

**Purpose**: Display live race standings to spectators

**Shows**:

- Position (sorted by fastest lap)
- Car number and driver name
- Fastest lap time (MM:SS.mmm format)
- Total laps completed
- Race timer and current flag status

**Features**: Fullscreen mode, real-time updates, shows last race after finish

#### Other Public Displays

- **Next Race** (`/next-race`) - Shows upcoming drivers and car assignments
- **Race Countdown** (`/race-countdown`) - Large timer for paddock area
- **Race Flags** (`/race-flags`) - Full-screen flag displays around circuit
