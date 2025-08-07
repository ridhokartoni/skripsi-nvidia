const express = require('express');

const auth = require('./auth/auth.routes');
const users = require('./users/users.routes');
const docker =require('./docker/docker.routes');
const tiket = require('./tiket/tiket.routes');
const paket = require('./paket/paket.routes');
const payment = require('./payment/payment.routes');
const gpu = require('./gpu/gpu.routes');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - Connect Succeed',
  });
});

router.use('/auth', auth);
router.use('/users', users);
router.use('/docker',docker);
router.use('/tiket', tiket);
router.use('/paket', paket);
router.use('/payment', payment);
router.use('/gpu', gpu);


module.exports = router;
