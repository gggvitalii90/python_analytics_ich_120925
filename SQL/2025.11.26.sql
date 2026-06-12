with cte as (
 
 select 'Ivan' as name, '2025-01-01' as dte, 11111 as phone
 union
  select 'Ivan' as name, '2026-01-01' as dte, null as phone
  union
  select 'Svetlana' as name, '2025-03-01' as dte, 2222 as phone
  )
--   select name,max(dte) from cte
--   group by name;


select * from (
select *,
ROW_NUMBER() over (PARTITION BY name order by dte desc) rn
from cte
) as z where rn = 1;

select * from (
select 
row_number() over(partition by order_id order by unit_price) as rn,
row_number() over(order by id) as rn2,
 od.*
 from   order_details as od
-- where order_id = 30
-- order by unit_price desc;
) as t 
-- where rn = 1;
 ;
 
 select * from (
select 
row_number() over (partition by order_id order by unit_price) as rn,
row_number() over(order by id) as rn2,
 od.*
 from   (
 
  select * from   order_details as od
 union all
  select * from   order_details as od
 
 )
 as od
-- where order_id = 30
-- order by unit_price desc;
) as t 
-- where rn = 1;

 ;
 
 select order_id,avg(quantity*unit_price) from order_details
  group by order_id;
  
  select 
  round(avg(quantity*unit_price) over (partition by order_id),2) as avg_1
  ,round(avg(quantity*unit_price) over (),2) as avg_2
  ,od.*
  from order_details as od;
  
  with table_1
as (  
select 840452722 as user_id, '2020-06-19' as event_dt, 5.81 as revenue
union 
select 840452722, '2020-06-21', 3.17
union 
select 840452722, '2020-06-24', 6.27
union 
select 840452722, '2025-06-24', null
union 
select 840452722, '2025-06-24', null
union 
select 840452722, '2025-06-24', null
union 
select 840452722, '2025-06-24', null
union 
select 840452722, '2025-06-24', null
union 
select 840452722, '2025-06-24', null
union 
select 840452722, '2025-06-24', null
union 
select 59432616, '2020-06-17',7.59

)

select 
avg(coalesce(revenue,0) ) over (partition by user_id) as avg_coalesce
,avg(revenue) over (partition by user_id) as avg_original
,t1.*
 from table_1 as t1;
 
 select 
round(sum(quantity*unit_price) over (PARTITION BY order_id),2) sum_
,round(min(quantity*unit_price) over (PARTITION BY order_id),2) min_
,round(max(quantity*unit_price) over (PARTITION BY order_id),2) max_
,round(avg(quantity*unit_price) over (PARTITION BY order_id),2) avg_
,count(quantity*unit_price) over (PARTITION BY order_id) count1_
,count(1) over (PARTITION BY order_id) count2_
,count(coalesce(quantity*unit_price,0)) over (PARTITION BY order_id) count3_
,od.* from order_details as od;


-- Из таблицы products выведите максимальный list_price для каждой строки, имя продукта и его list_price.
select * from products;
select product_name, 
list_price, 
max(list_price) over() as max_
from products
order by list_price desc;

-- Используя предыдущий запрос, посчитайте разницу в процентах между ценой продукта и максимальной ценой.
select p.product_name, 
p.list_price, 
max(list_price) over() as max_,
round((p.list_price - max(list_price) over())/ max(list_price) over()*100,2)
as '%'
from products as p
order by p.list_price desc;

select 100-(sa.list_price*100/sa.max_list_price) ,sa.* from 
(select max(pr.list_price) over() as max_list_price,
pr.product_name, pr.list_price
 from products as pr) as sa
order by sa.list_price desc;

-- Посчитайте количество продуктов в каждой категории с помощью оконной функции. Оптимально ли использование оконной функции для выполнения этого задания.
select count(id) over (partition by category) as cnt
,p.* from products as p;


-- Найдите разницу между standard_cost продукта и средним list_price по всей таблицы для каждой строки.

select 
round(standard_cost - avg(list_price) over (),2) as r 
, round(avg(list_price) over (),2) as avg_
, p.* from products as p;
-- Можно ли решить предыдущее задание без оконных функций.

select 
round(standard_cost -(select round(avg(list_price),2) as avg_ from products) ,2) as r 
, (select round(avg(list_price),2) as avg_ from products) as avg_
, p.*
from products as p
;