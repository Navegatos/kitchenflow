-- =====================================================
-- KitchenFlow - Datos demo extendidos
-- PostgreSQL — ejecutar DESPUÉS de populate.sql / 02-seed.sql
-- =====================================================
-- Genera ~90 pedidos, mermas, movimientos de inventario y catálogo
-- adicional distribuidos en los últimos 30 días para gráficos y reportes.

-- ── Productos adicionales (incluye ítems con stock bajo) ──────────────────

INSERT INTO products (category_id, supplier_id, name, description, sku, unit, stock, minimum_stock, cost_price, sale_price)
VALUES
(
    (SELECT id FROM categories WHERE name = 'Verduras'),
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Central'),
    'Cebolla', 'Cebolla blanca', 'VERD-003', 'kg', 3, 8, 900, 1600
),
(
    (SELECT id FROM categories WHERE name = 'Verduras'),
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Central'),
    'Papa', 'Papa granel', 'VERD-004', 'kg', 2, 15, 700, 1200
),
(
    (SELECT id FROM categories WHERE name = 'Carnes'),
    (SELECT id FROM suppliers WHERE name = 'Carnes Premium'),
    'Pollo Entero', 'Pollo fresco', 'CARN-002', 'kg', 4, 10, 4200, 6500
),
(
    (SELECT id FROM categories WHERE name = 'Carnes'),
    (SELECT id FROM suppliers WHERE name = 'Carnes Premium'),
    'Chorizo', 'Chorizo parrillero', 'CARN-003', 'kg', 0, 5, 6800, 9900
),
(
    (SELECT id FROM categories WHERE name = 'Lácteos'),
    (SELECT id FROM suppliers WHERE name = 'Lácteos del Sur'),
    'Mantequilla', 'Mantequilla sin sal', 'LAC-002', 'kg', 6, 3, 4800, 7200
),
(
    (SELECT id FROM categories WHERE name = 'Bebidas'),
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Central'),
    'Jugo Natural', 'Jugo naranja 500ml', 'BEB-002', 'unidad', 5, 12, 450, 1200
),
(
    (SELECT id FROM categories WHERE name = 'Bebidas'),
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Central'),
    'Agua Mineral', 'Agua sin gas 500ml', 'BEB-003', 'unidad', 1, 20, 300, 800
),
(
    (SELECT id FROM categories WHERE name = 'Panadería'),
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Central'),
    'Masa Pizza', 'Masa pizza individual', 'PAN-002', 'unidad', 25, 10, 800, 1500
);

-- Bajar stock de productos existentes para alertas
UPDATE products SET stock = 3, minimum_stock = 10 WHERE name = 'Lechuga';
UPDATE products SET stock = 4, minimum_stock = 8  WHERE name = 'Queso Mozzarella';
UPDATE products SET stock = 0, minimum_stock = 5  WHERE name = 'Carne Vacuno';

-- ── Recetas adicionales ─────────────────────────────────────────────────────

INSERT INTO recipes (name, description, category_id, preparation_time_minutes, sale_price, created_by)
VALUES
(
    'Lomo Saltado',
    'Lomo salteado con papas fritas y arroz',
    (SELECT id FROM recipe_categories WHERE name = 'Principales'),
    30, 12990,
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
),
(
    'Pollo a la Plancha',
    'Pechuga de pollo con ensalada',
    (SELECT id FROM recipe_categories WHERE name = 'Principales'),
    25, 9990,
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
),
(
    'Papas Fritas',
    'Porción de papas fritas crujientes',
    (SELECT id FROM recipe_categories WHERE name = 'Acompañamientos'),
    10, 3490,
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
),
(
    'Pizza Pepperoni',
    'Pizza con pepperoni y mozzarella',
    (SELECT id FROM recipe_categories WHERE name = 'Pizzas'),
    28, 11990,
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
),
(
    'Combo Bebida',
    'Bebida + agua mineral',
    (SELECT id FROM recipe_categories WHERE name = 'Bebidas'),
    2, 1990,
    (SELECT id FROM users WHERE email = 'chef@kitchenflow.cl')
);

INSERT INTO recipe_ingredients (recipe_id, product_id, quantity)
VALUES
((SELECT id FROM recipes WHERE name = 'Lomo Saltado'),      (SELECT id FROM products WHERE name = 'Carne Vacuno'),    0.30),
((SELECT id FROM recipes WHERE name = 'Lomo Saltado'),      (SELECT id FROM products WHERE name = 'Papa'),            0.25),
((SELECT id FROM recipes WHERE name = 'Lomo Saltado'),      (SELECT id FROM products WHERE name = 'Cebolla'),         0.10),
((SELECT id FROM recipes WHERE name = 'Lomo Saltado'),      (SELECT id FROM products WHERE name = 'Tomate'),          0.08),
((SELECT id FROM recipes WHERE name = 'Pollo a la Plancha'), (SELECT id FROM products WHERE name = 'Pollo Entero'),   0.35),
((SELECT id FROM recipes WHERE name = 'Pollo a la Plancha'), (SELECT id FROM products WHERE name = 'Lechuga'),        0.50),
((SELECT id FROM recipes WHERE name = 'Pollo a la Plancha'), (SELECT id FROM products WHERE name = 'Tomate'),         0.10),
((SELECT id FROM recipes WHERE name = 'Papas Fritas'),      (SELECT id FROM products WHERE name = 'Papa'),            0.30),
((SELECT id FROM recipes WHERE name = 'Pizza Pepperoni'),   (SELECT id FROM products WHERE name = 'Masa Pizza'),      1),
((SELECT id FROM recipes WHERE name = 'Pizza Pepperoni'),   (SELECT id FROM products WHERE name = 'Queso Mozzarella'), 0.18),
((SELECT id FROM recipes WHERE name = 'Pizza Pepperoni'),   (SELECT id FROM products WHERE name = 'Tomate'),          0.10),
((SELECT id FROM recipes WHERE name = 'Combo Bebida'),      (SELECT id FROM products WHERE name = 'Jugo Natural'),    1),
((SELECT id FROM recipes WHERE name = 'Combo Bebida'),      (SELECT id FROM products WHERE name = 'Agua Mineral'),    1);

-- ── Pedidos, mermas y movimientos (últimos 30 días) ───────────────────────

DO $$
DECLARE
    waiter_id   UUID;
    chef_id     UUID;
    manager_id  UUID;
    recipe_ids  UUID[];
    recipe_prices NUMERIC[];
    recipe_names TEXT[];
    i           INT;
    day_offset  INT;
    orders_today INT;
    o_status    order_status;
    o_id        UUID;
    r_idx       INT;
    qty         INT;
    unit_price  NUMERIC;
    subtotal    NUMERIC;
    o_total     NUMERIC;
    o_ts        TIMESTAMP;
    num_items   INT;
    j           INT;
    prod_ids    UUID[];
    prod_names  TEXT[];
    prod_costs  NUMERIC[];
    w_idx       INT;
    w_qty       NUMERIC;
    w_reasons   TEXT[] := ARRAY[
        'Vencimiento', 'Deterioro por calor', 'Cadena de frío rota',
        'Carne no vendida', 'Error de cocción', 'Sobreproducción', 'Accidente'
    ];
    mov_types   movement_type[] := ARRAY['IN','IN','IN','OUT','OUT','ADJUSTMENT','WASTE']::movement_type[];
    m_idx       INT;
    m_qty       NUMERIC;
    prev_stock  NUMERIC;
    new_stock   NUMERIC;
    m_type      movement_type;
BEGIN
    SELECT id INTO waiter_id  FROM users WHERE email = 'waiter@kitchenflow.cl';
    SELECT id INTO chef_id     FROM users WHERE email = 'chef@kitchenflow.cl';
    SELECT id INTO manager_id  FROM users WHERE email = 'manager@kitchenflow.cl';

    SELECT ARRAY_AGG(id ORDER BY name), ARRAY_AGG(sale_price ORDER BY name), ARRAY_AGG(name ORDER BY name)
    INTO recipe_ids, recipe_prices, recipe_names
    FROM recipes WHERE status = 'ACTIVE';

    SELECT ARRAY_AGG(id ORDER BY name), ARRAY_AGG(name ORDER BY name), ARRAY_AGG(cost_price ORDER BY name)
    INTO prod_ids, prod_names, prod_costs
    FROM products WHERE active = TRUE;

    -- Pedidos históricos (días 29 → 1)
    FOR day_offset IN REVERSE 29..1 LOOP
        orders_today := 2 + (day_offset % 4);  -- 2–5 pedidos por día

        FOR i IN 1..orders_today LOOP
            -- Mayoría entregados; algunos cancelados en días pares
            IF day_offset % 7 = 0 AND i = orders_today THEN
                o_status := 'CANCELLED';
            ELSE
                o_status := 'DELIVERED';
            END IF;

            o_ts := (CURRENT_DATE - day_offset)
                    + ((8 + (i * 2 + day_offset % 5)) || ' hours')::INTERVAL
                    + ((i * 7) || ' minutes')::INTERVAL;

            num_items := 1 + (i % 3);
            o_total := 0;

            INSERT INTO orders (status, total_amount, notes, created_by, created_at, updated_at)
            VALUES (o_status, 0, 'Mesa ' || (i + day_offset % 8), waiter_id, o_ts, o_ts)
            RETURNING id INTO o_id;

            FOR j IN 1..num_items LOOP
                r_idx := 1 + ((day_offset + i + j) % array_length(recipe_ids, 1));
                qty := 1 + ((day_offset + j) % 3);
                unit_price := recipe_prices[r_idx];
                subtotal := unit_price * qty;
                o_total := o_total + subtotal;

                INSERT INTO order_items (order_id, recipe_id, quantity, unit_price, subtotal, created_at)
                VALUES (o_id, recipe_ids[r_idx], qty, unit_price, subtotal, o_ts);
            END LOOP;

            UPDATE orders SET total_amount = o_total WHERE id = o_id;
        END LOOP;
    END LOOP;

    -- Pedidos de hoy: mix de estados para KPI "pendientes"
    FOR i IN 1..6 LOOP
        o_ts := CURRENT_DATE + ((10 + i) || ' hours')::INTERVAL;

        CASE i
            WHEN 1 THEN o_status := 'PENDING';
            WHEN 2 THEN o_status := 'PREPARING';
            WHEN 3 THEN o_status := 'READY';
            WHEN 4 THEN o_status := 'DELIVERED';
            WHEN 5 THEN o_status := 'DELIVERED';
            ELSE        o_status := 'PREPARING';
        END CASE;

        r_idx := 1 + (i % array_length(recipe_ids, 1));
        qty := 1 + (i % 2);
        unit_price := recipe_prices[r_idx];
        subtotal := unit_price * qty;
        o_total := subtotal;

        IF i = 5 THEN
            r_idx := 1 + ((i + 1) % array_length(recipe_ids, 1));
            o_total := o_total + recipe_prices[r_idx] * 2;
        END IF;

        INSERT INTO orders (status, total_amount, notes, created_by, created_at, updated_at)
        VALUES (
            o_status, o_total,
            CASE i WHEN 1 THEN 'Mesa 12' WHEN 2 THEN 'Delivery #1042' WHEN 3 THEN 'Para llevar'
                   WHEN 4 THEN 'Mesa 5' WHEN 5 THEN 'Mesa 8' ELSE 'Delivery #1043' END,
            waiter_id, o_ts, o_ts
        )
        RETURNING id INTO o_id;

        INSERT INTO order_items (order_id, recipe_id, quantity, unit_price, subtotal, created_at)
        VALUES (o_id, recipe_ids[r_idx], qty, unit_price, unit_price * qty, o_ts);

        IF i = 5 THEN
            INSERT INTO order_items (order_id, recipe_id, quantity, unit_price, subtotal, created_at)
            VALUES (o_id, recipe_ids[1 + ((i + 1) % array_length(recipe_ids, 1))], 2,
                    recipe_prices[1 + ((i + 1) % array_length(recipe_ids, 1))],
                    recipe_prices[1 + ((i + 1) % array_length(recipe_ids, 1))] * 2, o_ts);
        END IF;
    END LOOP;

    -- Mermas distribuidas en 30 días (~35 registros)
    FOR i IN 1..35 LOOP
        day_offset := i % 30;
        w_idx := 1 + (i % array_length(prod_ids, 1));
        w_qty := ROUND((0.5 + (i % 5) * 0.3)::NUMERIC, 2);
        o_ts := (CURRENT_DATE - day_offset)
                + ((14 + (i % 6)) || ' hours')::INTERVAL;

        INSERT INTO waste_records (product_id, quantity, reason, registered_by, created_at)
        VALUES (
            prod_ids[w_idx],
            w_qty,
            w_reasons[1 + (i % array_length(w_reasons, 1))],
            chef_id,
            o_ts
        );
    END LOOP;

    -- Movimientos de inventario (compras, salidas, ajustes)
    FOR i IN 1..60 LOOP
        day_offset := i % 30;
        m_idx := 1 + (i % array_length(prod_ids, 1));
        m_type := mov_types[1 + (i % array_length(mov_types, 1))];
        m_qty := ROUND((5 + (i % 20))::NUMERIC, 2);
        o_ts := (CURRENT_DATE - day_offset)
                + ((7 + (i % 10)) || ' hours')::INTERVAL
                + ((i * 3) || ' minutes')::INTERVAL;

        SELECT stock INTO prev_stock FROM products WHERE id = prod_ids[m_idx];

        CASE m_type
            WHEN 'IN' THEN
                new_stock := prev_stock + m_qty;
            WHEN 'OUT', 'WASTE' THEN
                new_stock := GREATEST(0, prev_stock - LEAST(m_qty, prev_stock));
                m_qty := prev_stock - new_stock;
            ELSE
                new_stock := prev_stock + (CASE WHEN i % 2 = 0 THEN m_qty ELSE -m_qty END);
                new_stock := GREATEST(0, new_stock);
        END CASE;

        IF m_type IN ('OUT', 'WASTE') AND m_qty <= 0 THEN
            CONTINUE;
        END IF;

        INSERT INTO inventory_movements (
            product_id, user_id, movement_type, quantity,
            previous_stock, new_stock, notes, created_at
        )
        VALUES (
            prod_ids[m_idx],
            CASE WHEN m_type = 'IN' THEN manager_id ELSE chef_id END,
            m_type, m_qty, prev_stock, new_stock,
            CASE m_type
                WHEN 'IN'         THEN 'Reposición proveedor'
                WHEN 'OUT'        THEN 'Consumo cocina'
                WHEN 'WASTE'      THEN 'Merma registrada'
                ELSE 'Ajuste inventario'
            END,
            o_ts
        );

        UPDATE products SET stock = new_stock WHERE id = prod_ids[m_idx];
    END LOOP;
END $$;
