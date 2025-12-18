
-- Insert BERA motorcycles from polizas_activas into bd_bera (only those not already in inventory)
INSERT INTO bd_bera (placa, marca, modelo, anio_modelo, serial_chasis, serial_motor, color, cod_modelo, fecha)
SELECT 
  COALESCE(p.placa_monday, p.c_placa) as placa,
  p.s_marca as marca,
  p.s_modelo as modelo,
  CASE WHEN p.año_monday ~ '^[0-9]+$' THEN p.año_monday::integer ELSE NULL END as anio_modelo,
  p.serial_carroceria_monday as serial_chasis,
  p.serial_motor_monday as serial_motor,
  p.s_color as color,
  p.s_version as cod_modelo,
  CURRENT_DATE as fecha
FROM polizas_activas p
WHERE (p.placa_monday IS NOT NULL OR p.c_placa IS NOT NULL)
  AND UPPER(p.s_marca) LIKE '%BERA%'
  AND NOT EXISTS (
    SELECT 1 FROM bd_bera b 
    WHERE LOWER(b.placa) = LOWER(COALESCE(p.placa_monday, p.c_placa))
  );

-- Insert EMPIRE motorcycles from polizas_activas into bd_empire (only those not already in inventory)
INSERT INTO bd_empire (placa, marca, modelo, anio, serial_carroceria, serial_motor, color, version, transmision, fecha)
SELECT 
  COALESCE(p.placa_monday, p.c_placa) as placa,
  p.s_marca as marca,
  p.s_modelo as modelo,
  CASE WHEN p.año_monday ~ '^[0-9]+$' THEN p.año_monday::integer ELSE NULL END as anio,
  p.serial_carroceria_monday as serial_carroceria,
  p.serial_motor_monday as serial_motor,
  p.s_color as color,
  p.s_version as version,
  p.transmision_empire_monday as transmision,
  CURRENT_DATE as fecha
FROM polizas_activas p
WHERE (p.placa_monday IS NOT NULL OR p.c_placa IS NOT NULL)
  AND (UPPER(p.s_marca) LIKE '%EMPIRE%' OR UPPER(p.s_marca) LIKE '%KEEWAY%')
  AND NOT EXISTS (
    SELECT 1 FROM bd_empire e 
    WHERE LOWER(e.placa) = LOWER(COALESCE(p.placa_monday, p.c_placa))
  );
