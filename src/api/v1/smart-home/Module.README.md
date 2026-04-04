Absolutely — here is a clearer, enhanced version of your README with the **same system behavior and specifications**.

````markdown
# Smart Home Module — Interface Between Hardware and Users

This module is a **stateful service** that interfaces with the current design in [Smart Modules](https://github.com/sanadChair/Smart-Home-Light).

## Capabilities

The system works as follows:

- Sends a UDP broadcast to all devices on the network using port `9999`.
- All devices listen for this UDP packet and respond with:
  - required metadata
  - current local IP address
- The Smart Home module stores all received device responses in an **in-memory object**.
- This object is treated as the **current source of truth** for connected devices.
- The frontend can mark previously discovered devices as disconnected if they are no longer discovered.
- Each device has a unique, permanent ID, making disconnect detection reliable.
- After discovery, the system can monitor and control each device using its stored data.

## Available Endpoints

The module exposes three endpoints:

- `/info`  
  Returns module information such as ID, name, and components  
  (same as the one retrieved during the network-wide broadcast discovery).

- `/status`  
  Returns the current state of the device components.

- `/control`  
  Updates/changes the state of the system.
````