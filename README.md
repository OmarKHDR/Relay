# SANAD Server

## Overview
This repository contains the backend server developed as part of a larger graduation project. Other project components (ROS, frontend, hardware) are maintained separately.
This server acts as a middleware between ROS (Robot Operating System) and other system components through RESTful APIs. It facilitates communication between the mobile application, web interface, and ROS-powered robot using rosbridge.

## Prerequisites
- Node.js (v16 or higher)
- npm (Node Package Manager)
- roslibjs
- ROS2
- rosbridge_suite
- A running ROSBridge WebSocket server

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to server directory
cd server

# Install dependencies
npm install
```

## Configuration
Create a `.env` file in the root directory like the one in .env.example


## Features
- WebSocket connection to ROSBridge
- RESTful API endpoints for:
  - Robot control commands
  - Sensor data retrieval
  - Navigation controls
  - Status monitoring
  - User authentication
---
## Core feature Vs Modularity allowance
instead of just having tightly coupled system endpoints we need to use more abstract approach, but still core system modules need to be implemented first for more convinient usage,
### Core System modules:
- ultrasonic for distnaces
- motors for wheelchair movements
- servo motor (for testing till now)


### Abstract system modules
- system don't need to know which module is sending the distance so instead of sending to `ultrasonic` topic we would publish to `distance/direction`
- instead of controlling the whole wheelchair movements, we can control only one motor for extending more moving parts in the system so it will be `motor/:id`
- and so on...

## General Response Structure
```javascript
//for success
{
  "status": "success",
  "data": [], // always an array
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

//for failures (errors, authorization, authentication, other)
{
  "status": "fail",
  "error": {
    "code": "AUTH_INVALID_TOKEN",
    "type": "AuthenticationError",
    "message": "The provided token is invalid or expired"
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

## Usage

```bash
# Development mode
npm run dev

#testing
npm run test

# Production mode
npm start
```


## Error Handling
- All API endpoints include proper error handling
- WebSocket connection failures should be automatically handled with reconnection attempts
- Invalid requests should return appropriate HTTP status codes and error messages

## Security - not now
- API authentication using JWT tokens
- Rate limiting to prevent abuse
- Input validation for all endpoints

## File Structure
- **/src/lib/** - Core business logic, ROS bridge connection
- **/src/api/v1/** - All modules, each module is separated in a feature based instead of past layered arch
- **/src/middlewares/** - Express.js middleware functions for auth, validation, etc.
- **/src/utils/** - Helper functions and utility modules used across the application like loggers and other things
- **/src/websocketServer.js** - a file where we create a websocket initializer that uses singleton pattern and the initialization injects the callback and events on connection
- **/src/expressServer.js** - a file where we create the express server and use the router to be separated from the websocket and the entrypoint file so we can import it in the unit test separately
- **/src/wsInit.js** - initializing the websocket by adding the controllers that will register events later on connection, and it integrates the websocket controllers and the websocket class wrapper and the http wrapper of express server
- **/src/index.js** - the entry point where the server can listen on the port
- **/test/** - all websockets and api unit tests


## Contributing
1. Fork the repository
2. Create your feature branch
3. Follow guide in DEVELOPER_GUIDE directory
4. Commit your changes
5. Push to the branch
6. Create a Pull Request


## Notes
- use utilities logger instead of console.log for better logging



## Contact
For any queries or support, please contact the development team.