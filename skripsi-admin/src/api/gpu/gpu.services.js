const { db } = require('../../utils/db');
//function create gpu
function createGpu(gpu) {
  return db.GPU.create({
    data: gpu,
  });
}
//function to get all gpu
function getGpus() {
  return db.GPU.findMany();
}
//function to get gpu by id
function getGpuById(id) {
  return db.GPU.findUnique({
    where: {
      id,
    },
  });
}
//function to update gpu change name
function updateGpu(id, gpu) {
  return db.GPU.update({
    where: {
      id,
    },
    data: {
        name: gpu,
    },
  });
}
//function to delete gpu
function deleteGpu(id) {
  return db.GPU.delete({
    where: {
      id,
    },
  });
}
module.exports = {
    createGpu,
    getGpus,
    getGpuById,
    updateGpu,
    deleteGpu,
};