-- 1. Объедините с помощью UNION ALL названия компаний сотрудников из таблицы employees, названия
-- компаний клиентов из таблицы customers и названия компаний для поставщиков из таблицы suppliers.
SELECT 
    company
FROM
    employees 
UNION ALL SELECT 
    company
FROM
    customers 
UNION ALL SELECT 
    company
FROM
    suppliers;

-- 2. Объясните почему в предыдущем запросе не стоит использовать UNION ALL.Добавьте к предыдущему
-- запросу столбец, показывающий из какой таблицы была взята запись.
SELECT 
    company, 'employees' AS employees
FROM
    employees 
UNION SELECT 
    company, 'customers' AS customers
FROM
    customers 
UNION SELECT 
    company, 'suppliers' AS suppliers
FROM
    suppliers;

-- 3. У каких сотрудников в таблице employees нет привилегий таблица employee_privileges. Выведите имя и
-- фамилию.
select * from employees;
select * from employee_privileges;

SELECT 
    e.id,
    CONCAT(last_name, ' ', first_name) AS FIO,
    ep.employee_id,
    ep.privilege_id
FROM
    employees AS e
        JOIN
    employee_privileges AS ep ON e.id = ep.employee_id
;


-- 4. Работаем с таблице inventory_transactions. Выведите transaction_created_date, а также название типа транзакции и название продукта.
select * from inventory_transactions;
select * from products;
select * from inventory_transaction_types;

SELECT 
    it.id,
    it.transaction_type,
    it.transaction_created_date,
    it.product_id,
    p.id,
    p.product_name,
    itt.id,
    itt.type_name
FROM
    inventory_transactions AS it
        JOIN
    products AS p ON it.product_id = p.id
        JOIN
    inventory_transaction_types AS itt ON it.transaction_type = itt.id
;


-- 5. Используя предыдущий запрос, посчитайте количество транзакций по типу. Оставьте только те типы транзакций, в которых отсутствует слово 'Sold'.
SELECT 
	count(it.transaction_type),
    it.id,
    it.transaction_type,
    it.transaction_created_date,
    it.product_id,
    p.id,
    p.product_name,
    itt.id,
    itt.type_name
FROM
    inventory_transactions AS it
        JOIN
    products AS p ON it.product_id = p.id
        JOIN
    inventory_transaction_types AS itt ON it.transaction_type = itt.id
WHERE
	itt.type_name = "Sold"
;

-- 6. В таблице orders расшифруйте значения всех столбцов, в именах которых присутствует 'id' и для которых в
-- базе данных имеются соответствующие таблицы. Выведите все строки в которых ship_city  = "Seattle".
-- Объясните почему в данном случае важно использовать LEFT JOIN.
select * from orders
-- where ship_city  = "Seattle"
;
select * from orders_tax_status;

select o.id, o.ship_city, 
o.customer_id, c.id as "c.id", 
o.employee_id, e.id as "e.id", 
o.shipper_id, s.id as "s.id", 
-- o.tax_status_id, ots.id
o.status_id, os.id as "os.id"
from orders as o
join customers as c on o.customer_id = c.id
join employees as e on o.employee_id = e.id
join shippers as s on o.shipper_id = s.id
-- join orders_tax_status as ots on o.tax_status_id = ots.id
join orders_status as os on o.status_id =  os.id
where ship_city  = "Seattle"
;


o.employee_id - customers - c.id
o.customer_id - employees - e.id
o.shipper_id - shippers - s.id
o.tax_status_id - orders_tax_status - ots.id
o.status_id - orders_status - os.id