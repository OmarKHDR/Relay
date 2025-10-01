# API Endpoints

## motor control
- `POST /api/motor/:id` - control motor speed and angle
- `GET /api/motor/` - get all motors speed and angles
- `GET /api/motor/:id` - get a specific motor speed and angle

```javascript
//request: POST /api/motor/:id
//request body:
{
  angle: Number; //for now restricted to 0, 90, 180, 270
  speed: Number; // const for now to simplify system
}

//response:
{
  "status": "success",
  "data": [],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}


//request: GET /api/motor/

//response:
{
  "status": "success",
  "data": [
    {
      "id": "id1",
      "alias": "left",
      "name": "left motor",
      "speed": Number,
      "angle": Number
    },
    {
      "id": "id2",
      "alias": "right",
      "name": "right motor",
      "speed": Number,
      "angle": Number
    }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

//request: GET /api/motor/:id

//response:
{
  "status": "success",
  "data": [
    {
      "id": "id1",
      "alias": "left",
      "name": "left motor",
      "speed": Number,
      "angle": Number
    }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

## Sensor Data
- `GET /api/sensors/ultrasonic/` - Get all ultrasonics data
- `GET /api/sensors/ultrasonic/:id` - Get ultrasonic data

```javascript
//request: GET /api/sensors/ultrasonic/
//response:
{
  "status": "success",
  "data": [
    {
      "id": "id1",
      "alias": "front",
      "name": "front ultrasonic",
      "distance": Number
    },
    {
      "id": "id2",
      "alias": "rear",
      "name": "rear ultrasonic",
      "distance": Number
    }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

//request: GET /api/sensors/ultrasonic/:id
//response:
{
  "status": "success",
  "data": [
    {
      "id": "id1",
      "alias": "front",
      "name": "front ultrasonic",
      "distance": Number
    }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```
