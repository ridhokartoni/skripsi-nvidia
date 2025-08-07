const express = require('express');
const { isAuthenticated } = require('../../middleware/middleware');

const {
    createPaket,
    getPaketById,
    getAllPaket,
    deletePaket
} = require('./paket.services');

const {
    findUserById
} = require('../users/users.services');

const router = express.Router();


router.post('/', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const { name } = req.body;
        //CPU, RAM, GPU, harga, durasi is integer
        const CPU = parseInt(req.body.CPU);
        const RAM = parseInt(req.body.RAM);
        const GPU = parseInt(req.body.GPU);
        const harga = parseInt(req.body.harga);
        const durasi = parseInt(req.body.durasi);

        //print all variable
        console.log(name, CPU, RAM, GPU, harga, durasi);
        if (!name || !CPU || !RAM || !GPU || !harga || !durasi) {
            res.status(400);
            throw new Error('Anda harus memberikan name, CPU, RAM, GPU, harga, dan durasi.');
        }

        //check is user admin
        const user = await findUserById(userId);
        if (!user.isAdmin) {
            res.status(403);
            throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
        }

        const paket = await createPaket({
            name,
            CPU,
            RAM,
            GPU,
            harga,
            durasi
        });
    
        res.status(201).json({
            data: paket,
            meta: {
                code: 201,
                message: 'Berhasil membuat paket',
            }
        });
    } catch (err) {
        next(err);
    }
});

router.get('/', isAuthenticated, async (req, res, next) => {
    try {
        // All authenticated users can view packages
        const paket = await getAllPaket();
        res.status(200).json({
            data: paket,
            meta: {
                code: 200,
                message: 'Berhasil mengambil semua paket',
            }
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/:paketId', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const { paketId } = req.params;
        const paket = await getPaketById(parseInt(paketId));
        if (!paket) {
            res.status(404);
            throw new Error('Paket tidak ditemukan.');
        }

        const user = await findUserById(userId);
        if (!user.isAdmin) {
            res.status(403);
            throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
        }

        await deletePaket(parseInt(paketId));
        res.status(201).json({
            data: paket,
            meta: {
                code: 201,
                message: 'Berhasil menghapus paket',
            }
        });
    } catch (err) {
        next(err);
    }
});

//create endpoint to generate harga random last 3 digit based on paket for user
router.get('/generate-harga/:paketId', isAuthenticated, async (req, res, next) => {
    try {
        const { paketId } = req.params;
        const paket = await getPaketById(parseInt(paketId));
        if (!paket) {
            res.status(404);
            throw new Error('Paket tidak ditemukan.');
        }
        //make the random under 300
        const randomHarga = Math.floor(Math.random() * 300);
        console.log(randomHarga);
        const harga = parseInt(paket.harga) + randomHarga;
        console.log(harga);
        res.status(200).json({
            data: {
                harga
            },
            meta: {
                code: 200,
                message: 'Berhasil menggenerate harga',
            }
        });
    } catch (err) {
        next(err);
    }
});



module.exports = router;