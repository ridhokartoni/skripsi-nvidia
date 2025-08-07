const bcrypt = require('bcryptjs');
const { db } = require('../../utils/db');

function findUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

function createUserByEmailAndPassword(user) {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
}

function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

//create function for list all user in db don't return password sort by id
function listAllUser() {
  return db.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      noHp: true,
      isMahasiswa: true,
      isAdmin: true,
      pj: true,
      nik: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
}

//function to update user by id
function updateUserById(id, user) {
  return db.user.update({
    where: {
      id,
    },
    data: user,
  });
}

//function to listAllUserDropdown
function listAllUserDropdown() {
  return db.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
}
module.exports = {
  findUserByEmail,
  findUserById,
  createUserByEmailAndPassword,
  listAllUser,
  updateUserById,
  listAllUserDropdown
};
