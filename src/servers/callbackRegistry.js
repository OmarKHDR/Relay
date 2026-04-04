import { MapModule } from '#modules/map/map.module.js';
import { WheelchairModule } from '#modules/wheelchair/wheelchair.module.js';
import { PoseModule } from '#modules/pose/pose.module.js';
import { GoalModule } from '#modules/goal/goal.module.js';
import { IrModule } from '#modules/ir/ir.module.js';

export const CallbackRegistry = [
    ...MapModule.WSCallback,
    ...WheelchairModule.WSCallback,
    ...PoseModule.WSCallback,
    ...GoalModule.WSCallback,
    ...IrModule.WSCallback,
];

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
