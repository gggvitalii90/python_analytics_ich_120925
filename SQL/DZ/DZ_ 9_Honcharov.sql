-- Таблица purchase_order_details
-- 1. Для каждого заказа order_id выведите минимальный, максмальный и средний unit_cost
select * from purchase_order_details;
select purchase_order_id
, round(min(unit_cost) over (partition by purchase_order_id),2) as min_
, round(max(unit_cost) over (partition by purchase_order_id),2) as max_
, round(avg(unit_cost) over (partition by purchase_order_id),2) as avg_
 from purchase_order_details
order by purchase_order_id;

-- 2.  Оставьте только уникальные строки из предыдущего запроса
select distinct pod.* from
(select purchase_order_id
, round(min(unit_cost) over (partition by purchase_order_id),2) as min_
, round(max(unit_cost) over (partition by purchase_order_id),2) as max_
, round(avg(unit_cost) over (partition by purchase_order_id),2) as avg_
 from purchase_order_details) as pod;

-- 3. Посчитайте стоимость продукта в заказе как quantity*unit_cost. 
-- Выведите суммарную стоимость продуктов с помощью оконной функции. 
-- Сделайте то же самое с помощью GROUP BY
select pod.*
, sum(quantity*unit_cost) over (partition by purchase_order_id, product_id) as total_price
 from purchase_order_details as pod
 order by purchase_order_id, product_id;

select *, sum(quantity*unit_cost) as total_price
from purchase_order_details
group by purchase_order_id, product_id
order by purchase_order_id, product_id;

-- 4. Посчитайте количество заказов по дате получения и posted_to_inventory. Если оно превышает 1 то выведите '>1' в противном случае '=1'
-- Выведите purchase_order_id, date_received и вычисленный столбец

select purchase_order_id, date_received
, count(purchase_order_id) over (partition by date_received, posted_to_inventory) as cnt
, case 
when count(purchase_order_id) over (partition by date_received, posted_to_inventory) > 1 then '>1'
else '=1' end as st
from purchase_order_details
order by date_received;

