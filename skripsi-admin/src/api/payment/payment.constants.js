// Payment Status Constants
const PAYMENT_STATUS = {
    PENDING: 0,    // Menunggu konfirmasi admin
    APPROVED: 1,   // Disetujui oleh admin
    REJECTED: 2    // Ditolak oleh admin
};

const PAYMENT_STATUS_TEXT = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected'
};

const PAYMENT_STATUS_TEXT_ID = {
    0: 'Menunggu Konfirmasi',
    1: 'Disetujui',
    2: 'Ditolak'
};

module.exports = {
    PAYMENT_STATUS,
    PAYMENT_STATUS_TEXT,
    PAYMENT_STATUS_TEXT_ID
};
