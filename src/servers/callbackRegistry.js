import {wheelchairCallback} from '#modules/wheelchair/wsWheelchairCallback.js';


export const CallbackRegistry = [
	wheelchairCallback
]







/* an interface in a comment because i didn't like ts
for sub and broadcast give the socket or the io instance to the handler, they will handle triggering on event
export const wheelchairCallback = {
		publish: [
				{
						eventName: 'wheelchair:velocity',
						callback: updateVelocity,
				},
		],
		subscribe: [
			{
						eventName: 'wheelchair:velocity',
						callback: function
			}
		],
		broadcast: [],
		cleanup: () => {},
};
*/