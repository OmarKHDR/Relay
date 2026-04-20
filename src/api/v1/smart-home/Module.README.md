# Smart Home Module

The Smart Home module is responsible for device discovery (UDP broadcasting), HTTP REST APIs for interacting with smart home devices, and maintaining communication with a Robot Operating System (ROS) environment.

## Architecture & Workflow

The architecture strictly follows the separation of concerns:
### 1. HTTP Interface (`smart-home.controller.js`)
Exposes REST endpoints to list devices, get their status, change state (control), and register/update/delete records securely. Controllers should strictly interface with the service, never directly with the database or caches. Error handling parses requests and handles HTTP response framing.

### 2. ROS Interface (`ros/smart-home.ros.service.js` & `ros/smart-home.ros.topic.js`)
Hooks into the ROS environment via `roslib.js`. It mimics endpoints by keeping internal ROS services analogous to typical API endpoints (e.g. `getAllDevices`, `discover`, `control`). Errors are parsed to boolean flags within the response payload.

All state discrepancies and real-time device updates (e.g., location changes, deletions, new device availability on network) are dispatched asynchronously to ROS via topics (configured in `smart-home.ros.topic.js`).

### 3. Business Service Layer (`smart-home.service.js`)
Acts as the intermediary and brain. Both HTTP controllers and ROS Services push their commands to the service layer. The service layer interacts with the Device UDP discoverer, validates commands, updates the database if required, updates the in-memory dictionary, and publishes the necessary `/device` topic events across ROS.

### 4. Data Layer (`smart-home.db.js`)
Only accessed by `smart-home.service.js` to persist changes. Uses a local JSON store. No business rules are managed here.