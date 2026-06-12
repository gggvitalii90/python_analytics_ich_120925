-- Создать кастомные функции
-- Расчет площади круга
-- Создайте функцию для расчета площади круга, если известен его радиус.
-- Используйте формулу 
-- Где:
-- S — площадь круга,
-- r — радиус круга,
-- ​π≈3.14159, используйте функцию PI(), которая возвращает это число

DELIMITER //
create function pl_round(r float)
returns decimal(10,2)
Deterministic
begin
	return pi()*pow(r, 2);
end
// DELIMITER ;

select pl_round(10)

-- 2. Функция для расчета гипотенузы треугольника
-- Создайте функцию для расчета гипотенузы прямоугольного треугольника, если известны длины его катетов.
-- Используйте формулу 
-- Где:
-- c — длина гипотенузы прямоугольного треугольника,
-- a, b — длины его катетов

DELIMITER //
create function gipo(a int, b int)
returns decimal(10,2)
DETERMINISTIC
begin
	return SQRT(pow(a, 2)+pow(b, 2));
end
//
DELIMITER ;
select gipo(3,4)