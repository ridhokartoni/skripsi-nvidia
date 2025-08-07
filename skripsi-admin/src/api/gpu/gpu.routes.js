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
        //get name from request body
        const { name } = req.body;
        console.log(name);
        //check if name is empty
        if (!name) {
            res.status(400).json({
                data: {},
                meta:{
                    code: 400,
                    message: 'Name is required',
                }
            });
            return;
        }

        const gpu = await createGpu(req.body);
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
        const { name } = req.body;
        console.log(name);
        const newGPU = await updateGpu(gpuId, name);
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