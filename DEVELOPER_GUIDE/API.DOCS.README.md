# API Endpoints


## wheelchair movements
- `POST /api/v1/wheelchair/velocity/` - moves the wheelchair with a specific linear and angular velocity
- `GET /api/v1/wheelchair/velocity/` - gets current wheelchair linear and angular velocity

```javascript
//request: POST /api/v1/wheelchair/velocity/

//request body
{
  linear: Number; //a multiplier in interval of [-1, 1]
  angular: Number; //a multiplier in interval of [-1, 1]
}

//response:
{
  "status": "success",
  "data": [
      "id": "id1",
      "name": "mywheelchair",
      "velocity" : {
        "linear": Number,
        "angular": Number
      }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}

//request: GET /api/v1/wheelchair/velocity/

//response:
{
  "status": "success",
  "data": [
    {
      "id": "id1",
      "name": "mywheelchair",
      "velocity" : {
        "linear": Number,
        "angular": Number
      }
  ],
  "meta": {
    "timestamp": "2025-09-28T22:00:00Z"
  }
}
```





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