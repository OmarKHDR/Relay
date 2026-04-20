#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
import json
from sanad_interfaces.msg import SmartDeviceEvent

class SmartHomeSubscriber(Node):
    def __init__(self):
        super().__init__('smart_home_subscriber')
        self.get_logger().info('Smart Home Subscriber Node has been started.')
        self.subscription = self.create_subscription(
            SmartDeviceEvent,
            '/sanad/smart_home/devices',
            self.listener_callback,
            10
        )
        self.device_registry = {}

    def listener_callback(self, msg):
        action = msg.action
        device_id = msg.device_id
        
        self.get_logger().info(f'Received event -> Action: {action}, Device ID: {device_id}')
        
        if hasattr(msg, 'device_data') and msg.device_data:
            try:
                device_data = json.loads(msg.device_data)
            except json.JSONDecodeError:
                self.get_logger().error("Failed to decode device_data JSON")
                device_data = {}
        else:
            device_data = {}

        if action == 'ADD':
            self.device_registry[device_id] = device_data
            self.get_logger().info(f'Added device: {device_id}')
        elif action == 'UPDATE':
            if device_id in self.device_registry:
                self.device_registry[device_id].update(device_data)
                self.get_logger().info(f'Updated device: {device_id}')
            else:
                self.get_logger().warn(f'Tried to update unknown device: {device_id}')
        elif action in ['DELETE', 'DISCONNECT']:
            if device_id in self.device_registry:
                del self.device_registry[device_id]
                self.get_logger().info(f'Removed device: {device_id} ({action})')

def main(args=None):
    rclpy.init(args=args)
    node = SmartHomeSubscriber()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
