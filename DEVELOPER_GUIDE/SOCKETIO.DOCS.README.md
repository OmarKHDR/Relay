# Socket.IO Guide

## Purpose

Socket.IO is used for real-time communication between the server and frontend clients. Authentication is intentionally out of scope for the current prototype checkpoint.

Relay was built from the larger SANAD graduation project server at [github.com/sanadChair/server](https://github.com/sanadChair/server). The current framework keeps WebSocket support, but the first stable ROS-HTTP checkpoint is focused mainly on HTTP routes, ROS topics, and ROS services.

## Server Structure

`src/core/websocketServer.ts` owns the Socket.IO server.

The server:

- Creates one Socket.IO instance on top of the HTTP server.
- Registers callback groups from `CallbackRegistry`.
- Separates publish, subscribe, and broadcast callback lists.
- Logs connection, disconnect, and socket errors.

## Callback Registry Shape

WebSocket callbacks are registered through module-level callback registries and collected in `src/core/registry.ts`.

Use event names with a domain prefix:

```text
robot:status
robot:velocity
wheelchair:velocity
sensor:distance
```

This is simpler than rooms for the current project stage.

## Client Example

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5051');

socket.emit('robot:velocity', {
    linear: 0.5,
    angular: 0.1,
});

socket.on('robot:status', data => {
    console.log(data);
});
```

## Event Payloads

Prefer plain JSON payloads with a `meta` object when useful:

```json
{
  "linear": 0.5,
  "angular": 0.1,
  "meta": {
    "timestamp": "2026-05-28T12:00:00.000Z",
    "source": "socket"
  }
}
```

Error events should use a predictable shape:

```json
{
  "type": "ROS_UNAVAILABLE",
  "message": "ROS communication is not ready"
}
```

## Relationship To ROS

WebSocket callbacks may publish to ROS or broadcast ROS-derived state, but ROS lifecycle management still belongs to the core ROS layer:

- Use `RosStateManager` for registered ROS route communication.
- Use `RosExecuter` for building ROSLIB objects.
- Do not duplicate rosbridge reconnect logic inside WebSocket modules unless there is a specific lifecycle object that cannot be represented by the route registry yet.

## Naming Conventions

- Use lowercase event domains.
- Use `domain:event` naming.
- Keep event names stable once a frontend depends on them.
- Prefer `robot:status` over generic names like `status`.

## Logging

Use the shared logger:

```ts
logger.info(`[WEBSOCKET SERVER] Socket Connected: ${socket.id}`);
logger.warn('[RobotSocket] failed to publish velocity');
```
