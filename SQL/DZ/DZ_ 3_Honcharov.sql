-- 1. Выведите Ваш возраст на текущий день в секундах 
SELECT 
    NOW() AS Today,
    '1990-10-01' AS birthday,
    REPLACE(FORMAT(TIMESTAMPDIFF(SECOND,
                CAST('1990-10-01' AS DATETIME),
                NOW()),
            0),
        ',',
        ' ') AS My_seconds;

-- 2. Выведите какая дата будет через 51 день
SELECT 
    CURDATE() AS Today,
    DATE_ADD(CURDATE(), INTERVAL 51 DAY) AS Next_date;

-- 3. Отформатируйте предыдущей запрос - выведите день недели для этой даты Используйте документацию My SQL
SELECT 
    CURDATE() AS Today,
    DATE_ADD(CURDATE(), INTERVAL 51 DAY) AS Next_date,
    DAYNAME((DATE_ADD(CURDATE(), INTERVAL 51 DAY))) AS Week_day;

-- 4.  Подключитесь к базе данных northwind Выведите столбец с исходной датой создания транзакции transaction_created_date из таблицы inventory_transactions, а также столбец 
-- полученный прибавлением 3 часов к этой дате
SELECT 
    transaction_created_date,
    DATE_ADD(transaction_created_date,
        INTERVAL 3 HOUR) AS New_date
FROM
    inventory_transactions
;

-- 5. Выведите столбец с текстом  'Клиент с id <customer_id> сделал заказ <order_date>' из таблицы orders
SELECT 
	customer_id, 
	order_date, 
	CONCAT('Клиент с id ', customer_id, ' сделал заказ ', order_date) as Text  
FROM 
	orders
;

-- Запрос написать двумя способами - с использованием неявных преобразований а также с указанием изменения типа данных для столбца customer_id
SELECT 
	customer_id, 
	order_date, 
	CONCAT('Клиент с id ', CAST(customer_id AS CHAR), ' сделал заказ ', order_date) AS Text 
FROM 
	orders
;

-- Внимание В MySQL функция CAST не принимает VARCHAR в качестве параметра для длины. Вместо этого, нужно использовать CHAR для указания длины. 


-- 6.  Отформатируйте стиль написания запросов


-- 7. Сохраните запросы в виде файла с расширением .sql и загрузите на платформу
