-- 1 Выберите только те строки из таблицы suppliers, где company имеет значение Supplier A

SELECT * FROM suppliers
WHERE company  = "Supplier A";

-- 2 Вывести все строки там, где purchase_order_id не указано. При этом дополнительно создать столбец total_price как произведение quantity * unit_price

SELECT *, quantity * unit_price AS total_price FROM order_details po
WHERE po.purchase_order_id IS null
;

-- 3 Выведите какая дата будет через 51 день
SELECT CURDATE() AS TODAY, ADDDATE(CURDATE(), INTERVAL 51 DAY) AS NEW_DATE;

-- 4  Посчитайте количество уникальных заказов purchase_order_id
SELECT count(DISTINCT(pod.purchase_order_id)) AS Uniq FROM purchase_order_details pod;


-- 5 Выведите все столбцы таблицы order_details, а также дополнительный столбец payment_method из таблицы purchase_orders. Оставьте только заказы для которых известен payment_method

SELECT od.*, po.payment_method FROM order_details od
LEFT JOIN 
purchase_orders po 
ON od.purchase_order_id = po.id
WHERE po.payment_method IS NOT NULL;
