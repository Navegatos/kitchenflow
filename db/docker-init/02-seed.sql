-- Seed para init de Docker — misma carga que `db/populate.sql` (orden 02 para correr tras `01-schema.sql`).

INSERT INTO users (
    first_name,
    last_name,
    email,
    password_hash,
    role
)
VALUES
('Jose', 'Admin', 'admin@kitchenflow.cl', 'hashed_password_1', 'ADMIN'),
('Camila', 'Manager', 'manager@kitchenflow.cl', 'hashed_password_2', 'MANAGER'),
('Diego', 'Chef', 'chef@kitchenflow.cl', 'hashed_password_3', 'CHEF'),
('Valentina', 'Waiter', 'waiter@kitchenflow.cl', 'hashed_password_4', 'WAITER');

INSERT INTO categories (name, description)
VALUES
('Verduras', 'Vegetales y hortalizas'),
('Carnes', 'Productos cárnicos'),
('Lácteos', 'Productos derivados de leche'),
('Bebidas', 'Bebidas y líquidos'),
('Panadería', 'Productos de panadería');

INSERT INTO suppliers (
    name,
    contact_name,
    email,
    phone,
    address
)
VALUES
(
    'Distribuidora Central',
    'María López',
    'contacto@distcentral.cl',
    '+56911111111',
    'Santiago Centro'
),
(
    'Carnes Premium',
    'Pedro González',
    'ventas@carnespremium.cl',
    '+56922222222',
    'Providencia'
),
(
    'Lácteos del Sur',
    'Ana Torres',
    'contacto@lacteosdelsur.cl',
    '+56933333333',
    'Puerto Montt'
);

INSERT INTO products (
    category_id,
    supplier_id,
    name,
    description,
    sku,
    unit,
    stock,
    minimum_stock,
    cost_price,
    sale_price
)
VALUES
(
    (SELECT id FROM categories WHERE name = 'Verduras'),
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Central'),
    'Tomate',
    'Tomate larga vida',
    'VERD-001',
    'kg',
    50,
    10,
    1200,
    2200
),
(
    (SELECT id FROM categories WHERE name = 'Verduras'),
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Central'),
    'Lechuga',
    'Lechuga escarola',
    'VERD-002',
    'unidad',
    30,
    8,
    800,
    1500
),
(
    (SELECT id FROM categories WHERE name = 'Carnes'),
    (SELECT id FROM suppliers WHERE name = 'Carnes Premium'),
    'Carne Vacuno',
    'Lomo vetado',
    'CARN-001',
    'kg',
    20,
    5,
    9500,
    14500
),
(
    (SELECT id FROM categories WHERE name = 'Lácteos'),
    (SELECT id FROM suppliers WHERE name = 'Lácteos del Sur'),
    'Queso Mozzarella',
    'Queso mozzarella rallado',
    'LAC-001',
    'kg',
    15,
    5,
    5500,
    8500
),
(
    (SELECT id FROM categories WHERE name = 'Panadería'),
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Central'),
    'Pan Brioche',
    'Pan brioche hamburguesa',
    'PAN-001',
    'unidad',
    100,
    20,
    500,
    1000
);

INSERT INTO recipes (
    name,
    description,
    preparation_time_minutes,
    sale_price,
    created_by
)
VALUES
(
    'Hamburguesa Clásica',
    'Hamburguesa con queso y vegetales',
    20,
    8990,
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
),
(
    'Ensalada Fresca',
    'Ensalada con vegetales frescos',
    10,
    4990,
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
);

INSERT INTO recipe_ingredients (
    recipe_id,
    product_id,
    quantity
)
VALUES
(
    (SELECT id FROM recipes WHERE name = 'Hamburguesa Clásica'),
    (SELECT id FROM products WHERE name = 'Pan Brioche'),
    1
),
(
    (SELECT id FROM recipes WHERE name = 'Hamburguesa Clásica'),
    (SELECT id FROM products WHERE name = 'Carne Vacuno'),
    0.25
),
(
    (SELECT id FROM recipes WHERE name = 'Hamburguesa Clásica'),
    (SELECT id FROM products WHERE name = 'Queso Mozzarella'),
    0.05
),
(
    (SELECT id FROM recipes WHERE name = 'Hamburguesa Clásica'),
    (SELECT id FROM products WHERE name = 'Tomate'),
    0.10
),
(
    (SELECT id FROM recipes WHERE name = 'Ensalada Fresca'),
    (SELECT id FROM products WHERE name = 'Tomate'),
    0.20
),
(
    (SELECT id FROM recipes WHERE name = 'Ensalada Fresca'),
    (SELECT id FROM products WHERE name = 'Lechuga'),
    1
);

INSERT INTO orders (
    status,
    total_amount,
    notes,
    created_by
)
VALUES
(
    'DELIVERED',
    17980,
    'Mesa 3',
    (SELECT id FROM users WHERE email = 'waiter@kitchenflow.cl')
),
(
    'PREPARING',
    4990,
    'Pedido delivery',
    (SELECT id FROM users WHERE email = 'waiter@kitchenflow.cl')
);

INSERT INTO order_items (
    order_id,
    recipe_id,
    quantity,
    unit_price,
    subtotal
)
VALUES
(
    (SELECT id FROM orders WHERE notes = 'Mesa 3' LIMIT 1),
    (SELECT id FROM recipes WHERE name = 'Hamburguesa Clásica'),
    2,
    8990,
    17980
),
(
    (SELECT id FROM orders WHERE notes = 'Pedido delivery' LIMIT 1),
    (SELECT id FROM recipes WHERE name = 'Ensalada Fresca'),
    1,
    4990,
    4990
);

INSERT INTO inventory_movements (
    product_id,
    user_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    notes
)
VALUES
(
    (SELECT id FROM products WHERE name = 'Tomate'),
    (SELECT id FROM users WHERE email = 'manager@kitchenflow.cl'),
    'IN',
    50,
    0,
    50,
    'Ingreso inicial de stock'
),
(
    (SELECT id FROM products WHERE name = 'Carne Vacuno'),
    (SELECT id FROM users WHERE email = 'manager@kitchenflow.cl'),
    'IN',
    20,
    0,
    20,
    'Ingreso inicial de stock'
);

INSERT INTO waste_records (
    product_id,
    quantity,
    reason,
    registered_by
)
VALUES
(
    (SELECT id FROM products WHERE name = 'Lechuga'),
    2,
    'Producto vencido',
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
);
