
# ROS Logging Guide

## Purpose
Show consistent logging for ROS connection and topic handlers.

---

## Structure

### 1. Connection Handler (`connection.js`)

```text
[ROS-CONNECTION] Connected to rosbridge at ws://localhost:9090
[ROS-CONNECTION] Connection closed
[ROS-CONNECTION] Error: <error message>
[ROS-CONNECTION] Retrying in 3s
````

### 2. Topic Handlers (`ServoMotor`, etc.)

```text
[ServoMotor] Initializing topic handler
[ServoMotor] Topic created: /servo_angle (std_msgs/UInt8)
[ServoMotor] Published angle: 90
[ServoMotor] ROS not connected, message skipped
[ServoMotor] Reconnected, topic reinitialized
```

---

## Conventions

* Always prefix logs with `[Component]` (module or class name)
* Use proper log levels:

  * `info` → normal operations
  * `warn` → recoverable issues
  * `error` → critical problems
* Log concise, single-line messages
* Include relevant data (topic, payload) in message

```
