# API Endpoints

## servo-motor control
- `POST /api/v1/servo-motor/` - control servo-motor angle
- `GET /api/v1/servo-motor/` - get all servo-motors  angles

```javascript
//request: POST /api/v1/servo-motor/
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


//request: GET /api/v1/servo-motor/
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
- `POST /api/v1/wheelchair/direction/` - moves the wheelchair with a specific driection and speed
- `GET /api/v1/wheelchair/direction/` - moves the wheelchair with a specific driection and speed

```javascript
//request: POST /api/v1/wheelchair/direction/

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

//request: GET /api/v1/wheelchair/direction/

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
- `GET /api/v1/sensors/ultrasonic/` - Get all ultrasonics data

```javascript
//request: GET /api/v1/sensors/ultrasonic/
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


## ALL ERRORS 
- all error responses has same format

```javascript
{
  "status": "fail",
  "error": {
    "code": "AUTH_INVALID_TOKEN",
    "type": "AuthenticationError",
    "message": "The provided token is invalid or expired"
  },
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```