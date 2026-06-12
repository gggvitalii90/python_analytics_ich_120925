-- explan
select * from Employees_2
where ФИО = 'MARIA PETROVA';


CREATE UNIQUE INDEX idx_Employees_2_ФИО ON Employees_2 (ФИО);
CREATE INDEX idx_employee_name ON employees (name);
CREATE FULLTEXT INDEX idx_article_text ON articles (content);
CREATE INDEX idx_employee_name_age ON employees (name, age);


CREATE INDEX idx_Employees_BirthDate ON Employees (BirthDate);
SELECT * FROM Employees
WHERE BirthDate = '1993-10-23';


-- Создайте таблицу students с такими столбцами: id (INT), name (VARCHAR), age (INT), grade (DECIMAL).
Create Table students (
id INT, 
name_ VARCHAR(100),
age INT, 
grade DECIMAL
);
-- Заполните таблицу несколькими строками.
insert  into students (
id, name_, age, grade)
value
(01, 'Vitalii', 35, 10),
(02, 'Sasha', 19, 9),
(03, 'Sofa', 25, 11),
(04, 'Klara', 42, 8),
(05, 'Jony', 22, 7);

-- Создайте индекс на столбец age, чтобы ускорить поиск по возрасту.
CREATE INDEX idx_students_age ON students (age);

-- Напишите запрос, который выбирает всех студентов определенного возраста.
select * from students
where age = 35;
-- Просмотрите план выполнения запроса с помощью команды EXPLAIN.
explain
select * from students
where age = 35;

drop index idx_students_age on students