-- Создайте таблицу products с колонками id (INT) и product_name (VARCHAR), price.
-- Вставьте несколько записей в таблицу.
-- Создайте хранимую процедуру с IN-параметром для поиска имени товара по его идентификатору.
-- Вызовите эту процедуру и проверьте результат.

Create TABLE products (id int, product_name varchar(100), price decimal(10,2));

insert into products (id, product_name, price) 
values 
(001, 'Name_1', 53), 
(002, 'Name_2', 103),
(003, 'Name_3', 42.2),
(004, 'Name_4', 35.4);

select * from products;

DELIMITER $$
CREATE PROCEDURE get_product_name(IN get_id INT, out prod varchar(100))
BEGIN
 set prod = (SELECT product_name FROM products WHERE id = get_id);
END $$
DELIMITER ;

call get_product_name(2, @prod);
select @prod;

-- Создайте таблицу employees с колонками id (INT), name (VARCHAR), monthly_salary (INT).
-- Вставьте несколько записей в таблицу.
-- Создайте хранимую процедуру, которая возвращает годовую зарплату (ежемесячная зарплата * 12) через OUT-параметр.
-- Вызовите процедуру и проверьте результат, используя переменную для OUT-параметра.

Create TABLE employees_3 (id int, name_ varchar(100), monthly_salary int);

insert into employees_3 (id, name_, monthly_salary) 
values 
(001, 'emplo_1', 3253), 
(002, 'emplo_2', 1003),
(003, 'emplo_3', 4200),
(004, 'emplo_4', 3500);

select * from employees_3;

DELIMITER $$
CREATE PROCEDURE year_zp(IN id_em INT, out year_zp int)
BEGIN
	SELECT monthly_salary*12 into year_zp FROM employees_3 WHERE id = id_em;
END $$
DELIMITER ;

call year_zp(1, @year_zp);
select @year_zp;


-- Создайте хранимую процедуру, которая принимает значение бонуса для сотрудника, увеличивает его на 15% и возвращает новое значение через INOUT-параметр.
-- Создайте переменную для хранения значения бонуса.
-- Создайте хранимую процедуру с INOUT-параметром, которая увеличивает бонус на 15%.
-- Вызовите процедуру с начальными значениями и проверьте измененные значения.

DELIMITER $$
CREATE PROCEDURE p_bonus(INout e_bonus decimal(10,2))
BEGIN
	SELECT e_bonus*1.15 into e_bonus;
END $$
DELIMITER ;

SET @e_bonus = 100;
call p_bonus(@e_bonus);
select @e_bonus;


-- Выведите возраст сотрудника в зависимости от его Id.
select * from `employees`;
DELIMITER $$
CREATE PROCEDURE p_age_emplo(IN emp_id int)
BEGIN
	SELECT age from employees where id = emp_id;
END $$
DELIMITER ;
call p_age_emplo(3);


-- Создайте хранимую процедуру get_employee_salary, которая принимает id сотрудника (IN-параметр) и возвращает его зарплату через OUT-параметр.
DELIMITER $$
CREATE PROCEDURE get_employee_salary(IN emp_id int, out em_salary int)
BEGIN
	SELECT salary into em_salary from employees where id = emp_id;
END $$
DELIMITER ;
call get_employee_salary(3, @em_salary);
select @em_salary

-- Создайте хранимую процедуру increase_salary, которая принимает текущую зарплату сотрудника (INOUTпараметр) и увеличивает ее на 10%.
DELIMITER $$
CREATE PROCEDURE increase_salary(INout em_salary int)
BEGIN
	SELECT em_salary*1.1 into em_salary;
END $$
DELIMITER ;
set @em_salary = (select salary from employees where id = 3);
call increase_salary(@em_salary);
select @em_salary
