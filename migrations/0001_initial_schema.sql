-- Migration number: 0001 	 2023-11-21_initial_schema.sql

-- Create users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    profile_image_url TEXT,
    instagram_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create likes table
CREATE TABLE likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id_liker TEXT NOT NULL,
    user_id_liked TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id_liker) REFERENCES users(id),
    FOREIGN KEY (user_id_liked) REFERENCES users(id),
    UNIQUE (user_id_liker, user_id_liked)
);

-- Create matches table
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id_1 TEXT NOT NULL,
    user_id_2 TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id_1) REFERENCES users(id),
    FOREIGN KEY (user_id_2) REFERENCES users(id),
    UNIQUE (user_id_1, user_id_2)
);
