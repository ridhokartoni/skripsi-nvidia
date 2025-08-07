const express = require('express');
const { isAuthenticated } = require('../../middleware/middleware');

const { 
    createTiket, 
    getTiketById, 
    updateTiketStatus, 
    getTiketByUserId, 
    getAllTiket, 
    deleteTiket 
} = require('./tiket.services');
const {
    findUserById
} = require('../users/users.services');
const {
    getContainerByName,
    getContainerById
} = require('../docker/docker.services');
const { parse } = require('dotenv');

const router = express.Router();

//create endpoint to create tiket for a container
router.post('/:containerName', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const { containerName } = req.params;
        const { deskripsi } = req.body;

        if (!containerName || !deskripsi) {
            res.status(400);
            throw new Error('Anda harus memberikan containerName dan deskripsi.');
        }

        const container = await getContainerByName(containerName);
        if (!container) {
            res.status(404);
            throw new Error('Container tidak ditemukan.');
        }
        //check if the container is this user's container
        if (container.userId !== userId) {
            res.status(403);
            throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
        }

        const containerId = container.id;
        const tiket = await createTiket({
            containerId,
            deskripsi,
            status: 'open'
        });

        res.status(201).json({
            data: tiket,
            meta:{
                code:201,
                message: 'Berhasil membuat tiket',
            }
        });
    } catch (err) {
        next(err);
    }
});

//create endpoint to update status for tiket
router.patch('/:tiketId', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        //get tiket id from params and make it int
        const tiketId = parseInt(req.params.tiketId);
        console.log(tiketId);
        console.log(typeof(tiketId));

        const { status } = req.body;
        if (!status) {
            res.status(400);
            throw new Error('Anda harus memberikan status.');
        }

        const tiket = await getTiketById(tiketId);
        //get container by tiket
        const container = await getContainerById(tiket.containerId);
        if (!container) {
            res.status(404);
            throw new Error('Container tidak ditemukan.');
        }
        //check if the container is this user's container or isAdmin true in that user
        if (container.userId !== userId) {
            const user = await findUserById(userId);
            if (!user.isAdmin) {
                res.status(403);
                throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
            }
        }

        const newStatus = await updateTiketStatus(tiketId, status);

        res.status(201).json({
            data: newStatus,
            meta:{
                code:201,
                message: 'Berhasil mengubah status tiket',
            }
        });
    } catch (err) {
        next(err);
    }
});

//create endpoint to get all tiket in that user
router.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const tikets = await getTiketByUserId(userId);
        res.status(200).json({
            data: tikets,
            meta:{
                code:200,
                message: 'Berhasil mengambil semua tiket',
            }
        });
    } catch (err) {
        next(err);
    }
});

//create endpoint to get all tiket in all user add filter status as optional
router.get('/all', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const user = await findUserById(userId);
        if (!user.isAdmin) {
            res.status(403);
            throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
        }

        const { status } = req.body;
        console.log(status);
        const tikets = await getAllTiket(status);
        res.status(200).json({
            data: tikets,
            meta:{
                code:200,
                message: 'Berhasil mengambil semua tiket',
            }
        });
    } catch (err) {
        next(err);
    }
});

//create endpoint to delete tiket
// router.delete('/:id', isAuthenticated, async (req, res, next) => {
//     try {
//         const { userId } = req.payload;
//         const id = parseInt(req.params.id);

//         const user = await findUserById(userId);
//         if (!user.isAdmin) {
//             res.status(403);
//             throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
//         }

//         const tiket = await deleteTiket(id);

//         res.status(201).json({
//             data: tiket,
//             meta:{
//                 code:201,
//                 message: 'Berhasil menghapus tiket',
//             }
//         });
//     } catch (err) {
//         next(err);
//     }
// });

module.exports = router;