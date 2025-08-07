const { db } = require('../../utils/db');

//create function to create payment
function createPayment(payment) {
  return db.Payment.create({
    data: payment,
  });
}

//get payment by id
function getPaymentById(id) {
  return db.Payment.findUnique({
    where: {
      id,
    },
  });
}

//get all payment by user id
function getAllPaymentByUserId(userId) {
  return db.Payment.findMany({
    where: {
      userId,
    },
    include: {
      user: true,
      paket: true
    }
  });
}

//get all payment all user
function getAllPayment() {
  return db.Payment.findMany({
    include: {
      user: true,
      paket: true
    }
  });
}

//delete payment
function deletePayment(id) {
  return db.Payment.delete({
    where: {
      id,
    },
  });
}

//update status payment
function updatePaymentStatus(id, status) {
  return db.Payment.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

//update payment status with reason
function updatePaymentStatusWithReason(id, data) {
  return db.Payment.update({
    where: {
      id,
    },
    data,
    include: {
      user: true,
      paket: true
    }
  });
}

module.exports = { 
    createPayment,
    getPaymentById,
    getAllPaymentByUserId,
    getAllPayment,
    deletePayment,
    updatePaymentStatus,
    updatePaymentStatusWithReason
};
