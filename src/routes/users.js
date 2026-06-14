const { Router } = require('express');
const { z } = require('zod');
const { User } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['user', 'admin']).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(['user', 'admin']).optional(),
});

router.get('/', protect, restrictTo('admin'), (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.search) where.search = req.query.search;
    if (req.query.role) where.role = req.query.role;

    const { count, rows } = User.findAndCountAll({ where, offset, limit });
    res.json({ users: rows, page, limit, total: count, pages: Math.ceil(count / limit) });
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, restrictTo('admin'), validate(createUserSchema), (req, res, next) => {
  try {
    const existing = User.findOne({ email: req.body.email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const user = User.create(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', protect, (req, res, next) => {
  try {
    const user = User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, validate(updateUserSchema), (req, res, next) => {
  try {
    const user = User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role !== 'admin' && req.body.role) {
      return res.status(403).json({ error: 'Cannot change role' });
    }

    const updated = User.update(parseInt(req.params.id), req.body);
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, restrictTo('admin'), (req, res, next) => {
  try {
    const ok = User.destroy(parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
