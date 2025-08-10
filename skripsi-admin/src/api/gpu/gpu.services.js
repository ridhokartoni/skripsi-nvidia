const { db } = require('../../utils/db');
const { exec } = require('child_process');

//function create gpu
function createGpu(gpu) {
  return db.GPU.create({
    data: gpu,
  });
}
//function to get all gpu
function getGpus() {
  return db.GPU.findMany();
}
//function to get gpu by id
function getGpuById(id) {
  return db.GPU.findUnique({
    where: {
      id,
    },
  });
}
//function to update gpu fields (name and/or deviceId)
function updateGpu(id, data) {
  return db.GPU.update({
    where: {
      id,
    },
    data,
  });
}
//function to delete gpu
function deleteGpu(id) {
  return db.GPU.delete({
    where: {
      id,
    },
  });
}

// Live discovery of GPUs using nvidia-smi. No DB changes.
function discoverGpus() {
  // Query key GPU attributes in a CSV to simplify parsing
  const query = [
    'index',
    'uuid',
    'name',
    'driver_version',
    'vbios_version',
    'memory.total',
    'memory.used',
    'utilization.gpu',
    'temperature.gpu',
    'clocks.sm',
    'compute_mode',
  ].join(',');

  const cmd = `nvidia-smi --query-gpu=${query} --format=csv,noheader,nounits`;

  return new Promise((resolve) => {
    exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout) => {
      if (err) {
        // Gracefully handle hosts without NVIDIA GPUs
        return resolve([]);
      }
      const lines = stdout.trim().split('\n').filter(Boolean);
      const gpus = lines.map((line) => {
        const parts = line.split(',').map((s) => s.trim());
        const [
          index,
          uuid,
          name,
          driverVersion,
          vbiosVersion,
          memTotal,
          memUsed,
          util,
          temp,
          smClock,
          computeMode,
        ] = parts;
        return {
          index: Number(index),
          uuid,
          name,
          driverVersion,
          vbiosVersion,
          memoryTotalMB: Number(memTotal),
          memoryUsedMB: Number(memUsed),
          utilizationPercent: Number(util),
          temperatureC: Number(temp),
          smClockMHz: Number(smClock),
          computeMode,
        };
      });
      resolve(gpus);
    });
  });
}

// MIG summary and instances (best-effort; return [] if unavailable)
function discoverMigSummary() {
  const cmd = 'nvidia-smi mig -lgi';
  return new Promise((resolve) => {
    exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout) => {
      if (err) return resolve([]);
      const lines = stdout.split('\n').map((l) => l.trim()).filter(Boolean);
      // Basic parse: GI <id> on GPU <index>: <profile> ...
      const items = lines.map((l) => ({ line: l }));
      resolve(items);
    });
  });
}

function discoverMigInstances() {
  const cmd = 'nvidia-smi mig -lci';
  return new Promise((resolve) => {
    exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout) => {
      if (err) return resolve([]);
      const lines = stdout.split('\n').map((l) => l.trim()).filter(Boolean);
      const items = lines.map((l) => ({ line: l }));
      resolve(items);
    });
  });
}

// NVLink/NVSwitch topology matrix (best-effort)
function discoverTopology() {
  const cmd = 'nvidia-smi topo -m';
  return new Promise((resolve) => {
    exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout) => {
      if (err) return resolve({ raw: '' });
      resolve({ raw: stdout });
    });
  });
}

module.exports = {
    createGpu,
    getGpus,
    getGpuById,
    updateGpu,
    deleteGpu,
    discoverGpus,
    discoverMigSummary,
    discoverMigInstances,
    discoverTopology,
};
