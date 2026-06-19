-- Reemplaza contraseñas en texto plano del seed por hashes bcrypt.
-- Contraseñas de demo sin cambiar: hashed_password_1 … hashed_password_4

UPDATE users
SET password_hash = '$2b$12$TIYpO6rL6/l7qiZuB3dY1OAjVVKuXotcgoLZulVdPdasrYzmZXc/C'
WHERE email = 'admin@kitchenflow.cl';

UPDATE users
SET password_hash = '$2b$12$SujHt475H6PJ4yT4.hyUkOrxCmKVSZh/Fwkc1tVaN913BJjxmGtWK'
WHERE email = 'manager@kitchenflow.cl';

UPDATE users
SET password_hash = '$2b$12$gxgwRDF8rVvsyw6pFDQYDORo0YGyEDNDt21zlBsY3VH5Y4BlYs1bi'
WHERE email = 'chef@kitchenflow.cl';

UPDATE users
SET password_hash = '$2b$12$kjFQy7s6J7DnDFxp0oOHUOT9R7/HHeVm9C6dOAyAXSKH4d7Nt2R/m'
WHERE email = 'waiter@kitchenflow.cl';
