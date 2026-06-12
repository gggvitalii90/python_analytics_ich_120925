select * from orders_status;
select * from order_details_status;

-- Выведите в одну общую выборку из таблиц customers и employees имена и фамилии клиентов и сотрудников.
select concat(last_name, ' ', first_name) as FIO, 'customer' as "Type" from customers
union
select concat(last_name, ' ', first_name), 'employee' from employees;

-- Добавьте дополнительный столбец в котором будет значение employee для сотрудника и customer для клиента.


select * from orders;
select * from order_details;

select * from orders
join  order_details
on orders.id = order_details.order_id
;

select 
orders.ship_address, sum(order_details.quantity*order_details.unit_price) as "Сумма заказов на адрес"
from orders
JOIN order_details
on orders.id = order_details.order_id
-- where orders.id = 30
group by ship_address;

select 
o.ship_address, sum(od.quantity*od.unit_price)
from orders as o
JOIN order_details as od
on o.id = od.order_id
group by o.ship_address;


select * 
from orders as o
JOIN order_details as od
on o.id = od.order_id;

select o.id , od.order_id
from orders as o
Left JOIN order_details as od
on o.id = od.order_id;

select * 
from orders as o
LEFT JOIN order_details as od
on o.id = od.order_id and od.unit_price >= 50;

-- 1. Выведите все строки из объединенных таблиц employees и employee_privileges с помощью INNER/RIGHT и LEFT JOIN. Объясните полученные результаты.
select * from employees;
select * from employee_privileges;

select * 
from employees as e
left JOIN employee_privileges as ep
on e.id = ep.employee_id
;

select * 
from employees as e
right JOIN employee_privileges as ep
on e.id = ep.employee_id;
select * from employees as e
JOIN employee_privileges as ep
;

select * 
from employees
JOIN employee_privileges;

-- 2. Выведите идентификаторы заказов из таблицы order_details. Дополнительно выведите вместо product_id столбец с именем продукта product_name из products.
select * from products;
select * from order_details;

select od.order_id, p.product_name
from products as p
join order_details as od
on p.id = od.product_id
;


-- 3. Используя предыдущий запрос, посчитайте количество заказов для каждого наименования продукта.

select p.product_name, count(od.order_id)
from products as p
left join order_details as od
on p.id = od.product_id
group by p.product_name
;

select p.product_name, count(od.order_id)
from order_details as od
join products as p
on od.product_id = p.id
group by p.product_name
;

-- 4. Выведите идентификаторы заказов из таблицы order_details. Дополнительно выведите вместо product_id
-- столбец с именем продукта product_name из products и столбец payment_amount из таблицы purchase_orders.
select * from products;
select * from order_details;
select * from purchase_orders;
select * from purchase_order_details;

select pod.product_id, po.payment_amount
from purchase_order_details as pod
join purchase_orders as po
on pod.purchase_order_id = po.id
;

select od.order_id, p.product_name
from products as p
join order_details as od
on p.id = od.product_id
join purchase_orders
;

-- 5. Оставить все строки из таблицы order_details.