const db = require('../db');

const Post = {
  create(data) {
    const tags = Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || '');
    const stmt = db.prepare('INSERT INTO posts (title, content, tags, published, authorId) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(data.title, data.content, tags, data.published ? 1 : 0, data.authorId);
    return this.findByPk(info.lastInsertRowid);
  },

  findByPk(id) {
    const post = db.prepare(`
      SELECT p.*, u.name as authorName
      FROM posts p LEFT JOIN users u ON p.authorId = u.id
      WHERE p.id = ?
    `).get(id);
    if (!post) return null;
    return this._format(post);
  },

  findOne(where) {
    let sql = 'SELECT p.*, u.name as authorName FROM posts p LEFT JOIN users u ON p.authorId = u.id WHERE 1=1';
    const params = [];
    if (where.id) { sql += ' AND p.id = ?'; params.push(where.id); }
    if (where.authorId) { sql += ' AND p.authorId = ?'; params.push(where.authorId); }
    const post = db.prepare(sql).get(...params);
    return post ? this._format(post) : null;
  },

  findAndCountAll({ where = {}, offset = 0, limit = 20, order = [['createdAt', 'DESC']] } = {}) {
    let whereClauses = [];
    const params = [];

    if (where.published !== undefined) {
      whereClauses.push('p.published = ?');
      params.push(where.published ? 1 : 0);
    }
    if (where.tag) {
      whereClauses.push('p.tags LIKE ?');
      params.push(`%${where.tag}%`);
    }
    if (where.authorId) {
      whereClauses.push('p.authorId = ?');
      params.push(where.authorId);
    }

    const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const orderSql = `ORDER BY ${order[0][0]} ${order[0][1]}`;

    const count = db.prepare(`SELECT COUNT(*) as total FROM posts p ${whereSql}`).get(...params).total;
    const rows = db.prepare(`
      SELECT p.*, u.name as authorName
      FROM posts p LEFT JOIN users u ON p.authorId = u.id
      ${whereSql} ${orderSql} LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return { count, rows: rows.map(r => this._format(r)) };
  },

  update(id, data) {
    const sets = [];
    const params = [];
    if (data.title !== undefined) { sets.push('title = ?'); params.push(data.title); }
    if (data.content !== undefined) { sets.push('content = ?'); params.push(data.content); }
    if (data.tags !== undefined) { sets.push('tags = ?'); params.push(Array.isArray(data.tags) ? data.tags.join(',') : data.tags); }
    if (data.published !== undefined) { sets.push('published = ?'); params.push(data.published ? 1 : 0); }
    if (sets.length === 0) return null;

    sets.push("updatedAt = datetime('now')");
    params.push(id);
    db.prepare(`UPDATE posts SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    return this.findByPk(id);
  },

  destroy(id) {
    const info = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    return info.changes > 0;
  },

  _format(post) {
    return {
      ...post,
      published: !!post.published,
      tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
      author: post.authorId ? { id: post.authorId, name: post.authorName } : null,
    };
  },
};

module.exports = Post;
