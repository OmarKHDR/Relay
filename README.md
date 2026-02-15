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
install and run `rosbridge` it should be running for the server to work as expected

## API documentations
Running the server will open an api docs endpoint at
`http://host:port/api/v1/docs`


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

## File Structure (High Level)
- **/src/lib/** – Core infrastructure (e.g. ROS bridge connection, shared helpers)
- **/src/api/v1/** – Versioned REST API, organized by **feature modules** (pose, map, goal, wheelchair, ultrasonic, servo, etc.).  
  Each module typically contains:
  - a controller (`*.controller.js`) for HTTP handlers
  - an optional service (`*.service.js`) for business logic
  - an optional `ros/` subfolder for ROS topics/actions/services
  - a module definition (`*.module.js`) that plugs the feature into the app
  - a `routes.js` file that defines Express routes
  - a `swagger.yaml` file that documents the API
- **/src/middlewares/** – Express middleware (auth, validation, etc.)
- **/src/utils/** – Shared utilities (logger, timestamps, etc.)
- **/src/servers/** – HTTP and WebSocket server bootstrap and wiring  
  - Express server, WebSocket server, router registry, callback registry, and a single composed server
- **/src/index.js** – Main entry point that starts the server
- **/test/** – (reserved) WebSocket and API unit tests

## Testing the Nav2 / ROS Setup
To quickly spin up and test the Nav2 + ROS2 integration used by the `goal` module, you can use the helper script in the project root:

```bash
# From the repository root
./nav2_setup.sh
```

This script is meant as a convenience for local development and testing; check the script body and comments for details and assumptions about your ROS2 environment.


## Contributing

There is a dedicated contribution guide under the `DEVELOPER_GUIDE/` directory that explains conventions, workflows, and examples in more detail. In short:

1. Fork the repository and create a feature branch.
2. Read the docs in `DEVELOPER_GUIDE/` (especially module structure and coding standards).
3. Implement and test your changes.
4. Commit with clear messages, push your branch, and open a Pull Request.

### Adding a New Module (High Level)
To add a new feature module under `src/api/v1`:

1. **Create a folder**: `src/api/v1/<feature>/`
2. **Add core files**:
   - `routes.js` – defines Express routes for the feature
   - `<feature>.controller.js` – request handlers
   - (optional) `<feature>.service.js` – shared business logic
   - (optional) `ros/` – ROS topics/actions/services for this feature
   - `swagger.yaml` – API documentation for the module
3. **Register the module**:
   - Create `<feature>.module.js` that exports `{ routers: [router], WSCallback: [...] }`
   - Add the module to `RouterRegistry` / `CallbackRegistry` so its routes and WebSocket callbacks are picked up.
4. **Document and test**:
   - Update or add Swagger definitions in `swagger.yaml`
   - Add or update tests under `test/` when relevant


## Notes
- use utilities logger instead of console.log for better logging



## Contact
For any queries or support, please contact the development team.