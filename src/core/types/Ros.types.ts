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
    callback: (...args: unknown[]) => unknown;
    errorCallback: (...args: unknown[]) => unknown;
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

export type RosMount =
    | {
          request: (message: Record<string, unknown>) => ROSLIB.ServiceRequest;
          service: void;
      }
    | {
          service: ROSLIB.Service<any, any>;
      }
    | {
          action: ROSLIB.ActionClient;
      }
    | {
          action: ROSLIB.SimpleActionServer;
      }
    | {
          topic: ROSLIB.Topic<ROSLIB.Message>;
      };
