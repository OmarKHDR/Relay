# SANAD Server

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

### Robot Control
- `POST /api/robot/move` - Control robot movement
- `POST /api/robot/stop` - Emergency stop
- `GET /api/robot/status` - Get robot status

### Navigation - not now
- `POST /api/navigation/setGoal` - Set navigation goal
- `GET /api/navigation/currentPose` - Get current robot position
- `GET /api/navigation/map` - Get current map data

### Sensor Data
- `GET /api/sensors/ultrasonic` - Get ultrasonic data

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

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## File Structure
- **lib/** - Core business logic, ROS bridge integration, and database models
- **api/v1/** - REST API endpoints and controllers for the first version
- **middlewares/** - Express.js middleware functions for auth, validation, etc.
- **utils/** - Helper functions and utility modules used across the application like loggers and other things
## Notes
- use utilities logger instead of console.log for better logging



## Contact
For any queries or support, please contact the development team.