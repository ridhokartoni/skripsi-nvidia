const { db } = require('../../utils/db');

//create function to create tiket for a container
function createTiket(tiket) {
  return db.Tiket.create({
    data: tiket,
  });
}

//create function to get tiket by id
function getTiketById(id) {
  return db.Tiket.findUnique({
    where: {
      id,
    },
  });
}

//create function to update status for tiket
function updateTiketStatus(id, status) {
  return db.Tiket.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}


//create function to get all tiket that have relation container in that user
function getTiketByUserId(userId) {
  return db.Tiket.findMany({
    where: {
      OR: [
        {
          container: {
            userId,
          },
        },
        // Also include tickets where container was deleted (null) if needed
        // You might want to exclude these or handle them differently
      ]
    },
    include: {
      container: true
    }
  });
}


//create function to get all tiket in all user have parameter status filter optional
function getAllTiket(status) {
  if (status) {
    return db.Tiket.findMany({
      where: {
        status,
      },
      include: {
        container: {
          include: {
            user: true
          }
        }
      }
    });
  }
  return db.Tiket.findMany({
    include: {
      container: {
        include: {
          user: true
        }
      }
    }
  });
}


//create function to delete tiket
function deleteTiket(id) {
  return db.Tiket.delete({
    where: {
      id,
    },
  });
}
module.exports = {
    createTiket,
    getTiketById,
    updateTiketStatus,
    getTiketByUserId,
    getAllTiket,
    deleteTiket,
};