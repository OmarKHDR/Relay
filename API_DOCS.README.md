# API Endpoints

## servo-motor control
- `POST /api/servo-servo-motor/:id` - control servo-motor angle
- `GET /api/servo-motor/` - get all servo-motors  angles
- `GET /api/servo-motor/:id` - get a specific servo-motor angle

```javascript
//request: POST /api/servo-motor/:id
//request body:
{
  angle: Number;
}

//response:
{
  "status": "success",
  "data": [],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}


//request: GET /api/servo-motor/

//response:
{
  "status": "success",
  "data": [
    {
      "id": "id1",
      "alias": "left",
      "name": "left servo-motor",
      "angle": Number
    },
    {
      "id": "id2",
      "alias": "right",
      "name": "right servo-motor",
      "angle": Number
    }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

//request: GET /api/servo-motor/:id

//response:
{
  "status": "success",
  "data": [
    {
      "id": "id1",
      "alias": "left",
      "name": "left servo-motor",
      "angle": Number
    }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```

## wheelchair movements
- `POST /api/wheelchair/move/` - moves the wheelchair with a specific angle and speed
```javascript
//request: POST /api/wheelchair/move

//request body
{
  angle: Number; //for now restricted to 0, 90, 180, 270
  speed: Number;
}

//response:
{
  "status": "success",
  "data": [],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

//request: GET /api/wheelchair/

//response:
{
  "status": "success",
  "data": [
    {
      "id": "id1",
      "alias": "main-wheelchair",
      "name": "mywheelchair",
      "angle": Number,
      "speed" : {
        "left-motor": Number,
        "right-motor": Number,
      },
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
