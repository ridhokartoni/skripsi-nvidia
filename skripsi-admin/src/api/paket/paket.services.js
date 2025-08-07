const { db } = require('../../utils/db');

function createPaket(paket) {
    return db.Paket.create({
        data: paket,
    });
}

function getPaketById(id) {
    return db.Paket.findUnique({
        where: {
            id,
        },
    });
}

function getAllPaket() {
    return db.Paket.findMany();
}

function deletePaket(id) {
    return db.Paket.delete({
        where: {
            id,
        },
    });
}
module.exports = {
    createPaket,
    getPaketById,
    getAllPaket,
    deletePaket
};