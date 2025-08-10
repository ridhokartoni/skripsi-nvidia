const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

/**
 * Get stats for multiple containers in a single Docker command
 * This is much faster than individual calls
 */
async function getBatchContainerStats(containerNames) {
    if (!containerNames || containerNames.length === 0) {
        return {};
    }

    try {
        // Get stats for all containers in one command
        const command = `docker stats ${containerNames.join(' ')} --no-stream --format "{{ json . }}"`;
        const { stdout } = await execPromise(command, { maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer
        
        if (!stdout) {
            return {};
        }

        // Parse each line as a separate JSON object
        const lines = stdout.trim().split('\n').filter(line => line);
        const statsMap = {};
        
        for (const line of lines) {
            try {
                const stats = JSON.parse(line);
                // Use the Name field from docker stats output
                if (stats.Name) {
                    statsMap[stats.Name] = stats;
                }
            } catch (parseErr) {
                console.error('Error parsing stats line:', parseErr);
            }
        }
        
        return statsMap;
    } catch (error) {
        console.error('Error fetching batch container stats:', error);
        return {};
    }
}

/**
 * Get basic container info (status) for multiple containers
 * Uses docker inspect which is faster than stats for basic info
 */
async function getBatchContainerStatus(containerNames) {
    if (!containerNames || containerNames.length === 0) {
        return {};
    }

    try {
        // Get status for all containers in one command
        const command = `docker inspect ${containerNames.join(' ')} --format '{{.Name}}:{{.State.Status}}:{{.State.Pid}}'`;
        const { stdout } = await execPromise(command);
        
        if (!stdout) {
            return {};
        }

        // Parse the output
        const lines = stdout.trim().split('\n').filter(line => line);
        const statusMap = {};
        
        for (const line of lines) {
            const [nameWithSlash, status, pid] = line.split(':');
            // Remove leading slash from container name
            const name = nameWithSlash.startsWith('/') ? nameWithSlash.substring(1) : nameWithSlash;
            statusMap[name] = {
                status: status || 'unknown',
                pid: parseInt(pid) || 0
            };
        }
        
        return statusMap;
    } catch (error) {
        console.error('Error fetching batch container status:', error);
        return {};
    }
}

module.exports = {
    getBatchContainerStats,
    getBatchContainerStatus
};
