import rosHandler from '@/lib/ros/connection.js';
import {
    type ActionROS,
    type ROS,
    type RosActionClientMount,
    type RosActionServerMount,
    type RosMount,
    type RosServiceClientMount,
    type RosServiceServerMount,
    type RosTopicPubMount,
    type RosTopicSubMount,
    ROSType,
    type ServiceROS,
    ServiceServerROS,
    type TopicROS,
    TopicSubROS,
} from '@/core/types/Ros.types.js';
import ROSLIB from 'roslib';

class RosExecuter {
    ros?: ROSLIB.Ros;

    constructor() {
        rosHandler.on('ros_reconnected', newRosInstance => {
            this.ros = newRosInstance;
        });
        if (rosHandler.isConnected()) {
            this.ros = rosHandler.getRos();
        }
    }

    buildRosObject(config: ROS): RosMount {
        //returns {message: function, ros: ros communication}
        switch (config.ROSType) {
            case ROSType.ServiceClient:
                return this.createServiceClient(config);
            case ROSType.ServiceServer:
                return this.createServiceServer(config);
            case ROSType.ActionClient:
                return this.createActionClient(config);
            case ROSType.ActionServer:
                return this.createActionServer(config);
            case ROSType.TopicPub:
                return this.createPub(config);
            case ROSType.TopicSub:
                return this.createSub(config);
            default:
                throw new Error(`Unsupported ROS type`);
        }
    }

    createService(config: ServiceROS) {
        return new ROSLIB.Service({
            ros: this.getRos(),
            name: config.name,
            serviceType: config.serviceType,
        });
    }

    createServiceClient(config: ServiceROS): RosServiceClientMount {
        const service = this.createService(config);
        return {
            kind: ROSType.ServiceClient,
            request: (message: Record<string, unknown>) => new ROSLIB.ServiceRequest(message),
            service: (request: ROSLIB.ServiceRequest) =>
                new Promise((resolve, reject) => {
                    service.callService(request, resolve, reject);
                }),
        };
    }

    createServiceServer(config: ServiceROS): RosServiceServerMount {
        const service = this.createService(config);
        service.advertise((request, response) => (config as ServiceServerROS).callback(request, response) ?? true);
        return {
            kind: ROSType.ServiceServer,
            service,
        };
    }

    createActionClient(config: ActionROS): RosActionClientMount {
        const actionClinet = new ROSLIB.ActionClient({
            ros: this.getRos(),
            serverName: config.serverName,
            actionName: config.actionName,
        });
        return {
            kind: ROSType.ActionClient,
            action: actionClinet,
        };
    }

    createActionServer(config: ActionROS): RosActionServerMount {
        const actionServer = new ROSLIB.SimpleActionServer({
            ros: this.getRos(),
            serverName: config.serverName,
            actionName: config.actionName,
        });
        return {
            kind: ROSType.ActionServer,
            action: actionServer,
        };
    }

    createPub(config: TopicROS): RosTopicPubMount {
        const topic = this.createTopic(config);
        topic.advertise();

        return {
            kind: ROSType.TopicPub,
            message: (message: Record<string, unknown>) => new ROSLIB.Message(message),
            topic: topic,
        };
    }

    createSub(config: TopicROS): RosTopicSubMount {
        const topic = this.createTopic(config);
        topic.subscribe(message => (config as TopicSubROS).callback(message));

        return {
            kind: ROSType.TopicSub,
            topic,
        };
    }

    private createTopic(config: TopicROS) {
        return new ROSLIB.Topic({
            ros: this.getRos(),
            name: config.name,
            messageType: config.messageType,
        });
    }

    private getRos() {
        if (!this.ros) {
            throw new Error('ROS connection is not initialized');
        }

        return this.ros;
    }
}

export const rosExcuter = new RosExecuter();
