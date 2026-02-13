#!/bin/bash
#
# nav2_setup.sh - Smart ROS 2 Humble + Nav2 installation script
# 
# This script intelligently detects existing installations and only
# performs necessary setup steps. If everything is ready, it just
# prints usage instructions.
#
# Usage: ./nav2_setup.sh
#
# Author: Omar K
# Version: 2.0
# Last Updated: 2026-02-06

set -e  # Exit immediately if a command exits with a non-zero status
set -u  # Treat unset variables as an error
set -o pipefail  # Pipeline fails if any command fails

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Workspace directory
WORKSPACE_DIR="${HOME}/server/nav2_ws"
REPO_URL="https://github.com/Onicc/navigation2_ignition_gazebo_turtlebot3.git"
REPO_NAME="navigation2_ignition_gazebo_turtlebot3"

# Tracking what needs to be done
NEEDS_ROS_INSTALL=false
NEEDS_REPO_FIX=false
NEEDS_GAZEBO_FIX=false
NEEDS_NAV2_INSTALL=false
NEEDS_ROSDEP_INIT=false
NEEDS_WORKSPACE_SETUP=false
NEEDS_WORKSPACE_BUILD=false

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_skip() {
    echo -e "${CYAN}[SKIP]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handler
error_exit() {
    log_error "$1"
    exit 1
}

# Check if running on Ubuntu 22.04
check_ubuntu_version() {
    if [ ! -f /etc/os-release ]; then
        error_exit "Cannot determine OS version. /etc/os-release not found."
    fi
    
    source /etc/os-release
    
    if [ "$ID" != "ubuntu" ]; then
        error_exit "This script is designed for Ubuntu. Detected: $ID"
    fi
    
    if [ "$VERSION_ID" != "22.04" ]; then
        log_warning "This script is designed for Ubuntu 22.04. Detected: $VERSION_ID"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check if script is run with sudo (we don't want that)
check_not_sudo() {
    if [ "$EUID" -eq 0 ]; then
        error_exit "Please do not run this script with sudo. It will ask for sudo when needed."
    fi
}

# Check internet connectivity
check_internet() {
    if ! ping -c 1 -W 5 8.8.8.8 &> /dev/null; then
        error_exit "No internet connection detected. Please check your network."
    fi
}

# Check if ROS 2 Humble is installed
check_ros_installation() {
    if [ -f "/opt/ros/humble/setup.bash" ]; then
        return 0
    else
        return 1
    fi
}

# Check if a package is installed
check_package_installed() {
    dpkg -l "$1" 2>/dev/null | grep -q "^ii"
}

# Check if classic Gazebo is installed (any version)
check_classic_gazebo_installed() {
    # Explicit check for classic gazebo package names
    if dpkg -l "gazebo" 2>/dev/null | grep -q "^ii" || \
       dpkg -l "gazebo11" 2>/dev/null | grep -q "^ii" || \
       dpkg -l "gazebo9" 2>/dev/null | grep -q "^ii" || \
       dpkg -l "libgazebo11" 2>/dev/null | grep -q "^ii" || \
       dpkg -l "libgazebo11-dev" 2>/dev/null | grep -q "^ii"; then
        return 0
    fi
    return 1
}

# Check if Nav2 packages are installed
check_nav2_installed() {
    if check_package_installed "ros-humble-nav2-bringup" && \
       check_package_installed "ros-humble-turtlebot3-msgs" && \
       check_package_installed "ros-humble-ros-gz" && \
       check_package_installed "python3-colcon-common-extensions" && \
       check_package_installed "python3-rosdep"; then
        return 0
    else
        return 1
    fi
}

# Check if rosdep is initialized
check_rosdep_initialized() {
    if [ -f "/etc/ros/rosdep/sources.list.d/20-default.list" ]; then
        return 0
    else
        return 1
    fi
}

# Check for ROS repository conflicts
check_ros_repository_conflicts() {
    local has_conflict=false
    
    # Check for ros2.sources symlink or file (conflict with .list)
    if [ -L "/etc/apt/sources.list.d/ros2.sources" ] || [ -f "/etc/apt/sources.list.d/ros2.sources" ]; then
        has_conflict=true
    fi
    
    # Check for multiple ROS .list files
    local ros_list_count=$(ls /etc/apt/sources.list.d/ros*.list 2>/dev/null | wc -l)
    if [ "$ros_list_count" -gt 1 ]; then
        has_conflict=true
    fi
    
    if [ "$has_conflict" = true ]; then
        return 0  # Has conflict
    else
        return 1  # No conflict
    fi
}

# Check if workspace exists and is built
check_workspace_ready() {
    if [ -d "${WORKSPACE_DIR}/src/${REPO_NAME}" ] && \
       [ -f "${WORKSPACE_DIR}/install/setup.bash" ] && \
       [ -d "${WORKSPACE_DIR}/build" ]; then
        return 0
    else
        return 1
    fi
}

# Analyze what needs to be done
analyze_system() {
    echo ""
    log_info "Analyzing system state..."
    echo ""
    
    # Check ROS installation
    if check_ros_installation; then
        log_success "ROS 2 Humble is installed"
    else
        log_info "ROS 2 Humble needs to be installed"
        NEEDS_ROS_INSTALL=true
    fi
    
    # Check for repository conflicts
    if check_ros_repository_conflicts; then
        log_warning "ROS repository conflicts detected (will be fixed)"
        NEEDS_REPO_FIX=true
    else
        log_success "ROS repository is properly configured"
    fi
    
    # Check for classic Gazebo (conflicts with Ignition)
    if check_classic_gazebo_installed; then
        log_warning "Classic Gazebo detected - conflicts with Ignition Gazebo (will be removed and reinstalled)"
        NEEDS_GAZEBO_FIX=true
        NEEDS_NAV2_INSTALL=true  # Force reinstall Nav2 packages after Gazebo fix
    else
        # Check if Ignition Gazebo is properly installed
        if ! dpkg -l "gz-garden" 2>/dev/null | grep -q "^ii" && \
           ! dpkg -l "ros-humble-ros-gz" 2>/dev/null | grep -q "^ii"; then
            log_info "Ignition Gazebo not found - will be installed"
            NEEDS_GAZEBO_FIX=true
            NEEDS_NAV2_INSTALL=true
        else
            log_success "Ignition Gazebo is properly installed"
        fi
    fi
    
    # Check Nav2 packages
    if check_nav2_installed; then
        log_success "Nav2 packages are installed"
    else
        log_info "Nav2 packages need to be installed"
        NEEDS_NAV2_INSTALL=true
    fi
    
    # Check rosdep
    if check_rosdep_initialized; then
        log_success "rosdep is initialized"
    else
        log_info "rosdep needs to be initialized"
        NEEDS_ROSDEP_INIT=true
    fi
    
    # Check workspace
    if check_workspace_ready; then
        log_success "Workspace is set up and built"
    else
        if [ -d "${WORKSPACE_DIR}/src/${REPO_NAME}" ]; then
            log_info "Workspace exists but needs to be rebuilt"
            NEEDS_WORKSPACE_BUILD=true
        else
            log_info "Workspace needs to be set up"
            NEEDS_WORKSPACE_SETUP=true
            NEEDS_WORKSPACE_BUILD=true
        fi
    fi
    
    echo ""
    
    # Determine if anything needs to be done
    if [ "$NEEDS_ROS_INSTALL" = false ] && \
       [ "$NEEDS_REPO_FIX" = false ] && \
       [ "$NEEDS_GAZEBO_FIX" = false ] && \
       [ "$NEEDS_NAV2_INSTALL" = false ] && \
       [ "$NEEDS_ROSDEP_INIT" = false ] && \
       [ "$NEEDS_WORKSPACE_SETUP" = false ] && \
       [ "$NEEDS_WORKSPACE_BUILD" = false ]; then
        return 0  # Everything is ready
    else
        return 1  # Work needs to be done
    fi
}

# Fix conflicting ROS repository configurations
fix_ros_repository_conflicts() {
    log_info "Fixing ROS repository conflicts..."
    
    # Remove all ROS-related repository files
    sudo rm -f /etc/apt/sources.list.d/ros2.sources
    sudo rm -f /etc/apt/sources.list.d/ros2.list
    sudo rm -f /etc/apt/sources.list.d/ros2-latest.list
    sudo rm -f /etc/apt/sources.list.d/ros-latest.list
    
    # Clean apt cache
    sudo rm -rf /var/lib/apt/lists/*
    sudo mkdir -p /var/lib/apt/lists/partial
    
    log_success "Repository conflicts resolved"
}

# Install system dependencies
install_system_dependencies() {
    log_info "Installing system dependencies..."
    
    # Try without update first
    if ! sudo apt install -y --dry-run \
        locales curl gnupg lsb-release software-properties-common git &>/dev/null; then
        log_info "Updating package cache..."
        sudo apt update || error_exit "Failed to update package lists"
    fi
    
    sudo apt install -y \
        locales \
        curl \
        gnupg \
        lsb-release \
        software-properties-common \
        git || error_exit "Failed to install system dependencies"
    
    log_success "System dependencies installed"
}

# Setup locale
setup_locale() {
    log_info "Setting up locale..."
    
    sudo locale-gen en_US en_US.UTF-8 &> /dev/null || log_warning "Failed to generate locale"
    sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 || log_warning "Failed to update locale"
    export LANG=en_US.UTF-8
    
    log_success "Locale configured"
}

# Setup ROS 2 repository
setup_ros_repository() {
    log_info "Setting up ROS 2 repository..."
    
    # Download ROS 2 GPG key
    sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
        -o /usr/share/keyrings/ros-archive-keyring.gpg || error_exit "Failed to download ROS GPG key"
    
    # Add ROS 2 repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(lsb_release -cs) main" | \
    sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null || error_exit "Failed to add ROS repository"
    
    # Update is required after adding new repository
    log_info "Updating package lists for new repository..."
    sudo apt update || error_exit "Failed to update package lists after adding ROS repository"
    
    log_success "ROS 2 repository configured"
}

# Install ROS 2 Humble
install_ros2() {
    log_info "Installing ROS 2 Humble Desktop (this may take several minutes)..."
    
    sudo apt install -y ros-humble-desktop || error_exit "Failed to install ROS 2 Humble"
    
    log_success "ROS 2 Humble installed"
}

# Remove classic Gazebo and install Ignition Gazebo
fix_gazebo() {
    log_info "Fixing Gazebo installation..."

    # Remove classic Gazebo if present
    if check_classic_gazebo_installed; then
        log_info "Removing classic Gazebo packages..."
        sudo apt remove -y gazebo gazebo11 gazebo9 \
            libgazebo11 libgazebo11-dev \
            libgazebo-dev libgazebo11* 2>/dev/null || true
        sudo apt autoremove -y || true
        log_success "Classic Gazebo removed"
    fi

    # Verify classic Gazebo is gone
    if check_classic_gazebo_installed; then
        error_exit "Failed to remove classic Gazebo - please manually run: sudo apt remove gazebo* libgazebo*"
    fi

    # Install Ignition Gazebo via ros-gz
    log_info "Installing Ignition Gazebo (ros-humble-ros-gz)..."
    sudo apt update || error_exit "Failed to update package lists"
    sudo apt install -y ros-humble-ros-gz || error_exit "Failed to install Ignition Gazebo"

    log_success "Ignition Gazebo installed correctly"
}

# Install Nav2 and related packages
install_nav2_packages() {
    log_info "Installing Nav2 and dependencies (this may take several minutes)..."
    
    # Try without update first
    local need_update=false
    
    # Check if we can install without updating
    if ! sudo apt install -y --dry-run \
        ros-humble-nav2-bringup \
        ros-humble-turtlebot3 \
        python3-colcon-common-extensions &>/dev/null; then
        need_update=true
    fi
    
    if [ "$need_update" = true ]; then
        log_info "Package cache needs update..."
        sudo apt update || error_exit "Failed to update package lists"
    fi
    
    # Remove classic Gazebo first to avoid conflicts
    # (Handled separately by fix_gazebo() before this function is called)
    
    # Install Nav2 packages
    log_info "Installing Nav2..."
    sudo apt install -y ros-humble-nav2-bringup || error_exit "Failed to install Nav2"
    
    # Install only TurtleBot3 core packages (NOT the ones that depend on classic Gazebo)
    log_info "Installing TurtleBot3 core packages (excluding classic Gazebo dependencies)..."
    sudo apt install -y \
        ros-humble-turtlebot3 \
        ros-humble-turtlebot3-msgs \
        ros-humble-turtlebot3-description \
        ros-humble-turtlebot3-bringup \
        ros-humble-turtlebot3-teleop \
        ros-humble-turtlebot3-navigation2 \
        ros-humble-turtlebot3-cartographer || error_exit "Failed to install TurtleBot3 core packages"
    
    log_info "Skipping ros-humble-turtlebot3-gazebo (classic Gazebo) - workspace provides Ignition Gazebo integration"
    
    # Install remaining dependencies
    log_info "Installing development tools..."
    sudo apt install -y \
        python3-colcon-common-extensions \
        python3-rosdep \
        python3-vcstool || error_exit "Failed to install development tools"
    
    log_success "Nav2 and dependencies installed (using Ignition Gazebo)"
}

# Initialize rosdep
initialize_rosdep() {
    log_info "Initializing rosdep..."
    
    sudo rosdep init || error_exit "Failed to initialize rosdep"
    
    # Temporarily disable unbound variable check for ROS setup
    set +u
    source /opt/ros/humble/setup.bash || error_exit "Failed to source ROS setup"
    set -u
    
    rosdep update || error_exit "Failed to update rosdep"
    
    log_success "rosdep initialized and updated"
}

# Update rosdep (if already initialized)
update_rosdep() {
    set +u
    source /opt/ros/humble/setup.bash || error_exit "Failed to source ROS setup"
    set -u
    rosdep update &> /dev/null || error_exit "Failed to update rosdep"
}

# Setup workspace
setup_workspace() {
    log_info "Setting up workspace..."
    
    # Create workspace directory
    mkdir -p "${WORKSPACE_DIR}/src" || error_exit "Failed to create workspace directory"
    
    cd "${WORKSPACE_DIR}/src" || error_exit "Failed to navigate to workspace src directory"
    
    # Clone or update repository
    if [ -d "${REPO_NAME}" ]; then
        log_info "Repository already exists, pulling latest changes..."
        cd "${REPO_NAME}" || error_exit "Failed to navigate to repository directory"
        git pull || log_warning "Failed to pull latest changes"
        cd ..
    else
        log_info "Cloning navigation2 repository..."
        git clone "${REPO_URL}" || error_exit "Failed to clone repository"
    fi
    
    log_success "Workspace setup complete"
}

# Build workspace
build_workspace() {
    log_info "Building workspace (this may take several minutes)..."
    
    cd "${WORKSPACE_DIR}" || error_exit "Failed to navigate to workspace directory"
    
    # Temporarily disable unbound variable check for ROS setup
    set +u
    source /opt/ros/humble/setup.bash || error_exit "Failed to source ROS setup"
    set -u
    
    # Install workspace dependencies
    log_info "Installing workspace dependencies..."
    rosdep install --from-paths src --ignore-src -r -y || log_warning "Some dependencies may not have installed"
    
    # Build
    log_info "Compiling workspace..."
    colcon build --symlink-install || error_exit "Failed to build workspace"
    
    log_success "Workspace built successfully"
}

# Setup bashrc configuration
setup_bashrc() {
    local bashrc="${HOME}/.bashrc"
    local ros_source="source /opt/ros/humble/setup.bash"
    local ws_source="source ${WORKSPACE_DIR}/install/setup.bash"
    local tb3_export="export TURTLEBOT3_MODEL=waffle"
    
    # Check if lines already exist
    if grep -Fxq "$ros_source" "$bashrc" && \
       grep -Fxq "$ws_source" "$bashrc" && \
       grep -Fxq "$tb3_export" "$bashrc"; then
        return 0  # Already configured
    fi
    
    echo ""
    read -p "Add ROS and workspace sourcing to ~/.bashrc for automatic setup? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "" >> "$bashrc"
        echo "# ROS 2 Humble setup - Added by nav2_setup.sh on $(date)" >> "$bashrc"
        
        if ! grep -Fxq "$ros_source" "$bashrc"; then
            echo "$ros_source" >> "$bashrc"
        fi
        
        if ! grep -Fxq "$ws_source" "$bashrc"; then
            echo "$ws_source" >> "$bashrc"
        fi
        
        if ! grep -Fxq "$tb3_export" "$bashrc"; then
            echo "$tb3_export" >> "$bashrc"
        fi
        
        log_success "bashrc configured"
        return 0
    else
        log_skip "bashrc configuration skipped"
        return 1
    fi
}

# Print usage instructions
print_usage_instructions() {
    local bashrc_configured=false
    
    if grep -Fxq "source ${WORKSPACE_DIR}/install/setup.bash" "${HOME}/.bashrc" 2>/dev/null; then
        bashrc_configured=true
    fi
    
    echo ""
    echo "======================================================================"
    echo -e "${GREEN}  ✓ Everything is ready!${NC}"
    echo "======================================================================"
    echo ""
    echo "NOTE: Using Ignition Gazebo (not classic Gazebo)"
    echo ""
    
    if [ "$bashrc_configured" = true ]; then
        echo "Your environment is configured automatically via ~/.bashrc"
        echo "Restart your terminal or run: source ~/.bashrc"
        echo ""
        echo "Then simply run:"
        echo ""
        echo -e "  ${CYAN}ros2 launch turtlebot3 simulation.launch.py headless:=True use_rviz:=True${NC}"
    else
        echo "To use the workspace, run these commands in your terminal:"
        echo ""
        echo -e "  ${CYAN}source ${WORKSPACE_DIR}/install/setup.bash${NC}"
        echo -e "  ${CYAN}export TURTLEBOT3_MODEL=waffle${NC}"
        echo ""
        echo "Then launch the simulation:"
        echo ""
        echo -e "  ${CYAN}ros2 launch turtlebot3 simulation.launch.py gz_args:='-s' use_sim_time:=true"
        echo ""
        echo "To make this permanent, add these lines to ~/.bashrc:"
        echo "  source /opt/ros/humble/setup.bash"
        echo "  source ${WORKSPACE_DIR}/install/setup.bash"
        echo "  export TURTLEBOT3_MODEL=waffle"
    fi
    
    echo ""
    echo "======================================================================"
}

# Main execution
main() {
    echo ""
    echo "======================================================================"
    echo "  ROS 2 Humble + Nav2 Setup Script"
    echo "  Smart Installation & Configuration"
    echo "======================================================================"
    
    # Pre-flight checks
    check_not_sudo
    check_ubuntu_version
    check_internet
    
    # Analyze what needs to be done
    if analyze_system; then
        # Everything is already set up!
        echo -e "${GREEN}[✓] All components are already installed and configured!${NC}"
        print_usage_instructions
        exit 0
    fi
    
    # Show what will be done
    echo ""
    log_info "The following actions will be performed:"
    echo ""
    
    [ "$NEEDS_REPO_FIX" = true ] && echo "  • Fix ROS repository conflicts"
    [ "$NEEDS_ROS_INSTALL" = true ] && echo "  • Install ROS 2 Humble"
    [ "$NEEDS_GAZEBO_FIX" = true ] && echo "  • Remove classic Gazebo and install Ignition Gazebo"
    if [ "$NEEDS_NAV2_INSTALL" = true ]; then
        echo "  • Install Nav2 packages"
    fi
    [ "$NEEDS_ROSDEP_INIT" = true ] && echo "  • Initialize rosdep"
    [ "$NEEDS_WORKSPACE_SETUP" = true ] && echo "  • Setup workspace"
    [ "$NEEDS_WORKSPACE_BUILD" = true ] && echo "  • Build workspace"
    
    echo ""
    read -p "Continue with installation? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Installation cancelled by user"
        exit 0
    fi
    
    echo ""
    log_info "Starting installation..."
    echo ""
    
    # Fix repository conflicts if needed
    if [ "$NEEDS_REPO_FIX" = true ]; then
        fix_ros_repository_conflicts
    fi
    
    # Install ROS 2 if needed
    if [ "$NEEDS_ROS_INSTALL" = true ]; then
        install_system_dependencies
        setup_locale
        setup_ros_repository
        install_ros2
    else
        # Ensure repository is properly configured
        if [ "$NEEDS_REPO_FIX" = true ]; then
            setup_ros_repository
        fi
    fi
    
    # Fix Gazebo if needed (before Nav2 install)
    if [ "$NEEDS_GAZEBO_FIX" = true ]; then
        fix_gazebo
    fi
    
    # Install Nav2 if needed
    if [ "$NEEDS_NAV2_INSTALL" = true ]; then
        install_nav2_packages
    fi
    
    # Initialize rosdep if needed
    if [ "$NEEDS_ROSDEP_INIT" = true ]; then
        initialize_rosdep
    else
        # Update rosdep if it's already initialized
        update_rosdep
    fi
    
    # Setup workspace if needed
    if [ "$NEEDS_WORKSPACE_SETUP" = true ]; then
        setup_workspace
    fi
    
    # Build workspace if needed
    if [ "$NEEDS_WORKSPACE_BUILD" = true ]; then
        build_workspace
    fi
    
    # Offer to setup bashrc
    setup_bashrc
    
    # Print usage instructions
    echo ""
    log_success "Installation complete!"
    print_usage_instructions
}

# Run main function
main "$@"