select id
,product_id
,quantity,unit_cost
,sum(quantity*unit_cost) over (PARTITION BY product_id) as sum_
,avg(quantity*unit_cost) over (PARTITION BY product_id) as avg_
,min(quantity*unit_cost) over (PARTITION BY product_id) as min_
,max(quantity*unit_cost) over (PARTITION BY product_id) as max_
,count(quantity*unit_cost) over (PARTITION BY product_id) as count_

,row_number() over (partition by product_id) as row_number_
,rank() over (order by product_id) as rank_
,dense_rank() over (order by product_id) as dense_rank_
,ntile(20) over () as ntile_
from purchase_order_details;

with purchase_order_details_dubls as (
select *,1 tbl1,'Bremen' as city  from purchase_order_details
union all
select *,2,'Berlin' from purchase_order_details
union all
select
'238','90','1','40.0000','14.0000','2006-01-22 00:00:00','1','59','3','Hamburg'
union all
select
'238','91','2','2999.0000','14.0000','2021-01-22 00:00:00','13','56','3','Dresden'
)



select id, purchase_order_id, product_id, quantity, unit_cost, date_received, posted_to_inventory, inventory_id, city
 from (
select *
,ROW_NUMBER() over (partition by 
id, purchase_order_id, product_id, quantity, unit_cost, date_received, posted_to_inventory, inventory_id
order by tbl1 desc) as rn
from 
purchase_order_details_dubls
-- where id = 238
) as t
where rn = 1
;
with purchase_order_details_dubls as (
select *,1 tbl1,'Bremen' as city  from purchase_order_details
union all
select *,2,'Berlin' from purchase_order_details
union all
select
'238','90','1','40.0000','14.0000','2006-01-22 00:00:00','1','59','3','Hamburg'
union all
select
'238','91','2','2999.0000','14.0000','2021-01-22 00:00:00','13','56','3','Dresden'
)


select 
id, purchase_order_id, product_id, quantity, unit_cost, date_received, posted_to_inventory, inventory_id, 
GROUP_CONCAT(" ",city) as prt
from purchase_order_details_dubls
group by 
id, purchase_order_id, product_id, quantity, unit_cost, date_received, posted_to_inventory, inventory_id;


-- Присвоить ранг продукту без пропусков значений в ранге от больше себестоимости к меньшей. Вывести ТОП 10 продуктов product_name.
select * from products;
select id, product_name, list_price,
dense_rank () over (order by list_price desc) as dr
 from products
 limit 10;

-- Пронумеровать строки в таблице в зависимости от названия товара от A до Z.
select id, replace(product_name, 'Northwind Traders','') as new_name,
row_number () over (order by replace(product_name, 'Northwind Traders','')) as rn
 from products;

-- Разделить все продукты на 4 равных группы в зависимости от list_price.
-- Вывести имя продукта, list_price и номер группы. 
select id, product_name, list_price,
ntile(4) over (order by list_price desc) as nt
from products;

select id, product_name, list_price,
ntile(20) over () as nt
from products;



select id,order_id,quantity,
lead(quantity) over (partition by order_id) as lead_quantity,
lead(quantity) over (partition by order_id order by id) as lead_quantity_with_sort,
lag(quantity) over (partition by order_id) as lag_quantity,
lag(quantity) over (partition by order_id order by id) as lag_quantity_with_sort 
 from order_details;
 
select 
od.order_id,od.product_id,o.ship_address,o.id,
max(o.ship_address) over (partition by od.product_id ) as max_ship_address ,
last_value(o.ship_address) over (partition by od.product_id ) as last_value_ship_address,

max(od.order_id) over (partition by od.product_id ) as max_ship_address ,
last_value(od.order_id) over (partition by od.product_id ) as last_value_ship_address
-- min(o.ship_address) over (partition by od.product_id ) as min_ship_address ,
-- first_value(o.ship_address) over (partition by od.product_id order by od.order_id) as first_value_ship_address

from orders as o 
left join order_details as od
on o.id = od.order_id
where od.product_id = 48
;

with cte as (
select '2025-01-01' as dte, 11 as unit_price, 1 as id
union all
select '2025-02-01' as dte, 13 as unit_price, 2 as id
union all
select '2025-02-01' as dte, 12 as unit_price, 3 as id
union all
select '2025-03-12' as dte, 14 as unit_price, 4 as id
union all
select '2025-03-11' as dte, 15 as unit_price, 5 as id
union all
select '2025-03-10' as dte, 16 as unit_price, 6 as id
) 


select *, NTH_VALUE(unit_price,2) over (partition by year(dte),month(dte)
)
from cte;


select od.order_id,od.product_id,o.ship_address,o.id, 
row_number() over (partition by od.product_id order by od.order_id desc) rn,
max(order_id) over(partition by od.product_id),
max(order_id) over(partition by od.product_id order by od.order_id desc)
from orders as o 
left join order_details as od
on o.id = od.order_id
where od.product_id = 48;

with cte as (
select '2025-01-01' as dte, 11 as unit_price, 1 as id
union all
select '2025-02-01' as dte, 13 as unit_price, 2 as id
union all
select '2025-02-01' as dte, 12 as unit_price, 3 as id
union all
select '2025-03-12' as dte, 14 as unit_price, 4 as id
union all
select '2025-03-12' as dte,999 as unit_price, 7 as id
union all
select '2025-03-11' as dte, 15 as unit_price, 5 as id
union all
select '2025-03-10' as dte, 1000000 as unit_price, 6 as id

)


select *,
first_value(unit_price) over (partition by year(dte),month(dte) order by dte desc) as firts_,
last_value(unit_price) over (partition by year(dte),month(dte) order by dte ) as last_,
nth_value(unit_price,3) over (partition by year(dte),month(dte) order by dte) as nth_,
null,
last_value(unit_price) over (partition by year(dte),month(dte) order by dte 
 rows BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as richtig_last_
 from cte
--  LAST_VALUE берёт последнее значение из текущего окна
-- НО окно по умолчанию ограничено до текущей строки
 ;
