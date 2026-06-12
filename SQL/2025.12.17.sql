DELIMITER $$
CREATE PROCEDURE имя_процедуры
([параметры])
BEGIN
 -- тело процедуры
END $$
DELIMITER ;	


DELIMITER $$
CREATE PROCEDURE add_employee(
IN emp_name VARCHAR(100), 
IN emp_age INT, 
in salary int)
BEGIN
 INSERT INTO employees (name, age, salary)
VALUES (emp_name, emp_age, salary);
END $$
DELIMITER ;

CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    age INT,
    salary INT,
    department_id INT
);

CALL add_employee('John Doe', 30, 3109);
CALL add_employee('David Orson', 35, 4034);
CALL add_employee('Anna Liea', 35, 47923);
CALL add_employee('Michael Floar', 35, 347896);
CALL add_employee('Jost Langert', 35, 467);
CALL add_employee('Lukas Kapree', 35, 89070765);

select * from employees;
select avg(salary) from employees;

DELIMITER $$
CREATE PROCEDURE add_employee(IN emp_name VARCHAR(100), IN emp_age INT, in salary int)
BEGIN

CREATE TABLE if not exists employees2 ( 
id INT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(100),
 age INT, 
 salary INT, 
 department_id INT );

INSERT INTO employees2 (name, age, salary) VALUES (emp_name, emp_age, emp_salary);
END $$
DELIMITER ;

-- Создайте хранимую процедуру, которая принимает в качестве входного  параметра IN employee_id и возвращает в качестве выходного параметра 1  или 0. 
-- Если зарплата сотрудника выше средней зарплаты по всем  департаментам – 1, в противном случае – 0.

DELIMITER // 
Create procedure income_employee(in employee_id int, out param int)
begin 
declare salaryy decimal(10,2); -- объявлеяем с declare 
declare avg_salary decimal(10,2);
set salaryy = (select salary from employees where id = employee_id); -- присваеваем  с set 
set avg_salary = (select avg(salary) from employees);
if salaryy > avg_salary then set param = 1;
else set param = 0 ;
end if; 
end
//
DELIMITER ;

call income_employee(4,@param);
select @param

-- PROCEDURE
-- DDL Data Definition Language    
-- DML Data Manipulation Language
-- TCL Transaction Control Language 
-- DCL Data Control Language

DELIMITER $$
CREATE PROCEDURE get_employee_name(IN emp_id INT)
BEGIN
 SELECT name FROM employees WHERE id = emp_id;
END $$
DELIMITER ;

CALL get_employee_name(1);

DELIMITER $$
CREATE PROCEDURE get_employee_salary(IN emp_id INT, OUT emp_salary INT)
BEGIN
 SELECT salary INTO emp_salary FROM employees WHERE id = emp_id;
END $$
DELIMITER ;

SET @salary = 0; -- Инициализируем переменную
CALL get_employee_salary(2, @salary); -- Вызываем процедуру и передаем OUT-параметр
SELECT @salary; -- Просматриваем возвращенное значение

DELIMITER $$
CREATE PROCEDURE update_employee_salary(INOUT emp_salary INT)
BEGIN
 SET emp_salary = emp_salary * 1.2;
-- Увеличиваем зарплату на 20%
END $$
DELIMITER ;

SET @salary = 5000; -- Инициализируем переменную
CALL update_employee_salary(@salary); -- Передаем значение и получаем обновленное
SELECT @salary; -- Просматриваем измененное значение

update employees set salary = 1000 where id = 1;
update employees set salary = 2000 where id = 2;

DELIMITER //
CREATE PROCEDURE P_TEST(IN id_in int)
BEGIN

set id_in = id_in + 1;
-- удаляем таблицу если она есть
drop table if exists T_TEST;
-- создаем таблицу
create table T_TEST 
(id int);
-- вставляем 1 строку
insert into T_TEST (id) values (id_in);

END $$
DELIMITER ;

select @id_in;

DELIMITER $$

CREATE PROCEDURE get_employee_name(IN emp_id INT)
BEGIN
    SELECT name FROM employees WHERE id = emp_id;
END $$
DELIMITER ;

call get_employee_name(1);