OmarKHDR: create the readme for the server that interfaces rosbridge with the other system components like mobile app 

Workspace: Permission Request
[object Object]

OmarKHDR: @workspace Grant: "Permission Request"

Workspace: Collecting workspace informationFiltering to most relevant information

OmarKHDR: give me node gitignore

GitHub Copilot: I'll help you create a comprehensive .gitignore file for a Node.js project. I'll include the most common patterns that should be ignored in a Node.js application.

````text
# Dependencies
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
coverage/

# IDE specific files
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity
````

This .gitignore file:
- Ignores node_modules and package manager files
- Excludes environment variable files
- Ignores build and distribution directories
- Excludes IDE specific files
- Ignores logs and runtime data
- Excludes npm and yarn specific cache files

You can place this file in the root of your Node.js project directory.

OmarKHDR: give me readme for the project that connect between the rosbridge and all other system using a server with restful api

GitHub Copilot: # SANAD Server

## Overview
This server acts as a middleware between ROS (Robot Operating System) and other system components through RESTful APIs. It facilitates communication between the mobile application, web interface, and ROS-powered robot using rosbridge.

## Prerequisites
- Node.js (v16 or higher)
- npm (Node Package Manager)
- ROS Noetic
- rosbridge_suite
- A running ROSBridge WebSocket server

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to server directory
cd SANAD_Server/server

# Install dependencies
npm install
```

## Configuration
Create a `.env` file in the root directory:

````text
PORT=3000
ROSBRIDGE_URL=ws://localhost:9090
```

## Features
- WebSocket connection to ROSBridge
- RESTful API endpoints for:
  - Robot control commands
  - Sensor data retrieval
  - Navigation controls
  - Status monitoring
  - User authentication

## API Endpoints

### Robot Control
- `POST /api/robot/move` - Control robot movement
- `POST /api/robot/stop` - Emergency stop
- `GET /api/robot/status` - Get robot status

### Navigation
- `POST /api/navigation/setGoal` - Set navigation goal
- `GET /api/navigation/currentPose` - Get current robot position
- `GET /api/navigation/map` - Get current map data

### Sensor Data
- `GET /api/sensors/laser` - Get laser scan data
- `GET /api/sensors/camera` - Get camera feed

## Usage

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## ROS Topics
The server subscribes to and publishes on the following ROS topics:
- `/cmd_vel` - Robot velocity commands
- `/amcl_pose` - Robot pose estimation
- `/map` - Map data
- `/scan` - Laser scan data

## Error Handling
- All API endpoints include proper error handling
- WebSocket connection failures are automatically handled with reconnection attempts
- Invalid requests return appropriate HTTP status codes and error messages

## Security
- API authentication using JWT tokens
- Rate limiting to prevent abuse
- Input validation for all endpoints

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.

## Contact
For any queries or support, please contact the development team.// filepath: /home/omark/SANAD_Server/server/.env
PORT=3000
ROSBRIDGE_URL=ws://localhost:9090
```

## Features
- WebSocket connection to ROSBridge
- RESTful API endpoints for:
  - Robot control commands
  - Sensor data retrieval
  - Navigation controls
  - Status monitoring
  - User authentication

## API Endpoints

### Robot Control
- `POST /api/chair/move` - Control robot movement
- `POST /api/chair/stop` - Emergency stop
- `GET /api/chair/status` - Get robot status

### Navigation - not now
- `POST /api/navigation/setGoal` - Set navigation goal
- `GET /api/navigation/currentPose` - Get current robot position
- `GET /api/navigation/map` - Get current map data

### Sensor Data
- `GET /api/sensors/ultrasonic` - Get laser scan data

## Usage

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## ROS Topics
The server subscribes to and publishes on the following ROS topics:
Still not decided

## Error Handling
- All API endpoints include proper error handling
- WebSocket connection failures are automatically handled with reconnection attempts
- Invalid requests return appropriate HTTP status codes and error messages

## Security
- API authentication using JWT tokens
- Rate limiting to prevent abuse
- Input validation for all endpoints

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
## FILES Structure

- **lib/** - Core business logic, ROS bridge integration, and database models
- **api/v1/** - REST API endpoints and controllers for the first version
- **middlewares/** - Express.js middleware functions for auth, validation, etc.
- **utils/** - Helper functions and utility modules used across the application like loggers and other things

## use utilities logger instead of console.log for better logging


## License
This project is licensed under the MIT License.

## Contact
For any queries or support, please contact the development team.