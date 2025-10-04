# API Endpoints

## servo-motor control
- `POST /api/servo-motor/` - control servo-motor angle
- `GET /api/servo-motor/` - get all servo-motors  angles

```javascript
//request: POST /api/servo-motor/
//request body:
{
  angle: Number;
}

//response:
{
  "status": "success",
  "data": [
    {
      id,
      name,
      angle: Number
    }
  ],
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
      "name": "left servo-motor",
      "angle": Number
    },
    {
      "id": "id2",
      "name": "right servo-motor",
      "angle": Number
    }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

```

## wheelchair movements
- `POST /api/wheelchair/direction/` - moves the wheelchair with a specific driection and speed
- `GET /api/wheelchair/direction/` - moves the wheelchair with a specific driection and speed

```javascript
//request: POST /api/wheelchair/direction/

//request body
{
  direction: string; //for now restricted to ['stop', 'forward', 'backward', 'left', 'right']
  speed: Number; //discard for now
}

//response:
{
  "status": "success",
  "data": [
    {
      id: 1,
      name: "testing wheelchair",
      direction: "forward"
    }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

//request: GET /api/wheelchair/direction/

//response:
{
  "status": "success",
  "data": [
    {
      "id": "id1",
      "name": "mywheelchair",
      "direction": "forward",
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```



## Sensor Data
- `GET /api/sensors/ultrasonic/` - Get all ultrasonics data

```javascript
//request: GET /api/sensors/ultrasonic/
//response:
{
  "status": "success",
  "data": [
    {
      "id": "id1",
      "name": "front ultrasonic",
      "distance": Number
    },
    {
      "id": "id2",
      "name": "rear ultrasonic",
      "distance": Number
    }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```
