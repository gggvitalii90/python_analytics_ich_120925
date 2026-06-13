DELIMITER //
CREATE FUNCTION square_root(x DOUBLE)
RETURNS DOUBLE
DETERMINISTIC
BEGIN
 RETURN SQRT(x);
END //
DELIMITER ;

DELIMITER $$
CREATE FUNCTION calculate_age(birthdate
DATE)
RETURNS INT
DETERMINISTIC
BEGIN
 RETURN TIMESTAMPDIFF(YEAR,
birthdate, CURDATE());
END $$
DELIMITER ;

select square_root(10);

select *, square_root(age) from students;

select calculate_age('1990-01-01') as age


DELIMITER //
CREATE FUNCTION greet_user(name
VARCHAR(100))
RETURNS VARCHAR(255)
DETERMINISTIC
BEGIN
 RETURN CONCAT('Hello, ', name,
'!');
END //
DELIMITER ;

select greet_user('тест');

select *, greet_user(name_) from students;

-- Создайте функцию для перевода текста в верхний регистр. Функция принимает строку и возвращает её в верхнем регистре.
DELIMITER //
CREATE FUNCTION upper_text(x varchar(100))
Returns varchar(100)
DETERMINISTIC
BEGIN
	RETURN upper(x);
END 
//
DELIMITER

select *, greet_user(name_), upper(name_) from students;

-- Функция для проверки, является ли число четным. Функция принимает целое число и возвращает 1, если оно четное, и 0, если нечетное. 
DELIMITER //
CREATE FUNCTION chet(x int)
Returns int
DETERMINISTIC
BEGIN
	if (x % 2 = 0) then RETURN 1 ;
    else return 0 ;
	end if; 
END 
// DELIMITER 


select chet(11) as ch