# Navigation / Visualization API

These endpoints allow the frontend to render a 2D map with the wheelchair pose and navigation goal **without needing ROS knowledge**.  
They include **static world data** (map) and **dynamic navigation state** (pose and goal).

---

## Map (static world data)

**GET** `/api/v1/navigation/map/` – get the current navigation map

> The map is **assumed static** during normal operation.  
> Frontend should fetch **once**, cache it, and only refetch if the map changes.

```javascript
// request
GET /api/v1/navigation/map/

// response
{
  "status": "success",
  "data": {
    "frame": "map",
    "resolution": Number,           // meters per cell (e.g. 0.05)
    "width": Number,                // number of cells (x)
    "height": Number,               // number of cells (y)
    "origin": {
      "x": Number,                  // map origin x in meters
      "y": Number,                  // map origin y in meters
      "yaw": Number                 // radians, usually 0
    },
    "map": Number[],                // row-major occupancy grid
    /*
      cell values:
        -1  = unknown
        0   = free
        100 = occupied
    */
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

### Frontend notes

- **Coordinate conversion**: `world_x = origin.x + cell_x * resolution` and `world_y = origin.y + cell_y * resolution`
- All navigation data (pose, goal) is expressed in the map frame.
- Render once, reuse until map changes.

---

## Wheelchair Pose (live)

**GET** `/api/v1/navigation/pose/` – get current wheelchair pose

```javascript
// request
GET /api/v1/navigation/pose/

// response
{
  "status": "success",
  "data": {
    "frame": "map",
    "pose": {
      "x": Number,            // meters
      "y": Number,            // meters
      "z": Number,            // meters (usually 0)
      "yaw": Number           // radians, CCW, 0 = +X axis
    }
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

### Frontend notes

- Use (x, y) directly on the map.
- yaw is enough for 2D rendering (no quaternions needed).
- Draw wheelchair icon centered at (x, y) rotated by yaw.

---

## Navigation Goal (target)

### Set goal

**POST** `/api/v1/navigation/goal/` – send navigation target

```javascript
// request body
{
  "x": Number,        // meters
  "y": Number,        // meters
  "yaw": Number       // radians
}

// response
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

- Returns 500 if ROS connection fails or Nav2 rejects the goal.

### Get current goal

**GET** `/api/v1/navigation/goal/` – retrieve current goal

```javascript
// response when goal exists
{
  "status": "success",
  "data": {
    "goal": {
      "x": Number,
      "y": Number,
      "yaw": Number
    },
    "status": "ACTIVE"         // IDLE | PENDING | ACTIVE | CANCELING | SUCCEEDED | FAILED | CANCELED
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

// response when no goal
{
  "status": "fail",
  "error": {
    "code": "NO_ACTIVE_GOAL",
    "message": "There is no active navigation goal"
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

### Stop navigation

**DELETE** `/api/v1/navigation/goal/` – cancel active goal

```javascript
// response when canceled successfully
{
  "status": "success",
  "data": {
    "canceled": true
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

// response when no active goal
{
  "status": "fail",
  "error": {
    "code": "NO_ACTIVE_GOAL",
    "message": "There is no active goal to cancel"
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

### Frontend notes

- All goals are expressed in map frame.
- Frontend can place a marker, send (x, y, yaw), and optionally show the planned path afterward.