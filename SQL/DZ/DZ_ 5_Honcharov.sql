-- База данных northwind
USE `northwind`;

-- Работаем с таблицей purchase_order_details
-- 1 Посчитайте основные статистики - среднее, сумму, минимум, максимум столбца unit_cost.
SELECT avg(unit_cost) AS "Среднее",
       sum(unit_cost) AS "Сумма",
       min(unit_cost) AS "Минимум",
       max(unit_cost) AS "Максимум"
FROM purchase_order_details; 

-- 2 Посчитайте количество уникальных заказов purchase_order_id
SELECT 
    COUNT(DISTINCT purchase_order_id) AS 'Уникальные заказы'
FROM
    purchase_order_details;

 -- 3 Посчитайте количество продуктов product_id в каждом заказе purchase_order_id Отсортируйте полученные данные по убыванию количества

SELECT 
    purchase_order_id, COUNT(product_id) AS 'Кол-во товаров'
FROM
    purchase_order_details
GROUP BY purchase_order_id
ORDER BY 2 DESC;

 -- 4 Посчитайте заказы по дате доставки date_received Считаем только те продукты, количество quantity которых больше 30

SELECT date_received,
       count(purchase_order_id) AS "Кол-во заказов",
       count(product_id) AS "Кол-во товаров" ,
       sum(quantity) AS "Кол-во по инвентаризации" -- какое то двузначное задание сперва считаейте заказы потом только те продукты)
FROM purchase_order_details
WHERE quantity > 30
GROUP BY date_received;

 -- 5 Посчитайте суммарную стоимость заказов в каждую из дат Стоимость заказа - произведение quantity на unit_cost

SELECT date_received,
       round(sum(quantity * unit_cost),0) AS 'Суммарная стоимость заказов',
       date_format(date_received, '%W') AS "День недели"
FROM purchase_order_details
GROUP BY date_received
ORDER BY sum(quantity * unit_cost) DESC;

 -- 6 Сгруппируйте товары по unit_cost и вычислите среднее и максимальное значение quantity только для товаров где purchase_order_id не больше 100

SELECT unit_cost,
       AVG(quantity) AS "Среднее по quantity",
       max(quantity) AS "Максимум по quantity"
FROM purchase_order_details
WHERE purchase_order_id <= 100
GROUP BY unit_cost ;

 -- 7 Выберите только строки где есть значения в столбце inventory_id Создайте столбец category - если unit_cost > 20 то 'Expensive' в остальных случаях 'others'
-- Посчитайте количество продуктов в каждой категории

SELECT CASE
           WHEN unit_cost > 20 THEN 'Expensive'
           ELSE 'others'
       END AS category,
       COUNT(1) AS 'Кол-во продуктов'
FROM purchase_order_details
WHERE inventory_id IS NOT NULL
GROUP BY 1;