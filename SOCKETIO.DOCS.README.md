# Real time data integration between server and any frontend 
| for simplicity the authentication is ignored for now
---
## socket structure

using naming like `wheelchair:velocity` which reduces the complexity of the app instead of rooms.


---

## general events
- client can emit to

- client can subscribe to :



## wheelchair events
- client can emit to:
	- `wheelchair:velocity` set the velocity vector for the wheelchair
- client can subscribe to:
	- `wheelchair:velocity` recieve any velocity updates in the client side
	- `wheelchair:velocity:error` recieve error messages from the wheelchair velocity related events
	- `wheelchair:connected` confirm connection to wheelchair

``` javascript
const socket = new io('http://localhost:5050');
socket.emit('wheelchair:velocity', {
	linear: Number, //multiplier between [-1, 1]
	angular: Number //multiplier between [-1, 1]
})

socket.on('wheelchair:velocity', (data) => {})
/*
data = {
	linear: Number,
	angular: Number,
	meta: {
		timestamp: "",
		source: uuid.v4
	}
}
*/
socket.on('wheelchair:velocity:error', (error) => {})
/*
error = {
	type: "",
	message: ""
}
*/


socket.on('wheelchair:connected', (data) => {})
/*
data = {
	controller: 'wheelchair',
	currentVelocity: {
		linear: Number,
		angular: Number
	}
}
```