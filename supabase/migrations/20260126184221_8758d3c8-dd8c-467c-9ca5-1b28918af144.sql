-- Fix records with excessive decimals in n_suma and precio_venta_tienda_monday
UPDATE polizas_activas 
SET n_suma = ROUND(CAST(n_suma AS NUMERIC), 2)::TEXT,
    precio_venta_tienda_monday = ROUND(CAST(precio_venta_tienda_monday AS NUMERIC), 2)::TEXT
WHERE n_suma ~ '\.[0-9]{3,}' OR precio_venta_tienda_monday ~ '\.[0-9]{3,}';