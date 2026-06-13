-- Задание 1
-- Перевод сантиметров в дюймы. -- Создайте функцию для перевода сантиметров в дюймы.
-- Используйте формулу: -- 1 сантиметр = 0.393701 дюйма
DROP FUNCTION IF EXISTS converte;

-- DELIMITER //
-- CREATE FUNCTION converte(sm float)
-- Returns float
-- DETERMINISTIC
-- BEGIN
-- 	RETURN sm * 0.393701 ;

-- END 
-- // DELIMITER;

select converte(100);

/*
-- Задание 2
-- Расчет объема шара -- Создайте функцию для расчета объема шара, если известен радиус. 
-- Можно воспользоваться следующей формулой:
-- Где
-- ● V объем шара,
-- ● r — радиус шара,
-- ● π≈3.14159*/

DELIMITER //
create function sphere(rad float)
returns decimal(10,4)
deterministic
begin
return (4/3*pi()*pow(rad,3));
end //
DELIMITER ;

select sphere(10);

-- Задание 3
-- Перевод градусов в радианы -- Создайте функцию для перевода градусов в радианы.
-- Для перевода градусов в радианы используется следующая формула:
-- радианы = градусы * π/180, где π≈3.14159

DELIMITER //
create function f_grad(gr float)
returns decimal(10,4)
deterministic
begin
return (gr*pi()/180);
end //
DELIMITER ;

select f_grad(10);


DELIMITER //
create function f_skor(ras float, vrem float)
returns decimal(10,4)
deterministic
begin
	return (ras )/(vrem );
end //
DELIMITER ;

select f_skor(100,2) as skor;
select round(f_skor(316.5,4.2),2) as skor; -- 4 часа 12 мин

DELIMITER //
create function grad_2_rad1 (grad double)
returns double
DETERMINISTIC
begin
declare n double;
set n = grad*pi()/180;
return n;
end //
DELIMITER ;
select grad_2_rad1(15.5896);



