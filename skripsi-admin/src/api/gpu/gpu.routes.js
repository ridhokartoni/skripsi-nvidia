const express = require('express');
const { isAuthenticated } = require('../../middleware/middleware');
const router = express.Router();

//import finduserbyid
const { findUserById } = require('../users/users.services');

const {
  createGpu,
  getGpus,
  getGpuById,
  updateGpu,
  deleteGpu,
  discoverGpus,
  discoverMigSummary,
  discoverMigInstances,
  discoverTopology,
} = require('./gpu.services');

router.post('/', isAuthenticated, async (req, res) => {
    try {
        //validate user is admin
        const user = await findUserById(req.userId);
        if (!user.isAdmin) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to delete this container',
                }
            });
            return;
        }
        //get name and deviceId from request body
        const { name, deviceId } = req.body;
        //validate
        if (!name || typeof deviceId === 'undefined') {
            res.status(400).json({
                data: {},
                meta:{
                    code: 400,
                    message: 'Name and deviceId are required',
                }
            });
            return;
        }
        if (Number.isNaN(parseInt(deviceId))) {
            res.status(400).json({
                data: {},
                meta: { code: 400, message: 'deviceId must be an integer device index' }
            });
            return;
        }

        const gpu = await createGpu({ name, deviceId: parseInt(deviceId) });
        res.status(201).json({
            data: gpu,
            meta:{
                code: 201,
                message: 'Gpu created successfully',
            }
        });
    } catch (error) {
        res.status(400).json(
            { 
                data: {},
                meta:{
                    code: 400,
                    message: error.message,
                }
            }
        );
    }
    }
);

router.get('/', isAuthenticated, async (req, res) => {
    try {
        //validate user is admin
        const user = await findUserById(req.userId);
        if (!user.isAdmin) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to delete this container',
                }
            });
            return;
        }
        const gpus = await getGpus();
        res.status(200).json({
            data: gpus,
            meta:{
                code: 200,
                message: 'Gpus retrieved successfully',
            }
        });
    } catch (error) {
        res.status(400).json(
            { 
                data: {},
                meta:{
                    code: 400,
                    message: error.message,
                }
            }
        );
    }
});

// Live discovery endpoint for DGX GPUs
router.get('/discover', isAuthenticated, async (req, res) => {
    try {
        const user = await findUserById(req.userId);
        if (!user.isAdmin) {
            res.status(403).json({
                data: {},
                meta: { code: 403, message: 'Forbidden: You are not authorized to access this resource' }
            });
            return;
        }
        const discovered = await discoverGpus();
        res.status(200).json({
            data: discovered,
            meta: { code: 200, message: discovered.length ? 'GPU discovery successful' : 'No GPU data available on host' }
        });
    } catch (error) {
        res.status(200).json({
            data: [],
            meta: { code: 200, message: 'GPU discovery unavailable on this host' }
        });
    }
});

// MIG discovery (safe on hosts without MIG) – returns arrays of lines for now
router.get('/mig/summary', isAuthenticated, async (req, res) => {
    const user = await findUserById(req.userId);
    if (!user.isAdmin) {
        res.status(403).json({ data: {}, meta: { code: 403, message: 'Forbidden' } });
        return;
    }
    const data = await discoverMigSummary();
    res.status(200).json({ data, meta: { code: 200, message: data.length ? 'MIG summary' : 'MIG data unavailable' } });
});

router.get('/mig/instances', isAuthenticated, async (req, res) => {
    const user = await findUserById(req.userId);
    if (!user.isAdmin) {
        res.status(403).json({ data: {}, meta: { code: 403, message: 'Forbidden' } });
        return;
    }
    const data = await discoverMigInstances();
    res.status(200).json({ data, meta: { code: 200, message: data.length ? 'MIG instances' : 'MIG instances unavailable' } });
});

// NVLink/NVSwitch topology matrix (raw text for now)
router.get('/topology', isAuthenticated, async (req, res) => {
    const user = await findUserById(req.userId);
    if (!user.isAdmin) {
        res.status(403).json({ data: {}, meta: { code: 403, message: 'Forbidden' } });
        return;
    }
    const data = await discoverTopology();
    res.status(200).json({ data, meta: { code: 200, message: data.raw ? 'Topology matrix' : 'Topology unavailable' } });
});

router.patch('/:id', isAuthenticated, async (req, res) => {
    try {
        //validate user is admin
        const user = await findUserById(req.userId);
        if (!user.isAdmin) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to delete this container',
                }
            });
            return;
        }
        //check if gpu exists and convert to int using parse int
        const gpuId = parseInt(req.params.id);
        const gpu = await getGpuById(gpuId);
        if (!gpu) {
            res.status(404).json({
                data: {},
                meta:{
                    code: 404,
                    message: 'Gpu not found',
                }
            });
            return;
        }
        const { name, deviceId } = req.body;
        const data = {};
        if (typeof name !== 'undefined') data.name = name;
        if (typeof deviceId !== 'undefined') {
            if (Number.isNaN(parseInt(deviceId))) {
                res.status(400).json({ data: {}, meta: { code: 400, message: 'deviceId must be an integer device index' } });
                return;
            }
            data.deviceId = parseInt(deviceId);
        }
        const newGPU = await updateGpu(gpuId, data);
        res.status(200).json({
            data: newGPU,
            meta:{
                code: 200,
                message: 'Gpu updated successfully',
            }
        });
    } catch (error) {
        res.status(400).json(
            { 
                data: {},
                meta:{
                    code: 400,
                    message: error.message,
                }
            }
        );
    }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        //validate user is admin
        const user = await findUserById(req.userId);
        const gpuId = parseInt(req.params.id);
        if (!user.isAdmin) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to delete this container',
                }
            });
            return;
        }
        //check gpu exist
        const gpu = await getGpuById(gpuId);
        if (!gpu) {
            res.status(404).json({
                data: {},
                meta:{
                    code: 404,
                    message: 'Gpu not found',
                }
            });
            return;
        }
        const deleted = await deleteGpu(gpuId);
        res.status(201).json({
            data: deleted,
            meta:{
                code: 201,
                message: 'Gpu deleted successfully',
            }
        });
    } catch (error) {
        res.status(400).json(
            { 
                data: {},
                meta:{
                    code: 400,
                    message: error.message,
                }
            }
        );
    }
});

module.exports = router;
