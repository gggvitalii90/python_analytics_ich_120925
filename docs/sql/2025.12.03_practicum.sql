-- Из таблицы purchase_orders для каждого поставщика supplier_id выведите дату создания заказа, а также дату создания предыдущего заказа. Посчитайте разницу между этим датами.
select id, supplier_id, creation_date, 
lag(creation_date) over (partition by supplier_id order by creation_date) as pred,
datediff(creation_date, lag(creation_date) over (partition by supplier_id order by creation_date)) as rz
from purchase_orders;

-- Измените предыдущий запрос таким образом, чтобы узнать среднее время между двумя заказами.
select cte.id, avg(rz) as avg_ from (
select id, supplier_id, creation_date, 
lag(creation_date) over (partition by supplier_id order by creation_date) as pred,
datediff(creation_date, lag(creation_date) over (partition by supplier_id order by creation_date)) as rz
from purchase_orders) as cte;

-- Напишите аналогичный второму задания запрос, но с использованием функции LEAD. Сравните результаты.
select id, supplier_id, creation_date, 
lag(creation_date) over (partition by supplier_id order by creation_date) as pred,
lead(creation_date) over (partition by supplier_id order by creation_date desc) as pred2,
datediff(creation_date, lag(creation_date) over (partition by supplier_id order by creation_date)) as rz
from purchase_orders;

-- Нaйдите самую раннюю дату submitted_date для каждого менеджера created_by. Решите данное задание использую оконные функции MIN и FIRST VALUE. Сравните результаты.
select * from purchase_orders;
select id, created_by, submitted_date
, first_value(submitted_date) over (partition by created_by) as fv
, min(submitted_date) over (partition by created_by ) as m
from purchase_orders;


-- Таблица purchase_order_details
-- Для каждого product_id выведите дату его получения date_received, предыдущую и последующую даты получения этого продукта. Оставьте только строки где date_received не является пропуском.
select * from purchase_order_details;
select product_id, date_received 
, lag(date_received) over (partition by product_id order by date_received) as pr
, lead(date_received) over (partition by product_id order by date_received) as pos
from purchase_order_details
where date_received is not null
;


-- Найдите время отправки заказа date_received и время отправки предыдущего заказа. Для начала оставьте только уникальные пары purchase_order_id, date_received и  
-- отфильтруйте строки, там где  date_received не указано. Запишите результат в CTE и дальше работайте с ним.
select * from (
select purchase_order_id, date_received 
, lag(date_received) over (order by date_received) as pr
from purchase_order_details) as pod
where pod.date_received is not null or ''
group by pod.purchase_order_id, pod.date_received
;

select * from purchase_order_details;
 
with cte as (
select distinct purchase_order_id, date_received from purchase_order_details
where date_received is not Null
)
select *, lag(date_received) over (order by date_received) as lag_data_received from cte
;
-- Выведите максимальное количество quantity и минимальный unit_cost для каждого inventory_id с помощью функции FIRTS VALUE.
select id, inventory_id, quantity, unit_cost
,first_value(quantity) over (partition by inventory_id order by quantity desc) as max_q_first
,first_value(unit_cost) over (partition by inventory_id order by unit_cost) as min_uc_first
from purchase_order_details;


-- Выведите одно значения – насколько в среднем отличается unit_cost для каждой строки от максимального unit_cost.
select avg(raz_) from (
select 
first_value(unit_cost) over (order by unit_cost desc) - unit_cost as raz_
from purchase_order_details) as pod;

select avg(raz_) from (
select 
max(unit_cost) over () - unit_cost as raz_
from purchase_order_details) as pod;

-- select 
-- avg(max(unit_cost) over () - unit_cost) as raz_
-- from purchase_order_details
-- так не работае

-- Выберите ТОП 5 продуктов с максимальным quantity, используя DENSE RANK.
select * from (
select product_id, quantity 
, dense_rank() over (partition by product_id order by quantity desc) as dr

from  purchase_order_details) as pod
where dr = 1
group by product_id
order by quantity desc
limit 10;


-- Пронумеруйте строки в соответствии с убывание inventory_id. Выведите только 13 строчку.
