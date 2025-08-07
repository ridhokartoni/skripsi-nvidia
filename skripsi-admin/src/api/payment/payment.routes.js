const express = require('express');
const { isAuthenticated } = require('../../middleware/middleware');
const router = express.Router();

const { 
    createPayment,
    getPaymentById,
    getAllPaymentByUserId,
    getAllPayment,
    deletePayment,
    updatePaymentStatus,
    updatePaymentStatusWithReason
} = require('./payment.services');
const { getPaketById } = require('../paket/paket.services');
const { findUserById, updateUserById } = require('../users/users.services');

//create endpoint post / for create payment
router.post('/', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const { tujuanPenelitian, pj } = req.body;
        const paketId = parseInt(req.body.paketId);
        const harga = parseInt(req.body.harga);

        console.log(req.body);
        //print all variable
        console.log(tujuanPenelitian, pj, paketId, harga);
        if (!tujuanPenelitian || !pj || !paketId || !harga) {
            res.status(400);
            throw new Error('Anda harus memberikan tujuanPenelian, pj, paketId, dan harga.');
        }

        //check paket
        const paket = await getPaketById(paketId);
        if (!paket) {
            res.status(404);
            throw new Error('Paket tidak ditemukan.');
        }

        const status = 0;
        const payment = await createPayment({
            tujuanPenelitian,
            paketId,
            harga,
            userId,
            status
        });
        //update pj for user
        const user = await updateUserById(userId, { pj });
        console.log(user);
        
        res.status(201).json({
            data: payment,
            meta: {
                code: 201,
                message: 'Berhasil membuat pembayaran',
            }
        });
    } catch (err) {
        next(err);
    }
});

//endpoint to get all payment by userId
router.get('/mypayments', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const payments = await getAllPaymentByUserId(userId);
        res.status(200).json({
            data: payments,
            meta: {
                code: 200,
                message: 'Berhasil mengambil semua pembayaran',
            }
        });
    } catch (err) {
        next(err);
    }
});

//endpoint to get all payment by admin
router.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const user = await findUserById(userId);
        if (!user.isAdmin) {
            res.status(403);
            throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
        }

        const payments = await getAllPayment();
        res.status(200).json({
            data: payments,
            meta: {
                code: 200,
                message: 'Berhasil mengambil semua pembayaran',
            }
        });
    } catch (err) {
        next(err);
    }
});

//endpoint to delete payment by admin
router.delete('/:paymentId', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const { paymentId } = req.params;
        const payment = await getPaymentById(parseInt(paymentId));
        if (!payment) {
            res.status(404);
            throw new Error('Pembayaran tidak ditemukan.');
        }

        const user = await findUserById(userId);
        if (!user.isAdmin) {
            res.status(403);
            throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
        }

        await deletePayment(parseInt(paymentId));
        res.status(201).json({
            data: payment,
            meta: {
                code: 201,
                message: 'Berhasil menghapus pembayaran',
            }
        });
    } catch (err) {
        next(err);
    }
});

//endpoint to update status payment by admin
router.patch('/:paymentId', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const { paymentId } = req.params;
        const { status, rejectionReason } = req.body;
        
        // Validate status value
        if (status !== 0 && status !== 1 && status !== 2) {
            res.status(400);
            throw new Error('Status tidak valid. Gunakan 0 (pending), 1 (approved), atau 2 (rejected).');
        }
        
        // If rejecting, require rejection reason
        if (status === 2 && !rejectionReason) {
            res.status(400);
            throw new Error('Alasan penolakan harus diisi untuk status ditolak.');
        }
        
        const payment = await getPaymentById(parseInt(paymentId));
        if (!payment) {
            res.status(404);
            throw new Error('Pembayaran tidak ditemukan.');
        }

        const user = await findUserById(userId);
        if (!user.isAdmin) {
            res.status(403);
            throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
        }

        const updateData = { status };
        if (status === 2 && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }
        
        const updatePayment = await updatePaymentStatusWithReason(parseInt(paymentId), updateData);
        
        let message = 'Berhasil mengubah status pembayaran';
        if (status === 1) message = 'Pembayaran berhasil disetujui';
        if (status === 2) message = 'Pembayaran berhasil ditolak';
        
        res.status(201).json({
            data: updatePayment,
            meta: {
                code: 201,
                message,
            }
        });
    } catch (err) {
        next(err);
    }
});
module.exports = router;