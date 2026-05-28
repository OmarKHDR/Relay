# ROS-HTTP Framework Developer Guide

## Purpose

This guide explains how to add HTTP routes that communicate with ROS topics and services.

Relay was built from the larger SANAD graduation project server at [github.com/sanadChair/server](https://github.com/sanadChair/server). The current framework work keeps that project context, but the implementation is being shaped into a reusable ROS-HTTP layer.

Actions are not part of the current stable checkpoint. Focus on topics and services.

## Core Responsibilities

- `ExpressServer` mounts routes, middleware, validation, ROS injection, and controller wrappers.
- `RosStateManager` stores ROS configs by route key and rebuilds ROS objects on reconnect.
- `RosExecuter` builds ROSLIB objects from framework configs.
- `rosInjector` resolves the current ROS object by key and assigns it to `req.ros`.
- Feature modules define route configs, controllers, services, and optional WebSocket callbacks.

Do not rebuild Express routes when ROS reconnects. Reconnect belongs to `RosStateManager`.

## Module Shape

A simple feature module usually contains:

```text
src/api/v1/<feature>/
  <feature>.routes.ts
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.module.ts
```

The module file exports route registries:

```ts
export const RobotModule: Module = {
    routes: [RobotRouter],
    initialization: [RobotDB.init],
};
```

Then the module is added to `src/core/registry.ts`.

## Route With ROS Service Client

```ts
export const RobotRouter: Routes = {
    base: '/robot',
    routes: [
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
        },
    ],
};
```

The framework registers the ROS config and injects the current mount into `req.ros`.

## Controller Pattern

Controllers should stay thin:

```ts
export class RobotController {
    static async getStatus(req: Request) {
        if (!req.ros) {
            throw new Error('ROS communication is not mounted for this route');
        }

        return await robotService.getStatus(req.ros);
    }
}
```

Business logic and ROS mount narrowing should live in the service.

## Service Client Pattern

Use the `kind` discriminator before calling service-client-only methods:

```ts
class RobotService {
    async getStatus(ros: RosMount) {
        if (ros.kind !== ROSType.ServiceClient) {
            throw new Error(`Expected ROS service client, received ${ros.kind}`);
        }

        const request = ros.request({});
        return await ros.service(request);
    }
}
```

The controller does not create promises around ROSLIB callbacks. `RosExecuter` exposes `service(request)` as an async function.

## Topic Publisher Pattern

For topic publishers, narrow to `ROSType.TopicPub`:

```ts
if (ros.kind !== ROSType.TopicPub) {
    throw new Error(`Expected ROS topic publisher, received ${ros.kind}`);
}

const message = ros.message(req.body);
ros.topic.publish(message);
```

## Topic Subscriber Pattern

Topic subscribers are lifecycle resources. Their callback is attached when the ROS object is built:

```ts
ROS: {
    ROSType: ROSType.TopicSub,
    name: '/robot/status',
    messageType: 'std_msgs/String',
    callback: message => {
        logger.info(`[RobotStatus] ${JSON.stringify(message)}`);
    },
}
```

If a route needs the latest subscribed value later, add that behavior deliberately through a cache or state holder rather than reading directly from ROSLIB.

## Service Server Pattern

Service servers are also lifecycle resources. Their callback is advertised when the ROS object is built:

```ts
ROS: {
    ROSType: ROSType.ServiceServer,
    name: '/node_side_service',
    serviceType: 'example_interfaces/srv/Trigger',
    callback: (request, response) => {
        response.success = true;
        response.message = 'ok';
        return true;
    },
}
```

## Reconnect Rules

- `RosConnection` emits `ros_reconnected`.
- `RosStateManager` listens for that event.
- Every registered ROS config is rebuilt through `RosExecuter`.
- `rosInjector` continues resolving by key at request time.
- Express middleware is not remounted.

This keeps the HTTP layer stable while the ROS layer changes underneath it.

## Import Rules

Use `@/...` imports:

```ts
import { ROSType } from '@/core/types/Ros.types.js';
import logger from '@/utils/logger.js';
```

For TypeScript ESM source, local and alias imports that point to TypeScript files should use `.js` extensions.

## Typecheck

Run:

```bash
npm run typecheck
```

If dependencies are not installed yet:

```bash
npm install
```
