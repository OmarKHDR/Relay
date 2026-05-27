import rosHandler from '#lib/ros/connection.js';
import {
    type ActionROS,
    type ROS,
    ROSType,
    ServiceClientROS,
    type ServiceROS,
    ServiceServerROS,
    type TopicROS,
    TopicSubROS,
} from '#core/types/Ros.types.ts';
import ROSLIB from 'roslib';
import { request } from 'express';

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

    build(config: ROS) {
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

    createServiceClient(config: ServiceROS) {
        const service = this.createService(config);
        return {
            request: (message: Record<string, unknown>) => new ROSLIB.ServiceRequest(message),
            service: service.callService(
                request,
                config.callback,
                (config as ServiceClientROS).errorCallback
            ),
        };
    }

    createServiceServer(config: ServiceROS) {
        const service = this.createService(config);
        service.advertise((request, response) => config.callback(request, response) ?? true);
        return {
            service,
        };
    }

    createActionClient(config: ActionROS) {
        const actionClinet = new ROSLIB.ActionClient({
            ros: this.getRos(),
            serverName: config.serverName,
            actionName: config.actionName,
        });
        return {
            action: actionClinet,
        };
    }

    createActionServer(config: ActionROS) {
        const actionServer = new ROSLIB.SimpleActionServer({
            ros: this.getRos(),
            serverName: config.serverName,
            actionName: config.actionName,
        });
        return {
            action: actionServer,
        };
    }

    createPub(config: TopicROS) {
        const topic = this.createTopic(config);
        topic.advertise();

        return {
            message: (message: Record<string, unknown>) => new ROSLIB.Message(message),
            topic: topic,
        };
    }

    createSub(config: TopicROS) {
        const topic = this.createTopic(config);
        topic.subscribe(message => (config as TopicSubROS).callback(message));

        return {
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
