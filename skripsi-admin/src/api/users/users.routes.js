const express = require('express');
const { isAuthenticated } = require('../../middleware/middleware');
const { findUserById, listAllUser, findUserByEmail, listAllUserDropdown, updateUserById } = require('./users.services');
const { db } = require('../../utils/db');

const router = express.Router();
// const { upload, uploadToStorage } = require('../../middleware/multer');

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const user = await findUserById(userId);
    delete user.password;
    res.status(200).json({
      data: user,
      meta:{
        code:200,
        message: 'Berhasil mengambil profil Anda',
      }
    });
  } catch (err) {
    next(err);
  }
});

//create endpoint get / for list all user in db using listAllUser function
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    //check if user is admin
    const user = await findUserById(userId);
    if (!user.isAdmin) {
      res.status(403);
      throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
    }

    const users = await listAllUser();
    res.status(200).json({
      data: users,
      meta:{
        code:200,
        message: 'Berhasil mengambil semua user',
      }
    });
  } catch (err) {
    next(err);
  }
});

//create endpoint get / for list all user in db using listAllUser function
router.get('/dropdown', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    //check if user is admin
    const user = await findUserById(userId);
    if (!user.isAdmin) {
      res.status(403);
      throw new Error('Anda tidak memiliki akses untuk melakukan ini.');
    }

    const users = await listAllUserDropdown();
    res.status(200).json({
      data: users,
      meta:{
        code:200,
        message: 'Berhasil mengambil semua user',
      }
    });
  } catch (err) {
    next(err);
  }
});

// Update user by ID (Admin only)
router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const targetUserId = parseInt(req.params.id);
    
    // Check if user is admin
    const user = await findUserById(userId);
    if (!user.isAdmin) {
      res.status(403);
      throw new Error('You do not have permission to perform this action.');
    }

    // Check if target user exists
    const targetUser = await findUserById(targetUserId);
    if (!targetUser) {
      res.status(404);
      throw new Error('User not found.');
    }

    // Update user data
    const { fullName, email, noHp, nik, pj, isMahasiswa, isAdmin } = req.body;
    const updatedUser = await updateUserById(targetUserId, {
      fullName,
      email,
      noHp,
      nik,
      pj,
      isMahasiswa,
      isAdmin
    });

    delete updatedUser.password;

    res.status(200).json({
      data: updatedUser,
      meta: {
        code: 200,
        message: 'User updated successfully',
      }
    });
  } catch (err) {
    next(err);
  }
});

// Delete user by ID (Admin only)
router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const targetUserId = parseInt(req.params.id);
    
    // Check if user is admin
    const user = await findUserById(userId);
    if (!user.isAdmin) {
      res.status(403);
      throw new Error('You do not have permission to perform this action.');
    }

    // Check if target user exists
    const targetUser = await findUserById(targetUserId);
    if (!targetUser) {
      res.status(404);
      throw new Error('User not found.');
    }

    // Prevent admin from deleting themselves
    if (targetUserId === userId) {
      res.status(400);
      throw new Error('You cannot delete your own account.');
    }

    // Delete user
    await db.user.delete({
      where: {
        id: targetUserId
      }
    });

    res.status(200).json({
      data: null,
      meta: {
        code: 200,
        message: 'User deleted successfully',
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
