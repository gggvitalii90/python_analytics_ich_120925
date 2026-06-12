-- 1. Выберите все строки из таблицы suppliers Предварительно подключитесь к базе данных northwind
use northwind;
SELECT 
    *
FROM
    suppliers;

/*
2. Выведите столбцы id, order_id из таблицы order_details, а также вычисляемый столбец category в зависимости 
от значений unit_price Если unit_price > 10 то значение столбца  category 'Expensive' В противном случае 'Cheap' 
Написать запрос двумя способами -  с применением операторов IF и CASE
*/
SELECT 
    id,
    order_id,
    unit_price, -- добавил столбик unit_price чтоб видеть правильно ли сработало условие по заданию его не надо было выводить
    CASE
        WHEN unit_price > 10 THEN 'Expensive'
        ELSE 'Cheap'
    END AS category
FROM
    order_details;
 
SELECT 
    id,
    order_id,
    unit_price, -- добавил столбик unit_price чтоб видеть правильно ли сработало условие по заданию его не надо было выводить
    IF(unit_price > 10,
        'Expensive',
        'Cheap') AS category
FROM
    order_details; 

-- 3. Вывести все строки там, где purchase_order_id не указано. При этом дополнительно создать столбец total_price как произведение quantity * unit_price
SELECT 
    *, quantity * unit_price AS total_price
FROM
    order_details
WHERE
    purchase_order_id IS NULL;

-- 4. Вывести один столбец из таблицы employees содержащий имя и фамилию написанные через пробел Вывести 3 строки начиная со второй
SELECT 
    CONCAT(first_name, ' ', last_name) AS 'ФИО'
FROM
    employees
LIMIT 3 OFFSET 1; -- начиная со второй это значит что пропускаем первую строку

-- 5. На основе таблицы orders вывести один столбец - с годом и месяцем из order_date в формате 'год-месяц'
SELECT 
    LEFT(order_date, 7) AS 'год-месяц' -- не припомню чтоб мы учили преобразование даты так чтоб месяц можно было словом вывести
FROM
    orders; 

SELECT
	LEFT(order_date, 7) AS "год-месяц",
	LEFT(order_date, 4) AS "год",
	CASE
		WHEN substring(order_date, 6, 2) = 01 THEN "январь"
		WHEN substring(order_date, 6, 2) = 02 THEN "февраль"
		WHEN substring(order_date, 6, 2) = 03 THEN "март"
		WHEN substring(order_date, 6, 2) = 04 THEN "апрель"
		WHEN substring(order_date, 6, 2) = 05 THEN "май"
		WHEN substring(order_date, 6, 2) = 06 THEN "июнь"
		WHEN substring(order_date, 6, 2) = 07 THEN "июль"
		WHEN substring(order_date, 6, 2) = 08 THEN "август"
		WHEN substring(order_date, 6, 2) = 09 THEN "сентябрь"
		WHEN substring(order_date, 6, 2) = 10 THEN "октябрь"
		WHEN substring(order_date, 6, 2) = 11 THEN "ноябрь"
		WHEN substring(order_date, 6, 2) = 12 THEN "декабрь"
		ELSE ''
	END AS "месяц"
FROM
	orders;

-- 6. Выведите уникальные имена компаний из таблицы customers Отсортируйте их по убыванию
SELECT DISTINCT
    company
FROM
    customers
ORDER BY company DESC;

-- 7. Отформатируйте стиль написания запросов


-- 8. Сохраните запросы в виде файла с расширением .sql и загрузите на платформу