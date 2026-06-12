-- 1 Выведите одним запросом с использованием UNION столбцы id, employee_id из таблицы orders и соответствующие им столбцы из таблицы purchase_orders 
--   В таблице purchase_orders  created_by соответствует employee_id
SELECT 
    id, employee_id
FROM
    orders 
UNION SELECT 
    id, created_by
FROM
    purchase_orders;


-- 2 Из предыдущего запроса удалите записи там где employee_id не имеет значения Добавьте дополнительный столбец со сведениями из какой таблицы была взята запись
SELECT 
    id, employee_id AS e_id, 'orders' AS Tab
FROM
    orders
WHERE
    employee_id IS NOT NULL 
UNION SELECT 
    id, created_by AS e_id, 'purchase_orders' AS Tab
FROM
    purchase_orders
WHERE
    created_by IS NOT NULL
;

-- 3 Выведите все столбцы таблицы order_details а также дополнительный столбец payment_method из таблицы purchase_orders Оставьте только заказы для которых известен payment_method
SELECT 
    od.*, po.payment_method
FROM
    order_details AS od
        JOIN
    purchase_orders AS po ON od.purchase_order_id = po.id
WHERE
    po.payment_method IS NOT NULL;

select * from purchase_orders;
select * from order_details;

-- 4 Выведите заказы orders и фамилии клиентов customers для тех заказов по которым были инвойсы таблица invoices
SELECT                                                      -- вывел все эти столбики чтоб можно было сопоставить Id
    o.id AS 'o.id',
    o.customer_id AS 'o.customer_id',
    c.id AS 'c.id',
    c.last_name AS 'c.last_name',
    i.id AS 'i.id',
    i.order_id AS 'i.order_id'
FROM
    orders AS o
        JOIN
    customers AS c ON o.customer_id = c.id
        JOIN
    invoices AS i ON o.id = i.order_id
;

select * from orders;
select * from customers;
select * from invoices;

-- 5 Подсчитайте количество инвойсов для каждого клиента из предыдущего запроса
SELECT 
    c.id AS 'c.id',
    c.last_name AS 'c.last_name',
    COUNT(i.id) AS 'count.id'
FROM
    orders AS o
        JOIN
    customers AS c ON o.customer_id = c.id
        JOIN
    invoices AS i ON o.id = i.order_id
GROUP BY c.id
;