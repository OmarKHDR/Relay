# Relay

## Overview

Relay is a ROS-HTTP framework prototype for exposing ROS2 topics and services through a Node.js HTTP and WebSocket server.

This repository comes from a larger graduation project. The original project server lives at [github.com/sanadChair/server](https://github.com/sanadChair/server), and this framework was built on top of that server codebase. Other project components such as ROS nodes, frontend applications, and hardware are maintained separately.

The current goal is a first stable checkpoint: a small, understandable framework that lets contributors define HTTP routes, attach ROS topic/service communication to those routes, and handle rosbridge reconnects without rewriting every module.

Actions are intentionally not part of the first checkpoint. The current focus is topics and services.

## What It Does

- Starts one Express HTTP server and one Socket.IO server.
- Connects to ROS through `rosbridge_suite` using `roslib`.
- Lets modules declare HTTP routes under `src/api/v1`.
- Lets each route optionally declare a ROS topic or service config.
- Injects the matching ROS mount into `req.ros` at request time.
- Rebuilds registered ROS communication objects when rosbridge reconnects.
- Wraps controllers in a shared response/error wrapper.
- Exposes Swagger docs at `/api/v1/docs`.

## Architecture

```text
src/index.ts
  -> Server
     -> ExpressServer
        -> route registry
        -> validation middleware
        -> ROS injector middleware
        -> controller wrapper
     -> WebsocketServer
     -> RosConnection
     -> RosStateManager
        -> RosExecuter
```

Important files:

- `src/core/server.ts` composes Express, HTTP, WebSocket, DB initialization, and module registration.
- `src/core/expressServer.ts` mounts routes, middleware, ROS injection, and controllers.
- `src/lib/ros/connection.js` owns the rosbridge connection and reconnect event.
- `src/core/rosStateManager.ts` stores route ROS configs and rebuilds ROS objects after reconnect.
- `src/core/rosExecuter.ts` builds ROSLIB topic/service objects from framework config.
- `src/core/types/Ros.types.ts` defines ROS configs and injected mount types.
- `src/middleware/rosInjector.middleware.ts` injects the current ROS mount into `req.ros`.

## Requirements

- Node.js 20 or newer is recommended.
- npm
- ROS2
- `rosbridge_suite`
- A running rosbridge WebSocket server, usually `ws://localhost:9090`

## Installation

```bash
git clone <repository-url>
cd Relay
npm install
```

Create a `.env` file based on `.env.example` if present.

Common environment variables:

```bash
SERVER_PORT=5051
SERVER_HOSTNAME=localhost
ROSBRIDGE_HOST=localhost
ROSBRIDGE_PORT=9090
```

## Usage

```bash
npm run dev
npm run typecheck
npm run build
npm start
```

`npm run dev` uses `tsx` to run `src/index.ts` directly. `npm run build` compiles TypeScript and rewrites path aliases for output.

## Path Aliases

This project uses TypeScript path aliases with `@`:

```ts
import Server from '@/core/server.js';
import logger from '@/utils/logger.js';
```

Use `@/...` for source imports instead of the older `#core`, `#utils`, `#src`, or `#lib` aliases.

## ROS Route Model

A module route can include a `ROS` config:

```ts
{
    name: 'get status',
    description: 'get robot status',
    method: HTTPMethod.GET,
    path: '/status',
    controller: RobotController.getStatus,
    ROS: {
        ROSType: ROSType.ServiceClient,
        name: '/sanad_interfaces/RobotStatus',
        serviceType: 'sanad_interfaces/srv/RobotStatus',
    },
}
```

The route is mounted once by Express. The ROS config is registered in `RosStateManager`. At request time, `rosInjector` resolves the current ROS mount by key and assigns it to `req.ros`.

For a service client:

```ts
const request = ros.request({});
const response = await ros.service(request);
```

For a topic publisher:

```ts
const message = ros.message(payload);
ros.topic.publish(message);
```

Use the `kind` discriminator before accessing type-specific APIs:

```ts
if (ros.kind !== ROSType.ServiceClient) {
    throw new Error(`Expected service client, received ${ros.kind}`);
}
```

## Reconnect Behavior

Express routes and middleware are mounted once. They are not rebuilt on ROS reconnect.

Instead, `RosStateManager` listens for `ros_reconnected`, rebuilds registered ROS objects through `RosExecuter`, and keeps the injection layer stable. This keeps HTTP routing separate from ROS lifecycle management.

## First Stable Checkpoint

The intended first stable checkpoint is:

- HTTP server boots with a clear module registry.
- Service client routes can call ROS services and return responses.
- Topic publisher routes can publish request payloads.
- Topic subscriber and service server lifecycle objects can be registered.
- ROS reconnect rebuilds registered communication objects.
- TypeScript path aliases and typecheck work.
- One robot status service route is present as the example module.
- Documentation explains how to add a module.

## Response Shape

Controllers are wrapped by the shared controller wrapper. Successful responses currently follow:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-05-28T12:00:00.000Z"
  }
}
```

Errors are passed to the global error handler.

## File Structure

```text
src/
  api/v1/              feature modules
  core/                framework core
  core/types/          shared framework types
  lib/ros/             rosbridge connection
  middleware/          Express middleware
  utils/               logger, timestamp, wrappers
  index.ts             entrypoint

DEVELOPER_GUIDE/       contributor notes
test/                  older tests and future test location
```

## Contributing

This is still a prototype moving toward a first stable release. Prefer small, focused changes:

1. Keep ROS lifecycle logic in `RosStateManager` or `RosExecuter`.
2. Keep Express route mounting in `ExpressServer`.
3. Add modules under `src/api/v1/<module>`.
4. Use `@/...` imports.
5. Run `npm run typecheck` before opening a PR.

## Notes

- Use `logger` instead of `console.log` in framework code.
- Keep actions out of scope for now.
- Prefer typed ROS mounts and `kind` narrowing over casting.
- The original graduation-project server remains at [github.com/sanadChair/server](https://github.com/sanadChair/server).
