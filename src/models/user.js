const bcrypt = require('bcryptjs');
const db = require('../db');

const User = {
  create(data) {
    const password = bcrypt.hashSync(data.password, 12);
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(data.name, data.email, password, data.role || 'user');
    return this.findByPk(info.lastInsertRowid);
  },

  findByPk(id) {
    return db.prepare('SELECT id, name, email, role, createdAt, updatedAt FROM users WHERE id = ?').get(id) || null;
  },

  findOne(where) {
    let sql = 'SELECT id, name, email, role, createdAt, updatedAt FROM users WHERE 1=1';
    const params = [];
    if (where.email) { sql += ' AND email = ?'; params.push(where.email); }
    if (where.id) { sql += ' AND id = ?'; params.push(where.id); }
    return db.prepare(sql).get(...params) || null;
  },

  findOneWithPassword(where) {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    if (where.email) { sql += ' AND email = ?'; params.push(where.email); }
    if (where.id) { sql += ' AND id = ?'; params.push(where.id); }
    return db.prepare(sql).get(...params) || null;
  },

  findAndCountAll({ where = {}, offset = 0, limit = 20, order = [['createdAt', 'DESC']] } = {}) {
    let whereClauses = [];
    const params = [];

    if (where.search) {
      whereClauses.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${where.search}%`, `%${where.search}%`);
    }
    if (where.role) {
      whereClauses.push('role = ?');
      params.push(where.role);
    }

    const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const orderSql = `ORDER BY ${order[0][0]} ${order[0][1]}`;

    const count = db.prepare(`SELECT COUNT(*) as total FROM users ${whereSql}`).get(...params).total;
    const rows = db.prepare(`SELECT id, name, email, role, createdAt, updatedAt FROM users ${whereSql} ${orderSql} LIMIT ? OFFSET ?`).all(...params, limit, offset);

    return { count, rows };
  },

  update(id, data) {
    const sets = [];
    const params = [];
    if (data.name !== undefined) { sets.push('name = ?'); params.push(data.name); }
    if (data.email !== undefined) { sets.push('email = ?'); params.push(data.email); }
    if (data.password !== undefined) { sets.push('password = ?'); params.push(bcrypt.hashSync(data.password, 12)); }
    if (data.role !== undefined) { sets.push('role = ?'); params.push(data.role); }
    if (sets.length === 0) return null;

    sets.push("updatedAt = datetime('now')");
    params.push(id);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    return this.findByPk(id);
  },

  destroy(id) {
    const info = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return info.changes > 0;
  },
};

module.exports = User;
