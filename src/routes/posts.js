const { Router } = require('express');
const { z } = require('zod');
const { Post } = require('../models');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.string().optional(),
  published: z.boolean().optional(),
});

router.get('/', (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = { published: true };
    if (req.query.tag) where.tag = req.query.tag;

    const { count, rows } = Post.findAndCountAll({ where, offset, limit });
    res.json({ posts: rows, page, limit, total: count, pages: Math.ceil(count / limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const post = Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, validate(postSchema), (req, res, next) => {
  try {
    const post = Post.create({ ...req.body, authorId: req.user.id });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', protect, validate(postSchema.partial()), (req, res, next) => {
  try {
    const post = Post.findOne({ id: req.params.id, authorId: req.user.id });
    if (!post) return res.status(404).json({ error: 'Post not found or not yours' });
    const updated = Post.update(parseInt(req.params.id), req.body);
    res.json({ post: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, (req, res, next) => {
  try {
    const post = Post.findOne({ id: req.params.id, authorId: req.user.id });
    if (!post) return res.status(404).json({ error: 'Post not found or not yours' });
    Post.destroy(parseInt(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
