sudo apt update && sudo apt upgrade -y

sudo apt install -y \
  locales \
  curl \
  gnupg \
  lsb-release \
  software-properties-common

sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
  -o /usr/share/keyrings/ros-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] \
http://packages.ros.org/ros2/ubuntu $(lsb_release -cs) main" | \
sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

sudo apt update
sudo apt install -y ros-humble-desktop

sudo apt install -y \
  ros-humble-nav2-bringup \
  ros-humble-turtlebot3* \
  ros-humble-ros-gz \
  python3-colcon-common-extensions \
  python3-rosdep \
  git

sudo rosdep init || true
rosdep update

source /opt/ros/humble/setup.bash

mkdir -p ./nav2_ws/src
cd ./nav2_ws/src

git clone https://github.com/Onicc/navigation2_ignition_gazebo_turtlebot3.git

cd ..
rosdep install --from-paths src --ignore-src -r -y

colcon build --symlink-install

source ./install/setup.bash

# Launch (Gazebo Fortress + Nav2 + RViz)
export TURTLEBOT3_MODEL=waffle
ros2 launch turtlebot3 simulation.launch.py headless:=True use_rviz:=True