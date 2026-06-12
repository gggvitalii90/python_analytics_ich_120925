-- 1 Вывести id департамента , в котором работает сотрудник, в зависимости от Id сотрудника
select * from employees;
-- обновил данные в столбике department_id
update employees set department_id = 1000 where id = 1;
update employees set department_id = 2000 where id = 2;
update employees set department_id = 1000 where id = 3;
update employees set department_id = 2000 where id = 4;

DELIMITER $$
CREATE PROCEDURE p_dep(IN em_id int)
BEGIN
	SELECT department_id from employees where id = em_id;
END $$
DELIMITER ;
call p_dep(4);


-- 2 Создайте хранимую процедуру get_employee_age, которая принимает id сотрудника (IN-параметр) и возвращает его возраст через OUT-параметр.
DELIMITER $$
CREATE PROCEDURE get_employee_age(IN em_id int, out em_age int)
BEGIN
	SELECT age into em_age from employees where id = em_id;
END $$
DELIMITER ;

call get_employee_age(6, @em_age);
select @em_age;

-- 3 Создайте хранимую процедуру decrease_salary, которая принимает зарплату сотрудника (INOUT-параметр) и уменьшает ее на 10%.
DELIMITER $$
CREATE PROCEDURE decrease_salary(INOUT em_salary int)
BEGIN
	SELECT em_salary*0.9 into em_salary;
END $$
DELIMITER ;

set @em_salary = 100; -- тут можем как задавать цифру так и через (select salary from employees where id = 3) выбирать по сотруднику
call decrease_salary(@em_salary);
select @em_salary;

