import ROSLIB from 'roslib';

export enum ROSType {
    TopicSub = 'TopicSub',
    TopicPub = 'TopicPub',
    ServiceClient = 'ServiceClient',
    ServiceServer = 'ServiceServer',
    ActionClient = 'ActionClient',
    ActionServer = 'ActionServer',
}

/********************************************/

export interface BaseTopicROS {
    name: string;
    messageType: string;
}

export interface TopicSubROS extends BaseTopicROS {
    ROSType: ROSType.TopicSub;
    callback: (...args: unknown[]) => unknown;
}

export interface TopicPubROS extends BaseTopicROS {
    ROSType: ROSType.TopicPub;
    pubMessage?: Record<string, unknown>;
}

/********************************************/

export interface BaseServiceROS {
    name: string;
    serviceType: string;
}

export interface ServiceClientROS extends BaseServiceROS {
    ROSType: ROSType.ServiceClient;
    serviceMessage?: Record<string, unknown>;
}

export interface ServiceServerROS extends BaseServiceROS {
    ROSType: ROSType.ServiceServer;
    callback: (...args: unknown[]) => boolean;
}

/********************************************/

export interface BaseActionROS {
    serverName: string;
    actionName: string;
}

export interface ActionClientROS extends BaseActionROS {
    ROSType: ROSType.ActionClient;
}

export interface ActionServerROS extends BaseActionROS {
    ROSType: ROSType.ActionServer;
    callback: (...args: unknown[]) => unknown;
}

/********************************************/

export type TopicROS = TopicSubROS | TopicPubROS;
export type ServiceROS = ServiceClientROS | ServiceServerROS;
export type ActionROS = ActionClientROS | ActionServerROS;

export type ROS = TopicROS | ServiceROS | ActionROS;

export interface RosServiceClientMount {
    kind: ROSType.ServiceClient;
    request: (message: Record<string, unknown>) => ROSLIB.ServiceRequest;
    service: (request: ROSLIB.ServiceRequest) => Promise<unknown>;
}

export interface RosServiceServerMount {
    kind: ROSType.ServiceServer;
    service: ROSLIB.Service<any, any>;
}

export interface RosActionClientMount {
    kind: ROSType.ActionClient;
    action: ROSLIB.ActionClient;
}

export interface RosActionServerMount {
    kind: ROSType.ActionServer;
    action: ROSLIB.SimpleActionServer;
}

export interface RosTopicPubMount {
    kind: ROSType.TopicPub;
    message: (message: Record<string, unknown>) => ROSLIB.Message;
    topic: ROSLIB.Topic<ROSLIB.Message>;
}

export interface RosTopicSubMount {
    kind: ROSType.TopicSub;
    topic: ROSLIB.Topic<ROSLIB.Message>;
}

export type RosMount =
    | RosServiceClientMount
    | RosServiceServerMount
    | RosActionClientMount
    | RosActionServerMount
    | RosTopicPubMount
    | RosTopicSubMount;
