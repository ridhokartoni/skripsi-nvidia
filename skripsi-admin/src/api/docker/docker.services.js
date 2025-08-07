const { db } = require('../../utils/db');
const net = require('net');

function findUserById(id) {
  return db.User.findUnique({
    where: {
      id,
    },
  });
}

//create function to get container details from db
function getContainerByName(name) {
  return db.Container.findUnique({
    where: {
      name,
    },
  });
}

//create function to get all container in that user
function getContainersByUserId(userId) {
  return db.Container.findMany({
    where: {
      userId,
    },
  });
}

//create function to delete container
async function deleteContainer(id) {
  // First delete all related tickets
  await db.Tiket.deleteMany({
    where: {
      containerId: id,
    },
  });
  
  // Then delete the container
  return db.Container.delete({
    where: {
      id,
    },
  });
}

async function createContainer(container) {
  return db.Container.create({
    data: container,
  });
}

async function getAvailablePort(min, max) {
  const port = Math.floor(Math.random() * (max - min + 1)) + min;

  // Query the database to check if the port is in use
  const result = await db.container.findMany({
    where: {
      OR: [
        { sshPort: port },
        { jupyterPort: port }
      ]
    }
  });

  if (result.length > 0) {
    // If the port is in use, recursively call the function to get a new port
    return getAvailablePort(min, max);
  } else {
    // If the port is not in use, return it
    return port;
  }
}

//get container by id
function getContainerById(id) {
  return db.Container.findUnique({
    where: {
      id,
    },
  });
}

//get container all
function getAllContainer() {
  return db.Container.findMany();
}

//changet container password
function updatePassword(name, password) {
  return db.Container.update({
    where: {
      name,
    },
    data: {
      password,
    },
  });
}

module.exports = {
  findUserById,
  getAvailablePort,
  createContainer,
  getContainerByName,
  getContainersByUserId,
  deleteContainer,
  getContainerById,
  getAllContainer,
  updatePassword
};