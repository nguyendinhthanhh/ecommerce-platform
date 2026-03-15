-- =============================
-- ROLES TABLE
-- =============================
CREATE TABLE roles (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(50) NOT NULL UNIQUE,
                       description TEXT
);

-- =============================
-- USERS TABLE
-- =============================
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       full_name VARCHAR(255) NOT NULL,
                       phone VARCHAR(50),
                       address TEXT,
                       avatar TEXT,
                       birth_day VARCHAR(50),
                       gender VARCHAR(20),
                       id_number VARCHAR(50),
                       face_match_score DOUBLE PRECISION,
                       verified BOOLEAN,
                       status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

                       created_at TIMESTAMP,
                       updated_at TIMESTAMP,
                       created_by BIGINT,
                       updated_by BIGINT,

                       last_login_at TIMESTAMP,
                       last_login_ip VARCHAR(100)
);

-- =============================
-- USERS_ROLES (JOIN TABLE)
-- =============================
CREATE TABLE users_roles (
                             user_id BIGINT NOT NULL,
                             role_id BIGINT NOT NULL,
                             PRIMARY KEY (user_id, role_id),

                             CONSTRAINT fk_users_roles_user
                                 FOREIGN KEY (user_id)
                                     REFERENCES users(id)
                                     ON DELETE CASCADE,

                             CONSTRAINT fk_users_roles_role
                                 FOREIGN KEY (role_id)
                                     REFERENCES roles(id)
                                     ON DELETE CASCADE
);

-- =============================
-- INDEXES
-- =============================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);