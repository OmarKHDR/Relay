# Clone this ready-made repo
git clone https://github.com/Onicc/navigation2_ignition_gazebo_turtlebot3.git

cd navigation2_ignition_gazebo_turtlebot3

# Install dependencies
sudo apt install ros-humble-ros-gz

source /opt/ros/humble/setup.sh
# Build
colcon build
source install/setup.bash

# Launch (Gazebo Fortress + Nav2 + RViz)
export TURTLEBOT3_MODEL=waffle
ros2 launch turtlebot3 simulation.launch.py headless:=True use_rviz:=True