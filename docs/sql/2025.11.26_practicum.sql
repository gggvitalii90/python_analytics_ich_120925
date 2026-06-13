-- Задание 1
-- 1. Для каждого заказа order_id выведите минимальный, максмальный и средний unit_price.
select * from order_details;
select od.order_id
, round(min(unit_price) over (partition by order_id),2) as min_
, round(max(unit_price) over (partition by order_id),2) as max_
, round(avg(unit_price)over (partition by order_id),2) as avg_
 from order_details as od
order by order_id, id;
-- 2. Оставьте только уникальные строки из предыдущего запроса.
select distinct od.order_id
, round(min(unit_price) over (partition by order_id),2) as min_
, round(max(unit_price) over (partition by order_id),2) as max_
, round(avg(unit_price)over (partition by order_id),2) as avg_
 from order_details as od
order by order_id, id;

-- 3. Посчитайте стоимость продукта в заказе как quantity*unit_price. Выведите суммарную стоимость продуктов
-- с помощью оконной функции. Сделайте то же самое с помощью GROUP BY.

select od.*
, round(sum(quantity*unit_price) over (partition by product_id, order_id),2) as total_price
from order_details as od
order by order_id, id;

select * 
, quantity*unit_price as total_price
from order_details
group by product_id, order_id;


select * from purchase_order_details;
select pod.*
, sum(quantity*unit_cost) over(partition by product_id, purchase_order_id) as total_price
from purchase_order_details as pod
-- group by product_id
;
-- Таблица purchase_order_details
-- 4. Посчитайте количество продуктов в каждом заказе с учетом их статуса с помощью оконной функции.
select pod.* 
, count(product_id) over (partition by purchase_order_id, posted_to_inventory) as cnt
from purchase_order_details as pod
;


-- 5. Посчитайте кумулятивную количество товаров quantity по дате получения date_received.
select pod.date_received 
, sum(quantity) over (order by date_received) as sum_
from purchase_order_details as pod
;

select * from purchase_order_details;

select po.quantity, po.date_received, sum(quantity) over 
(order by date_received, id ) 
from purchase_order_details as po;

select po.quantity, po.date_received, sum(quantity) over 
(partition by date_received order by id ) 
from purchase_order_details as po;

-- 6. Посчитайте кумулятивную выручку quantity*unit_cost по дате получения date_received для каждого
-- product_id.
select pod.* 
, sum(quantity*unit_cost) over (partition by product_id, date_received) as sum_
from purchase_order_details as pod
;



