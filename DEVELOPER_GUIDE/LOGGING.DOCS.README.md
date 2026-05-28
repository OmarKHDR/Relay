# Logging Guide

## Purpose

Keep framework and module logs readable while debugging HTTP, WebSocket, and ROS behavior.

Relay was built from the larger SANAD graduation project server at [github.com/sanadChair/server](https://github.com/sanadChair/server). The logging style should stay practical for robotics development: concise, timestamped, and useful during ROS reconnects.

## Logger

Use the shared logger from `@/utils/logger.js`.

```ts
import logger from '@/utils/logger.js';

logger.info('[RobotService] status service called');
logger.warn('[ROS STATE MANAGER] failed to rebuild ros object for key: GET:/api/v1/robot/status');
logger.error('[ROS-CONNECTION] ROS error: connection refused');
```

Avoid `console.log` in framework code. Temporary local debugging is fine, but remove it before committing.

## Prefixes

Use a short component prefix:

```text
[ROS-CONNECTION]
[ROS STATE MANAGER]
[EXPRESS SERVER]
[WEBSOCKET SERVER]
[RobotService]
```

Good logs:

```text
[ROS-CONNECTION] Connected to rosbridge at ws://localhost:9090
[ROS-CONNECTION] Retrying in 2s
[ROS STATE MANAGER] rebuilt ros object for key: GET:/api/v1/robot/status
[EXPRESS SERVER] initializing: GET /robot/status
```

## Levels

- `info`: normal lifecycle events, route mounting, successful reconnects.
- `warn`: recoverable failures, missing optional state, retryable ROS issues.
- `error`: unexpected failures that should be investigated.

## ROS Reconnect Logs

Reconnect logging should make the lifecycle clear:

```text
[ROS-CONNECTION] Connection to rosbridge closed
[ROS-CONNECTION] Retrying in 2s
[ROS-CONNECTION] Connected to rosbridge at ws://localhost:9090
[ROS STATE MANAGER] rebuilt ros object for key: GET:/api/v1/robot/status
```

Do not log a full message payload by default for high-frequency topics. Log topic names and selected fields unless the module is explicitly in debug mode.

## Route Logs

When adding framework logs around routes, include method and path:

```text
[EXPRESS SERVER] initializing: GET /robot/status
[EXPRESS SERVER] mounting ros object to the route: /api/v1/robot/status
```

## Module Logs

Feature modules should use their service or domain name:

```ts
logger.info('[RobotService] requested robot status');
logger.warn('[RobotService] expected service client mount');
```
