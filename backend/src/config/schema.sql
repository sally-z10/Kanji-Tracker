-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kanji table
CREATE TABLE kanji (
    character VARCHAR(1) PRIMARY KEY,
    onyomi TEXT[],
    kunyomi TEXT[],
    meanings TEXT[],
    stroke_count INTEGER,
    jlpt_level VARCHAR(2),
    grade VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User's logged words table
CREATE TABLE user_kanji_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kanji_character VARCHAR(1) NOT NULL REFERENCES kanji(character) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    reading VARCHAR(255) NOT NULL,
    meaning TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word)
);

-- Completed kanji table
CREATE TABLE completed_kanji (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kanji_character VARCHAR(1) NOT NULL REFERENCES kanji(character) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, kanji_character)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_kanji_jlpt_level ON kanji(jlpt_level);
CREATE INDEX idx_user_kanji_words_user_id ON user_kanji_words(user_id);
CREATE INDEX idx_user_kanji_words_kanji_character ON user_kanji_words(kanji_character);
CREATE INDEX idx_completed_kanji_user_id ON completed_kanji(user_id);
CREATE INDEX idx_completed_kanji_kanji_character ON completed_kanji(kanji_character);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanji_updated_at
    BEFORE UPDATE ON kanji
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_kanji_words_updated_at
    BEFORE UPDATE ON user_kanji_words
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 