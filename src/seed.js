require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

db.exec('DELETE FROM posts; DELETE FROM users;');

const password = bcrypt.hashSync('password123', 12);

const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
const adminId = insertUser.run('Admin', 'admin@example.com', password, 'admin').lastInsertRowid;
const user1Id = insertUser.run('John Doe', 'john@example.com', password, 'user').lastInsertRowid;
insertUser.run('Jane Smith', 'jane@example.com', password, 'user');
insertUser.run('Bob Wilson', 'bob@example.com', password, 'user');

const insertPost = db.prepare('INSERT INTO posts (title, content, tags, published, authorId) VALUES (?, ?, ?, ?, ?)');
insertPost.run('Getting Started with Express', 'Express is a minimal web framework for Node.js...', 'express,nodejs', 1, adminId);
insertPost.run('SQLite Best Practices', 'When working with SQLite, consider these tips...', 'sqlite,database', 1, user1Id);
insertPost.run('Draft Post', 'This is a work in progress...', 'draft', 0, user1Id);

console.log('Seeded: 4 users, 3 posts');
process.exit(0);
