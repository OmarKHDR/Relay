import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class Map {
	constructor() {
		if (Map.instance) return Map.instance;

		logger.info('[MAP ROS TOPIC] Initializing Map topic handler');
		this.ros = rosHandler.getRos();
		this.topic = this.createTopic();
		this.map;
        this.info;
        this.subscribe();
		Map.instance = this;
	}

	createTopic() {
		const topic = new ROSLIB.Topic({
			ros: this.ros,
			name: '/map',
			messageType: 'nav_msgs/OccupancyGrid',
		});
		logger.info('[Map] Topic created: /map (nav_msgs/OccupancyGrid)');
		return topic;
	}

	subscribe() {
		const startSubscription = () => {
            this.topic.subscribe(msg => {
                this.map = msg.data;
                this.info = msg.info;
                logger.info(`[Map] recieved map data ${this.info}`)
            })
        }
        if (this.ros.isConnected) {
            startSubscription();
        } else {
            logger.warn('[Map] ROS not connected — waiting for connection to subscribe');
            this.ros.on('connection', () => {
                logger.info('[Map] ROS connected — subscribing now');
                startSubscription();
            });
        }

	}

    getMap() {
        if (this.info !== undefined) {
            logger.info(`[Map] Returning map information value: ${this.info}`);
            return {map: this.map, info: this.info};
        } else {
            logger.warn('[map] Distance value is undefined');
            return {undefined, undefined};
        }
    }

}

const MapHandler = new Map();
export default MapHandler;
