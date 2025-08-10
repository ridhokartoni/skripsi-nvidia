# System Monitoring Feature Documentation

## Overview
The System Monitoring page provides real-time monitoring of all containers and manually registered GPUs in the system. This feature is accessible only to administrators and offers comprehensive insights into resource utilization.

## Features

### 1. Real-Time Updates
- **Auto-refresh**: Updates every 500ms (0.5 seconds) for near real-time monitoring
- **Toggle Control**: Can enable/disable auto-refresh as needed
- **Last Update Timestamp**: Shows when data was last refreshed

### 2. GPU Monitoring
Displays only GPUs that have been manually added through the GPU Management page:
- **Live Status**: Online/Offline/Error indicators
- **Utilization Metrics**:
  - GPU utilization percentage with progress bar
  - Memory usage (used/total) with visual indicator
  - Temperature monitoring with color-coded warnings (red when >80°C)
  - Power draw (when available)
- **Device Information**: Shows GPU name and device ID

### 3. Container Monitoring
Comprehensive view of all containers across all users:
- **Container Details**:
  - Container name and image
  - Current status (running/stopped/error)
- **Resource Metrics**:
  - CPU usage with progress bar
  - Memory usage with visual representation
  - Network I/O (received/transmitted bytes)
- **Tabular Layout**: Easy-to-scan table format for multiple containers

## Technical Implementation

### Frontend Component
**Location**: `/src/app/admin/monitoring/page.tsx`

### Key Features:
1. **Parallel Data Fetching**: Fetches container and GPU data simultaneously
2. **Error Resilience**: Continues functioning even if individual stats fail
3. **Performance Optimized**: Uses React callbacks to prevent unnecessary re-renders
4. **Visual Feedback**: Progress bars and color coding for quick status assessment

### API Endpoints Used:
- `GET /api/v1/docker/allcontainer` - Fetch all containers
- `GET /api/v1/docker/container/{name}/stats` - Get container statistics
- `GET /api/v1/gpu` - Get registered GPUs
- `GET /api/v1/gpu/discover` - Get live GPU statistics

## Usage

### Accessing the Monitoring Page
1. Login as an administrator
2. Navigate to "Monitoring" in the admin sidebar (second item in menu)
3. The page will automatically start refreshing data

### Reading the Dashboard

#### GPU Section
- **Green checkmark**: GPU is online and functioning
- **Gray warning**: GPU is offline
- **Red warning**: Error fetching GPU stats
- **Progress bars**: Visual representation of utilization

#### Container Section
- **Table columns**:
  - Container Name: Identifies the container
  - Status: Current operational state
  - CPU Usage: Percentage and visual bar
  - Memory Usage: Actual vs limit with progress bar
  - Network I/O: Download/Upload traffic

### Auto-Refresh Control
- **Green button**: Auto-refresh is ON (default)
- **Gray button**: Auto-refresh is OFF
- Click to toggle between states
- The refresh icon spins when auto-refresh is active

## Performance Considerations

### Refresh Rate
- Set to 500ms (0.5 seconds) for responsive monitoring
- Can be adjusted in the code if needed for performance

### Network Usage
- Each refresh fetches data for all containers and GPUs
- Consider network bandwidth in production environments
- Error handling prevents cascading failures

### Browser Performance
- Uses React's optimization features
- Cleanup of intervals on component unmount
- Efficient state management to minimize re-renders

## Security
- **Admin-only access**: Protected by authentication middleware
- **Read-only operations**: No system modifications possible
- **Error isolation**: Individual failures don't affect overall functionality

## Future Enhancements
Potential improvements for consideration:
1. Historical data graphs
2. Alert thresholds for resource usage
3. Export functionality for metrics
4. Customizable refresh intervals
5. Container grouping by user
6. GPU allocation tracking
7. Resource usage predictions

## Troubleshooting

### No GPU Data Showing
- Ensure GPUs are added via GPU Management page
- Check if nvidia-smi is available on the host
- Verify GPU discovery endpoint is accessible

### Container Stats Not Loading
- Verify containers are running
- Check Docker API accessibility
- Ensure proper permissions for stats endpoint

### Page Not Refreshing
- Check auto-refresh toggle status
- Verify network connectivity
- Check browser console for errors

## Related Pages
- **GPU Management** (`/admin/gpu`): Add/manage GPU resources
- **All Containers** (`/admin/containers`): Detailed container management
- **Dashboard** (`/admin`): Summary statistics

## Files Modified
- `/src/app/admin/monitoring/page.tsx` - New monitoring page component
- `/src/components/layout/DashboardLayout.tsx` - Added navigation link

This monitoring system provides administrators with essential real-time visibility into system resources, helping ensure optimal performance and resource allocation.
