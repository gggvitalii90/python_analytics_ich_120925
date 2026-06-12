create Database 120925_Honcharov;

-- Создать таблицу Employees со следующими столбцами:
-- EmployeeID
-- FirstName 
-- LastName
-- BirthDate 
-- HireDate
-- Salary
-- Email

-- Указать ограничения
-- EmployeeID - первичный ключ, увеличивается автоматически на 1 при добавлении записи
-- FirstName и LastName - строка длиной в 50 символов Не может быть пустой
-- BirthDate - дата
-- HireDate - дата по умолчанию указывается текущая дата
-- Salary - число с количеством цифр 2 после запятой Общее число знаков, включая запятую, 10 Должна быть больше 0
-- Email - строка длиной в 100 символов Должна быть уникальной

drop table Employees;
CREATE TABLE Employees
(
EmployeeID int AUTO_INCREMENT PRIMARY KEY,
FirstName VARCHAR (50) NOT NULL,
LastName VARCHAR (50) NOT NULL,
BirthDate DATE,
HireDate DATE DEFAULT (curdate()),
Salary DECIMAL(10,2) CHECK (Salary > 0),
Email VARCHAR(100) UNIQUE,
CREATED_ON timestamp default current_timestamp()
);

insert into Employees 
(FirstName, LastName, BirthDate, HireDate, Salary, Email)
values 
('Ivan', 'Ivanov', '1993-04-01', null, 1000.02, 'ivanov.i@gmail.com'),
('Maria', 'Petrova', '1998-05-02', curdate(), 2000.05, 'm.petrova@gmail.com'),
('Ser', 'Popov', '1993-10-23', curdate(), 3200.05, 's.popova@gmail.com'),
('Olga', 'Kristy', '1993-10-23', curdate(), 3200.05, 'o.kristy@gmail.com'),
('Mmila', 'Kolichuk', '1993-10-23', '2024-12-31', 3200.05, 'm.kolichuk@gmail.com'),
('Kara', 'Supov', '1923-04-01', '', 1000.02, 'kara.s@gmail.com')

;
/*insert into Employees 
(FirstName, LastName, BirthDate, HireDate, Salary, Email)
values                      вставка default значение надо делать отдельно
('Kara', 'Supov', '1923-04-01', '' , 1000.02, 'Kara.S@gmail.com');*/

delete from Employees where EmployeeID = 3;
select * from Employees;

CREATE TABLE Employees_2 
	AS 
	SELECT CONCAT(FirstName, ' ', LastName) AS 'ФИО'
	, HireDate
	, Salary 
		FROM
			Employees
		WHERE
			HireDate = CURDATE();

select * from Employees_2;

update Employees set Email = upper(Email);
update Employees set BirthDate = '1999-05-02' where EmployeeID = 5;
update Employees set Salary = '2001' where FirstName = 'Ivan';

update Employees_2 set ФИО = upper(ФИО);

update Employees set Salary = Salary * 1.1 where HireDate >= '2024-01-01';


CREATE view  v_Employees 
	AS 
	SELECT CONCAT(FirstName, ' ', LastName) AS 'ФИО'
	, HireDate
	, Salary 
		FROM
			Employees
		WHERE
			HireDate = CURDATE();
            
select * from v_Employees;





