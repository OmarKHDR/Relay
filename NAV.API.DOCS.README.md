# API Endpoints (Navigation / Visualization)

These endpoints are **read-only visualization + goal command**.
They are designed so the frontend can render a 2D map with wheelchair pose, path, and goal **without knowing ROS**.

---

## Map (static world data)

* `GET /api/v1/navigation/map/` – get the current navigation map

> The map is assumed **static** during normal operation.
> Frontend should fetch **once**, cache it, and only refetch if `version` changes.

```javascript
// request: GET /api/v1/navigation/map/

// response:
{
  "status": "success",
  "data": {
    "frame": "map",                 // global reference frame
    "resolution": Number,           // meters per cell (e.g. 0.05)
    "width": Number,                // number of cells (x)
    "height": Number,               // number of cells (y)
    "origin": {
      "x": Number,                  // map origin x in meters
      "y": Number,                  // map origin y in meters
      "yaw": Number                 // radians (usually 0)
    },
    "data": Number[],               // row-major occupancy grid
    /*
      cell values:
        -1  = unknown
         0  = free
        100 = occupied
    */
    "version": String               // map identity / hash / name
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

### Frontend notes

* Coordinate conversion:

  ```
  world_x = origin.x + cell_x * resolution
  world_y = origin.y + cell_y * resolution
  ```
* All other navigation data (pose, path, goal) is expressed **in this same map frame**.
* Render once, reuse forever unless `version` changes.

---

## Wheelchair Pose (live)

* `GET /api/v1/navigation/pose/` – get current wheelchair pose

> This is **live data**.
> Will use another websocket event with same structure

```javascript
// request: GET /api/v1/navigation/pose/

// response:
{
  "status": "success",
  "data": {
    "frame": "map",           // same frame as map
    "position": {
      "x": Number,            // meters
      "y": Number,            // meters
      "z": Number             // meters (usually 0)
    },
    "orientation": {
      "yaw": Number           // radians, CCW, 0 = +X axis
    }
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

### Frontend notes

* Use `(x, y)` directly on the map.
* `yaw` is enough for 2D rendering (no quaternions needed).
* Draw wheelchair icon centered at `(x, y)` rotated by `yaw`.

---

## Planned Path (optional visualization)

* `GET /api/v1/navigation/path/` – get current planned path

> Path may change during navigation.
> If no navigation is active, `points` may be empty.

```javascript
// request: GET /api/v1/navigation/path/

// response:
{
  "status": "success",
  "data": {
    "frame": "map",
    "points": [
      {
        "x": Number,          // meters
        "y": Number,          // meters
        "yaw": Number         // radians (optional for rendering)
      }
    ]
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

### Frontend notes

* Draw a polyline through `(x, y)` points.
* Ignore `yaw` unless you want arrowheads or orientation hints.
* Path is **informational**, not authoritative control.

---

## Navigation Goal (target)

### Set goal

* `POST /api/v1/navigation/goal/` – send navigation target

```javascript
// request: POST /api/v1/navigation/goal/
// request body:
{
  "frame": "map",
  "position": {
    "x": Number,              // meters
    "y": Number               // meters
  },
  "orientation": {
    "yaw": Number             // radians
  }
}

// response:
{
  "status": "success",
  "data": {
    "accepted": true
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

### Get current goal

* `GET /api/v1/navigation/goal/`

```javascript
// request: GET /api/v1/navigation/goal/

// response:
{
  "status": "success",
  "data": {
    "frame": "map",
    "position": {
      "x": Number,
      "y": Number
    },
    "orientation": {
      "yaw": Number
    },
    "active": Boolean         // false if no goal set
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

### Frontend notes

* Goal is always expressed in **map frame**.
* Frontend can:

  * Place a marker on click
  * Send `(x, y, yaw)`
  * Optionally show planned path afterward

## Stop navigation

* `POST /api/v1/navigation/stop/`
```javascript
// request: GET /api/v1/navigation/stop/

// response:
{
  "status": "success",
  "data": {
    "stopped": true
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```