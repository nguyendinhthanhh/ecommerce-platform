INSERT INTO roles (name, description) VALUES
                                          ('ADMIN', 'System administrator'),
                                          ('STAFF', 'Staff user'),
                                          ('CUSTOMER', 'Customer user');

-- =============================
-- INSERT ADMIN USER
-- =============================
INSERT INTO users (
    email,
    password,
    full_name,
    phone,
    verified,
    status,
    created_at,
    updated_at
) VALUES (
             'admin@ecommerce.com',
             '$2a$12$z/JTh3ZHpsfMM9hkWeC81uwEVnJlOgD7aOssQpIpnptEJCMwm4hjC',
             'System Admin',
             '0900000001',
             true,
             'ACTIVE',
             NOW(),
             NOW()
         );

-- =============================
-- INSERT STAFF USER
-- =============================
INSERT INTO users (
    email,
    password,
    full_name,
    phone,
    verified,
    status,
    created_at,
    updated_at
) VALUES (
             'staff@ecommerce.com',
             '$2a$12$z/JTh3ZHpsfMM9hkWeC81uwEVnJlOgD7aOssQpIpnptEJCMwm4hjC',
             'System Staff',
             '0900000002',
             true,
             'ACTIVE',
             NOW(),
             NOW()
         );

-- =============================
-- ASSIGN ROLE ADMIN
-- =============================
INSERT INTO users_roles (user_id, role_id)
VALUES (
           (SELECT id FROM users WHERE email = 'admin@ecommerce.com'),
           (SELECT id FROM roles WHERE name = 'ADMIN')
       );

-- =============================
-- ASSIGN ROLE STAFF
-- =============================
INSERT INTO users_roles (user_id, role_id)
VALUES (
           (SELECT id FROM users WHERE email = 'staff@ecommerce.com'),
           (SELECT id FROM roles WHERE name = 'STAFF')
       );