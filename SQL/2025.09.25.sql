-- 1. Выбрать всех сотрудников с именами на букву А.
select * from employees
where first_name LIKE '%A%';
-- 2. Выбрать сотрудников, живущих в городах, названия которых заканчиваются на ‘mond’.
select * from employees
where city LIKE '_%mond';
-- 3. Выбрать домашние номера сотрудников, если в заметках которых (notes) есть упоминание французского 
-- языка (French), и в середине фамилии этого сотрудника (last_name) присутствует английская буква k.
select * from employees
where notes LIKE '%French%'
and last_name LIKE '%s%';