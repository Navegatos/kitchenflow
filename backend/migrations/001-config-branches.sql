-- Migración idempotente: tablas de configuración, sucursales y columnas nuevas.
-- Aplica cambios que ya están en db/docker-init/01-schema.sql pero pueden faltar
-- en volúmenes de Postgres creados con un esquema anterior.

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);

CREATE TABLE IF NOT EXISTS recipe_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES recipe_categories(id);
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON recipes(category_id);

CREATE TABLE IF NOT EXISTS product_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS waste_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS lookup_options (
    group_key VARCHAR(50) NOT NULL,
    value VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (group_key, value)
);

CREATE TABLE IF NOT EXISTS permission_features (
    key VARCHAR(100) PRIMARY KEY,
    label VARCHAR(200) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS role_feature_permissions (
    role user_role NOT NULL,
    feature_key VARCHAR(100) NOT NULL REFERENCES permission_features(key) ON DELETE CASCADE,
    allowed BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (role, feature_key)
);

CREATE TABLE IF NOT EXISTS route_permissions (
    path VARCHAR(200) NOT NULL,
    role user_role NOT NULL,
    PRIMARY KEY (path, role)
);

CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(200) NOT NULL DEFAULT '',
    business_address TEXT,
    business_phone VARCHAR(50),
    business_email VARCHAR(255),
    business_rut VARCHAR(50),
    business_category VARCHAR(100),
    currency VARCHAR(10) NOT NULL DEFAULT 'CLP',
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 19,
    tax_name VARCHAR(50) NOT NULL DEFAULT 'IVA',
    include_vat BOOLEAN NOT NULL DEFAULT TRUE,
    margin_target NUMERIC(5,2) NOT NULL DEFAULT 65,
    waste_alert NUMERIC(5,2) NOT NULL DEFAULT 5,
    toteat_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    toteat_api_key TEXT,
    toteat_sync VARCHAR(20) NOT NULL DEFAULT 'auto',
    webhook_url TEXT,
    notify_low_stock BOOLEAN NOT NULL DEFAULT TRUE,
    notify_high_waste BOOLEAN NOT NULL DEFAULT TRUE,
    notify_daily_report BOOLEAN NOT NULL DEFAULT TRUE,
    notify_weekly_report BOOLEAN NOT NULL DEFAULT FALSE,
    notify_profit_alert BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_app_settings_updated_at'
    ) THEN
        CREATE TRIGGER update_app_settings_updated_at
            BEFORE UPDATE ON app_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Seed mínimo para tablas de configuración (solo si están vacías)

INSERT INTO branches (name, address, phone)
SELECT 'Santiago Centro', 'Av. Libertador Bernardo O''Higgins 1234, Santiago', '+56 2 2345 6789'
WHERE NOT EXISTS (SELECT 1 FROM branches);

INSERT INTO branches (name, address, phone)
SELECT 'Providencia', 'Av. Providencia 1234, Santiago', '+56 9 8765 4321'
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'Providencia');

UPDATE users SET branch_id = (SELECT id FROM branches WHERE name = 'Santiago Centro' LIMIT 1)
WHERE email = 'admin@kitchenflow.cl' AND branch_id IS NULL;

UPDATE users SET branch_id = (SELECT id FROM branches WHERE name = 'Providencia' LIMIT 1)
WHERE email = 'manager@kitchenflow.cl' AND branch_id IS NULL;

UPDATE users SET branch_id = (SELECT id FROM branches WHERE name = 'Santiago Centro' LIMIT 1)
WHERE email = 'chef@kitchenflow.cl' AND branch_id IS NULL;

UPDATE users SET branch_id = (SELECT id FROM branches WHERE name = 'Providencia' LIMIT 1)
WHERE email = 'waiter@kitchenflow.cl' AND branch_id IS NULL;

INSERT INTO product_units (code, label, sort_order)
SELECT v.code, v.label, v.sort_order
FROM (VALUES
    ('kg', 'Kilogramo (kg)', 1),
    ('gr', 'Gramo (gr)', 2),
    ('lt', 'Litro (lt)', 3),
    ('ml', 'Mililitro (ml)', 4),
    ('unidad', 'Unidad', 5),
    ('porción', 'Porción', 6),
    ('taza', 'Taza', 7)
) AS v(code, label, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM product_units);

INSERT INTO recipe_categories (name, sort_order)
SELECT v.name, v.sort_order
FROM (VALUES
    ('Principales', 1),
    ('Pizzas', 2),
    ('Ensaladas', 3),
    ('Acompañamientos', 4),
    ('Bebidas', 5)
) AS v(name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM recipe_categories);

INSERT INTO waste_reasons (name, sort_order)
SELECT v.name, v.sort_order
FROM (VALUES
    ('Vencimiento', 1),
    ('Deterioro por calor', 2),
    ('Cadena de frío rota', 3),
    ('Deterioro por humedad', 4),
    ('Carne no vendida', 5),
    ('Deterioro', 6),
    ('Error de cocción', 7),
    ('Sobreproducción', 8),
    ('Accidente', 9),
    ('Otro', 10)
) AS v(name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM waste_reasons);

INSERT INTO lookup_options (group_key, value, label, sort_order)
SELECT v.group_key, v.value, v.label, v.sort_order
FROM (VALUES
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
    ('toteat_sync', 'manual', 'Manual', 4)
) AS v(group_key, value, label, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM lookup_options);

INSERT INTO permission_features (key, label, sort_order)
SELECT v.key, v.label, v.sort_order
FROM (VALUES
    ('view_dashboard', 'Ver Dashboard', 1),
    ('manage_inventory', 'Gestionar Inventario', 2),
    ('register_movements', 'Registrar Movimientos', 3),
    ('manage_recipes', 'Gestionar Recetas', 4),
    ('view_finance', 'Ver Finanzas', 5),
    ('view_sales', 'Ver Ventas (Toteat)', 6),
    ('register_waste', 'Registrar Mermas', 7),
    ('manage_users', 'Gestionar Usuarios', 8),
    ('manage_settings', 'Configuración', 9)
) AS v(key, label, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM permission_features);

INSERT INTO role_feature_permissions (role, feature_key, allowed)
SELECT v.role::user_role, v.feature_key, v.allowed
FROM (VALUES
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
    ('WAITER', 'manage_settings', FALSE)
) AS v(role, feature_key, allowed)
WHERE NOT EXISTS (SELECT 1 FROM role_feature_permissions);

INSERT INTO route_permissions (path, role)
SELECT v.path, v.role::user_role
FROM (VALUES
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
    ('/configuracion', 'ADMIN')
) AS v(path, role)
WHERE NOT EXISTS (SELECT 1 FROM route_permissions);

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
SELECT
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
WHERE NOT EXISTS (SELECT 1 FROM app_settings);

UPDATE recipes SET category_id = (SELECT id FROM recipe_categories WHERE name = 'Principales' LIMIT 1)
WHERE name = 'Hamburguesa Clásica' AND category_id IS NULL;

UPDATE recipes SET category_id = (SELECT id FROM recipe_categories WHERE name = 'Ensaladas' LIMIT 1)
WHERE name = 'Ensalada Fresca' AND category_id IS NULL;

UPDATE recipes SET category_id = (SELECT id FROM recipe_categories WHERE name = 'Pizzas' LIMIT 1)
WHERE name = 'Pizza Margarita' AND category_id IS NULL;
