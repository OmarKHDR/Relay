#!/bin/bash
#
# nav2_setup.sh - Smart ROS 2 Humble + Nav2 + Ignition Setup
#
# Usage: ./nav2_setup.sh [options]
# Options:
#   --check    Only analyze the system, don't install anything.
#   --force    Skip the confirmation prompt.
#   --help     Show help message.

set -e
set -u
set -o pipefail

# --- Configuration ---
WORKSPACE_DIR="${HOME}/nav2_ws"
REPO_URL="https://github.com/Onicc/navigation2_ignition_gazebo_turtlebot3.git"
REPO_NAME="navigation2_ignition_gazebo_turtlebot3"
ROS_DISTRO="humble"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# --- Arguments ---
FORCE=false
CHECK_ONLY=false

for arg in "$@"; do
  case $arg in
    --force) FORCE=true ;;
    --check) CHECK_ONLY=true ;;
    --help)
      echo "Usage: $0 [--force] [--check]"
      exit 0
      ;;
  esac
done

# --- Logging ---
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# --- Checks ---
check_ubuntu_version() {
    if [[ "$(lsb_release -sc)" != "jammy" ]]; then
        log_error "This script requires Ubuntu 22.04 (Jammy)."
        exit 1
    fi
}

# Checks if a package is installed without failing
is_installed() {
    dpkg -l "$1" 2>/dev/null | grep -q "^ii"
}

analyze_system() {
    local needs_work=false
    log_info "Analyzing system state..."

    if [ -f "/opt/ros/$ROS_DISTRO/setup.bash" ]; then
        log_success "ROS 2 $ROS_DISTRO found."
    else
        log_warn "ROS 2 $ROS_DISTRO not found."
        needs_work=true
    fi

    if is_installed "ros-humble-ros-gz"; then
        log_success "Ignition/Gz Bridge found."
    else
        log_warn "Ignition/Gz Bridge missing."
        needs_work=true
    fi

    if [ -d "$WORKSPACE_DIR/install" ]; then
        log_success "Workspace built."
    else
        log_warn "Workspace needs building."
        needs_work=true
    fi

    if [ "$CHECK_ONLY" = true ]; then
        exit 0
    fi

    if [ "$needs_work" = false ]; then
        log_success "System is fully configured. Nothing to do."
        print_usage
        exit 0
    fi
}

# --- Actions ---
setup_repos() {
    log_info "Configuring ROS 2 Repositories..."
    sudo apt update && sudo apt install -y curl gnupg2 lsb-release
    sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
    sudo apt update
}

install_core_pkgs() {
    log_info "Installing ROS 2 and Nav2 packages..."
    sudo apt install -y \
        ros-humble-desktop \
        ros-humble-navigation2 \
        ros-humble-nav2-bringup \
        ros-humble-turtlebot3-msgs \
        ros-humble-ros-gz \
        python3-colcon-common-extensions \
        python3-rosdep \
        python3-vcstool

    if ! [ -f /etc/ros/rosdep/sources.list.d/20-default.list ]; then
        sudo rosdep init || true
    fi
    rosdep update
}

cleanup_classic_gazebo() {
    # Only remove if classic gazebo is found to avoid breaking deps unnecessarily
    if is_installed "gazebo11"; then
        log_warn "Classic Gazebo detected. Removing to prevent Ignition conflicts..."
        # We use 'purge' but carefully avoid removing desktop-full if possible
        sudo apt-get remove -y gazebo11 libgazebo11-dev || true
        sudo apt-get autoremove -y
    fi
}

setup_workspace() {
    log_info "Preparing workspace at $WORKSPACE_DIR..."
    mkdir -p "$WORKSPACE_DIR/src"
    cd "$WORKSPACE_DIR/src"

    if [ ! -d "$REPO_NAME" ]; then
        git clone "$REPO_URL"
    else
        log_info "Repo already exists, skipping clone."
    fi

    cd "$WORKSPACE_DIR"
    # Source ROS before building
    set +u
    source "/opt/ros/$ROS_DISTRO/setup.bash"
    set -u
    
    log_info "Installing workspace dependencies via rosdep..."
    rosdep install --from-paths src --ignore-src -r -y

    log_info "Building workspace (colcon)..."
    colcon build --symlink-install
}

setup_bashrc() {
    local BASHRC="$HOME/.bashrc"
    local SOURCE_CMD="source $WORKSPACE_DIR/install/setup.bash"
    if ! grep -q "$SOURCE_CMD" "$BASHRC"; then
        echo -e "\n# Nav2 Workspace\n$SOURCE_CMD" >> "$BASHRC"
        echo "export TURTLEBOT3_MODEL=waffle" >> "$BASHRC"
        log_success "Added sourcing to .bashrc"
    fi
}

print_usage() {
    echo -e "\n${GREEN}Setup Complete!${NC}"
    echo "To start the simulation:"
    echo -e "1. Open a new terminal"
    echo -e "2. Run: ${BLUE}ros2 launch turtlebot3_ignition_bringup turtlebot3_ignition_sim.launch.py${NC}"
}

# --- Main Execution ---
main() {
    check_ubuntu_version
    analyze_system

    if [ "$FORCE" = false ]; then
        read -p "Proceed with installation? (y/n) " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
    fi

    setup_repos
    cleanup_classic_gazebo
    install_core_pkgs
    setup_workspace
    setup_bashrc
    print_usage
}

main