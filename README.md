# SANAD Server

## Overview
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

## API Endpoints

### motor control
- `POST /api/motor/:id` - control motor speed and angle
- `GET /api/motor/` - get all motors speed and angles
- `GET /api/motor/:id` - get a specific motor speed and angle

### Req/Res Structure
```javascript
//request: POST /api/motor/:id
//request body:
{
  angle: Number; //for now restricted to 0, 90, 180, 270
  speed: Number; // const for now to simplify system
}

//response:
{
  "status": "success",
  "data": {},
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}


//request: GET /api/motor/

//response:
{
  "status": "success",
  "data": {
    "id1": {
      "name": "left motor",
      "speed": Number,
      "angle": Number
    },
    "id2": {
      "name": "right motor",
      "speed": Number,
      "angle": Number
    }
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

//request: GET /api/motor/:id

//response:
{
  "status": "success",
  "data": {
    "id1": {
      "name": "left motor",
      "speed": Number,
      "angle": Number
    }
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```
### Sensor Data
- `GET /api/sensors/ultrasonic/` - Get all ultrasonics data
- `GET /api/sensors/ultrasonic/:id` - Get ultrasonic data

### Req/Res Structure
```javascript
//request: GET /api/sensors/ultrasonic/
//response:
{
  "status": "success",
  "data": {
    "id1": {
      "name": "left motor",
      "distance": Number,
      ...
    },
    "id2": {
      "name": "right motor"
      "distance": Number,
    },
    ...
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

//request: GET /api/sensors/ultrasonic/:id
//response:
{
  "status": "success",
  "data": {
    "id": {
      "name": "left motor",
      "distance": Number,
      ...
    },
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

## General Response Structure
```javascript
//for success
{
  "status": "success",
  "data": {
    ...
  },
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
- **lib/** - Core business logic, ROS bridge integration, and database models
- **api/v1/** - REST API endpoints and controllers for the first version
- **middlewares/** - Express.js middleware functions for auth, validation, etc.
- **utils/** - Helper functions and utility modules used across the application like loggers and other things

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request


## Notes
- use utilities logger instead of console.log for better logging



## Contact
For any queries or support, please contact the development team.