import MapHandler from './ros/map.ros.topic.js';

class MapService {
    _quaternionToYaw(quat) {
        const { x, y, z, w } = quat;
        return Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
    }

    getMap() {
        const { map, info } = MapHandler.getMap();
        const yaw = this._quaternionToYaw(info.origin.orientation);
        return {
                frame: 'map',
                resolution: info.resolution,
                width: info.width,
                height: info.height,
                origin: {
                    x: info.origin.position.x,
                    y: info.origin.position.y,
                    yaw: yaw,
                },
                map: map,
            }
    }
}


export default new MapService();