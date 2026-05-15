#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
import json
from sanad_interfaces.srv import Devices, Discover, DeviceControl, Device

class SmartHomeClientNode(Node):
    def __init__(self):
        super().__init__('smart_home_client')
        self.get_logger().info('Smart Home Client Node has been started.')

        # Initialize clients
        self.cli_all_devices = self.create_client(Devices, '/sanad/smart_home/all_devices')
        self.cli_discover = self.create_client(Discover, '/sanad/smart_home/discover')
        self.cli_control = self.create_client(DeviceControl, '/sanad/smart_home/control')
        self.cli_device = self.create_client(Device, '/sanad/smart_home/device')
        self.cli_device_info = self.create_client(Device, '/sanad/smart_home/device_info')

    def _decode_json(self, payload, fallback):
        if not payload:
            return fallback
        try:
            return json.loads(payload)
        except Exception:
            self.get_logger().warn('Failed to parse JSON payload from service response')
            return fallback

    def fetch_all_devices(self):
        while not self.cli_all_devices.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('service /sanad/smart_home/all_devices not available, waiting again...')
        req = Devices.Request()
        future = self.cli_all_devices.call_async(req)
        rclpy.spin_until_future_complete(self, future)
        if future.result() is not None:
            self.get_logger().info(f"Devices fetched successfully. Success: {future.result().success}")
            return self._decode_json(future.result().devices, {})
        else:
            self.get_logger().error('Exception while calling service')

    def trigger_discovery(self):
        while not self.cli_discover.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('service /sanad/smart_home/discover not available, waiting again...')
        req = Discover.Request()
        future = self.cli_discover.call_async(req)
        rclpy.spin_until_future_complete(self, future)
        if future.result() is not None:
             self.get_logger().info(f"Discovery completed. Success: {future.result().success}")
             return self._decode_json(future.result().devices, {})
        else:
             self.get_logger().error('Exception while calling discover service')

    def send_control_command(self, device_id, state):
        while not self.cli_control.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('service /sanad/smart_home/control not available, waiting...')
        req = DeviceControl.Request()
        req.device_id = device_id
        req.state = state
        future = self.cli_control.call_async(req)
        rclpy.spin_until_future_complete(self, future)
        return future.result().success

    def fetch_device_from_db(self, device_id):
        while not self.cli_device.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('service /sanad/smart_home/device not available, waiting...')
        req = Device.Request()
        req.device_id = device_id
        future = self.cli_device.call_async(req)
        rclpy.spin_until_future_complete(self, future)
        if future.result() is not None and future.result().success:
            return self._decode_json(future.result().device, {})
        return None

    def fetch_device_runtime_info(self, device_id):
        while not self.cli_device_info.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('service /sanad/smart_home/device_info not available, waiting...')
        req = Device.Request()
        req.device_id = device_id
        future = self.cli_device_info.call_async(req)
        rclpy.spin_until_future_complete(self, future)
        if future.result() is not None and future.result().success:
            return self._decode_json(future.result().device, {})
        return None

def main(args=None):
    rclpy.init(args=args)
    client_node = SmartHomeClientNode()
    
    # Typically, you would integrate this node into a larger state machine or behavior tree.
    # For now, it simply spins and is available to be called by other robotic modules.
    try:
         rclpy.spin(client_node)
    except KeyboardInterrupt:
         pass
    finally:
         client_node.destroy_node()
         rclpy.shutdown()

if __name__ == '__main__':
    main()
