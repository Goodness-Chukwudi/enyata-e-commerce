
const table_create_queries = 
//CUSTOMER
`
    CREATE TABLE IF NOT EXISTS app_users(
        id SERIAL PRIMARY KEY,
        first_name VARCHAR (50) NOT NULL,
        last_name VARCHAR (50) NOT NULL,
        middle_name VARCHAR (50),
        email VARCHAR (100) UNIQUE NOT NULL,
        phone VARCHAR (100) UNIQUE NOT NULL,
        gender VARCHAR (50) NOT NULL,
        require_new_password BOOLEAN DEFAULT false,
        is_admin BOOLEAN DEFAULT false,
        status VARCHAR (50) DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_fname
    ON app_users(first_name);

    CREATE INDEX IF NOT EXISTS idx_users_lname
    ON app_users(last_name);

    CREATE INDEX IF NOT EXISTS idx_users_mname
    ON app_users(middle_name);
`
//USER_PASSWORD
+
`
CREATE TABLE IF NOT EXISTS user_passwords(
    id SERIAL PRIMARY KEY,
    password VARCHAR (255) NOT NULL,
    email VARCHAR (100) NOT NULL,
    user_id INT NOT NULL,
    status VARCHAR (50) DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES app_users(id)
);
`
//OTP
+
`
CREATE TABLE IF NOT EXISTS otps(
    id SERIAL PRIMARY KEY,
    code VARCHAR (255) NOT NULL,
    type VARCHAR (50) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR (50) DEFAULT 'active',
    FOREIGN KEY(user_id) REFERENCES app_users(id)
);
`
//LOGIN_SESSIONS
+
`
CREATE TABLE IF NOT EXISTS login_sessions(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    status VARCHAR (50) DEFAULT 'active',
    validity_end_date TIMESTAMP NOT NULL,
    logged_out BOOLEAN DEFAULT false,
    expired BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES app_users(id)
);
`
//PRODUCTS
+
`
CREATE TABLE IF NOT EXISTS products(
    id SERIAL PRIMARY KEY,
    name VARCHAR (100) NOT NULL UNIQUE,
    price REAL NOT NULL,
    description VARCHAR (255),
    available_quantity INT NOT NULL,
    status VARCHAR (50) DEFAULT 'active',
    created_by INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES app_users(id)
);
`
//ORDERS
+
`
CREATE TABLE IF NOT EXISTS orders(
    id SERIAL PRIMARY KEY,
    code VARCHAR (255) NOT NULL UNIQUE,
    customer_name VARCHAR (255) NOT NULL,
    customer_id INT NOT NULL,
    amount REAL NOT NULL,
    status VARCHAR (50) DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES app_users(id)
);
`

//ORDER_PRODUCTS
+
`
CREATE TABLE IF NOT EXISTS order_products(
    id SERIAL PRIMARY KEY,
    name VARCHAR (100) NOT NULL,
    price REAL NOT NULL,
    quantity INT NOT NULL,
    order_code VARCHAR (255) NOT NULL,
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_code) REFERENCES orders(code),
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(customer_id) REFERENCES app_users(id)
);
`
export default table_create_queries;