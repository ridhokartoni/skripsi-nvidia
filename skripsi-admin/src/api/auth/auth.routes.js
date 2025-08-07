const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
} = require('../users/users.services');
const { generateTokens } = require('../../utils/jwt');
const {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens,
} = require('./auth.services');
const { hashToken } = require('../../utils/hashToken');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, noHp, isMahasiswa, pj, nik  } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Anda harus memberikan email dan password.');
    }

    if (!fullName) {
      res.status(400);
      throw new Error('Anda harus memberikan nama lengkap Anda.');
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error('Email sudah digunakan.');
    }

    const user = await createUserByEmailAndPassword({
      email,
      password,
      fullName,
      noHp,
      isMahasiswa,
      pj,
      nik
    });
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    res.status(201).json({
      data: {
        fullName,
      },
      meta:{
        code: 201,
        message: 'Pendaftaran Berhasil!',
      }
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    let existingUser;

    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Anda harus memberikan email dan password.');
    }

    existingUser = await findUserByEmail(email);

    if (!existingUser) {
        res.status(403);
        throw new Error('Kredensial masuk tidak valid.');
    }

    const validPassword = await bcrypt.compare(
        password,
        existingUser.password,
    );

    if (!validPassword) {
        res.status(403);
        throw new Error('Salah kata sandi!');
    }

    const jti = uuidv4();
    // 2 conditions
    if (existingUser) {
        const { accessToken, refreshToken } = generateTokens(existingUser, jti);
        await addRefreshTokenToWhitelist({
          jti,
          refreshToken,
          userId: existingUser.id,
        });

        res.status(200).json({
          data: {
            token: accessToken,
          },
          meta:{
            code:200,
            message:'Masuk berhasil!'
          }
        });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post('/admin/login', async (req, res, next) => {
  try {
    let existingUser;

    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Anda harus memberikan email dan password.');
    }

    existingUser = await findUserByEmail(email);

    if (!existingUser) {
        res.status(403);
        throw new Error('Kredensial masuk tidak valid.');
    }

    const validPassword = await bcrypt.compare(
        password,
        existingUser.password,
    );

    if (!validPassword) {
        res.status(403);
        throw new Error('Salah kata sandi!');
    }

    if (!existingUser.isAdmin) {
      res.status(403);
      throw new Error('Permission denied. Admin access required.');
    }
    
    const jti = uuidv4();
    // 2 conditions
    if (existingUser) {
        const { accessToken, refreshToken } = generateTokens(existingUser, jti);
        await addRefreshTokenToWhitelist({
          jti,
          refreshToken,
          userId: existingUser.id,
        });

        res.status(200).json({
          data: {
            token: accessToken,
          },
          meta:{
            code:200,
            message:'Masuk sebagai admin berhasil!'
          }
        });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post('/refreshToken', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Missing refresh token.');
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user,
      jti,
    );
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
router.post('/revokeRefreshTokens', async (req, res, next) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
