-- Seed para init de Docker — misma carga que `db/populate.sql` (orden 02 para correr tras `01-schema.sql`).

INSERT INTO branches (name, address, phone)
VALUES
('Santiago Centro', 'Av. Libertador Bernardo O''Higgins 1234, Santiago', '+56 2 2345 6789'),
('Providencia', 'Av. Providencia 1234, Santiago', '+56 9 8765 4321');

INSERT INTO users (
    first_name,
    last_name,
    email,
    password_hash,
    role,
    branch_id
)
VALUES
('Jose', 'Admin', 'admin@kitchenflow.cl', 'hashed_password_1', 'ADMIN',
 (SELECT id FROM branches WHERE name = 'Santiago Centro')),
('Camila', 'Manager', 'manager@kitchenflow.cl', 'hashed_password_2', 'MANAGER',
 (SELECT id FROM branches WHERE name = 'Providencia')),
('Diego', 'Chef', 'chef@kitchenflow.cl', 'hashed_password_3', 'CHEF',
 (SELECT id FROM branches WHERE name = 'Santiago Centro')),
('Valentina', 'Waiter', 'waiter@kitchenflow.cl', 'hashed_password_4', 'WAITER',
 (SELECT id FROM branches WHERE name = 'Providencia'));

INSERT INTO categories (name, description)
VALUES
('Verduras', 'Vegetales y hortalizas'),
('Carnes', 'Productos cárnicos'),
('Lácteos', 'Productos derivados de leche'),
('Bebidas', 'Bebidas y líquidos'),
('Panadería', 'Productos de panadería');

INSERT INTO product_units (code, label, sort_order)
VALUES
('kg', 'Kilogramo (kg)', 1),
('gr', 'Gramo (gr)', 2),
('lt', 'Litro (lt)', 3),
('ml', 'Mililitro (ml)', 4),
('unidad', 'Unidad', 5),
('porción', 'Porción', 6),
('taza', 'Taza', 7);

INSERT INTO recipe_categories (name, sort_order)
VALUES
('Principales', 1),
('Pizzas', 2),
('Ensaladas', 3),
('Acompañamientos', 4),
('Bebidas', 5);

INSERT INTO waste_reasons (name, sort_order)
VALUES
('Vencimiento', 1),
('Deterioro por calor', 2),
('Cadena de frío rota', 3),
('Deterioro por humedad', 4),
('Carne no vendida', 5),
('Deterioro', 6),
('Error de cocción', 7),
('Sobreproducción', 8),
('Accidente', 9),
('Otro', 10);

INSERT INTO lookup_options (group_key, value, label, sort_order)
VALUES
('business_category', 'Restaurante', 'Restaurante', 1),
('business_category', 'Bar', 'Bar', 2),
('business_category', 'Café', 'Café', 3),
('business_category', 'Panadería', 'Panadería', 4),
('business_category', 'Fast Food', 'Fast Food', 5),
('business_category', 'Food Truck', 'Food Truck', 6),
('currency', 'CLP', 'Peso chileno (CLP)', 1),
('currency', 'USD', 'Dólar (USD)', 2),
('currency', 'EUR', 'Euro (EUR)', 3),
('currency', 'MXN', 'Peso mexicano (MXN)', 4),
('currency', 'ARS', 'Peso argentino (ARS)', 5),
('currency', 'COP', 'Peso colombiano (COP)', 6),
('toteat_sync', 'auto', 'Automática (cada 5 min)', 1),
('toteat_sync', '15min', 'Cada 15 minutos', 2),
('toteat_sync', 'hourly', 'Cada hora', 3),
('toteat_sync', 'manual', 'Manual', 4);

INSERT INTO permission_features (key, label, sort_order)
VALUES
('view_dashboard', 'Ver Dashboard', 1),
('manage_inventory', 'Gestionar Inventario', 2),
('register_movements', 'Registrar Movimientos', 3),
('manage_recipes', 'Gestionar Recetas', 4),
('view_finance', 'Ver Finanzas', 5),
('view_sales', 'Ver Ventas (Toteat)', 6),
('register_waste', 'Registrar Mermas', 7),
('manage_users', 'Gestionar Usuarios', 8),
('manage_settings', 'Configuración', 9);

INSERT INTO role_feature_permissions (role, feature_key, allowed)
VALUES
('ADMIN', 'view_dashboard', TRUE),
('MANAGER', 'view_dashboard', TRUE),
('CHEF', 'view_dashboard', FALSE),
('WAITER', 'view_dashboard', FALSE),
('ADMIN', 'manage_inventory', TRUE),
('MANAGER', 'manage_inventory', TRUE),
('CHEF', 'manage_inventory', TRUE),
('WAITER', 'manage_inventory', TRUE),
('ADMIN', 'register_movements', TRUE),
('MANAGER', 'register_movements', TRUE),
('CHEF', 'register_movements', TRUE),
('WAITER', 'register_movements', TRUE),
('ADMIN', 'manage_recipes', TRUE),
('MANAGER', 'manage_recipes', TRUE),
('CHEF', 'manage_recipes', TRUE),
('WAITER', 'manage_recipes', FALSE),
('ADMIN', 'view_finance', TRUE),
('MANAGER', 'view_finance', TRUE),
('CHEF', 'view_finance', FALSE),
('WAITER', 'view_finance', FALSE),
('ADMIN', 'view_sales', TRUE),
('MANAGER', 'view_sales', TRUE),
('CHEF', 'view_sales', FALSE),
('WAITER', 'view_sales', FALSE),
('ADMIN', 'register_waste', TRUE),
('MANAGER', 'register_waste', TRUE),
('CHEF', 'register_waste', TRUE),
('WAITER', 'register_waste', TRUE),
('ADMIN', 'manage_users', TRUE),
('MANAGER', 'manage_users', FALSE),
('CHEF', 'manage_users', FALSE),
('WAITER', 'manage_users', FALSE),
('ADMIN', 'manage_settings', TRUE),
('MANAGER', 'manage_settings', FALSE),
('CHEF', 'manage_settings', FALSE),
('WAITER', 'manage_settings', FALSE);

INSERT INTO route_permissions (path, role)
VALUES
('/', 'ADMIN'), ('/', 'MANAGER'),
('/inventario', 'ADMIN'), ('/inventario', 'MANAGER'), ('/inventario', 'CHEF'), ('/inventario', 'WAITER'),
('/ingreso-inventario', 'ADMIN'), ('/ingreso-inventario', 'MANAGER'), ('/ingreso-inventario', 'CHEF'), ('/ingreso-inventario', 'WAITER'),
('/recetas', 'ADMIN'), ('/recetas', 'MANAGER'), ('/recetas', 'CHEF'),
('/menu', 'ADMIN'), ('/menu', 'MANAGER'), ('/menu', 'CHEF'),
('/finanzas', 'ADMIN'), ('/finanzas', 'MANAGER'),
('/ventas', 'ADMIN'), ('/ventas', 'MANAGER'),
('/reportes', 'ADMIN'), ('/reportes', 'MANAGER'),
('/mermas', 'ADMIN'), ('/mermas', 'MANAGER'), ('/mermas', 'CHEF'), ('/mermas', 'WAITER'),
('/usuarios', 'ADMIN'),
('/configuracion', 'ADMIN');

INSERT INTO app_settings (
    business_name,
    business_address,
    business_phone,
    business_email,
    business_rut,
    business_category,
    currency,
    tax_rate,
    tax_name,
    include_vat,
    margin_target,
    waste_alert,
    toteat_enabled,
    toteat_api_key,
    toteat_sync,
    webhook_url,
    notify_low_stock,
    notify_high_waste,
    notify_daily_report,
    notify_weekly_report,
    notify_profit_alert
)
VALUES (
    'KitchenFlow Demo Restaurant',
    'Av. Providencia 1234, Santiago',
    '+56 9 8765 4321',
    'contacto@mirestaurante.cl',
    '76.543.210-K',
    'Restaurante',
    'CLP',
    19,
    'IVA',
    TRUE,
    65,
    5,
    TRUE,
    'tk_live_demo_key_placeholder',
    'auto',
    'https://api.kitchenflow.app/webhook/toteat',
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    TRUE
);

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
),
(
    (SELECT id FROM categories WHERE name = 'Bebidas'),
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Central'),
    'Coca-Cola',
    'Bebida gaseosa 350ml',
    'BEB-001',
    'unidad',
    80,
    15,
    600,
    1500
);

INSERT INTO recipes (
    name,
    description,
    category_id,
    preparation_time_minutes,
    sale_price,
    created_by
)
VALUES
(
    'Hamburguesa Clásica',
    'Hamburguesa con queso y vegetales',
    (SELECT id FROM recipe_categories WHERE name = 'Principales'),
    20,
    8990,
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
),
(
    'Ensalada Fresca',
    'Ensalada con vegetales frescos',
    (SELECT id FROM recipe_categories WHERE name = 'Ensaladas'),
    10,
    4990,
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
),
(
    'Pizza Margarita',
    'Pizza con mozzarella y tomate',
    (SELECT id FROM recipe_categories WHERE name = 'Pizzas'),
    25,
    10990,
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
),
(
    (SELECT id FROM recipes WHERE name = 'Pizza Margarita'),
    (SELECT id FROM products WHERE name = 'Queso Mozzarella'),
    0.15
),
(
    (SELECT id FROM recipes WHERE name = 'Pizza Margarita'),
    (SELECT id FROM products WHERE name = 'Tomate'),
    0.12
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
    'Vencimiento',
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
);
