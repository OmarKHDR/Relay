// this is an interface till i change it to ts later
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
