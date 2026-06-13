-- Скалярный подзапрос

select * from orders
where customer_id in 
(select id from customers where id = 11  )
;
-- Многострочный подзапрос
select customer_id, count(*) as customer_id_cnt
from orders
group by customer_id
having count(customer_id) > 2;
;

select * from 
(
select customer_id as ID_CLIENT, count(*) as customer_id_cnt
from orders
group by customer_id
) as t
where customer_id_cnt >2;

-- Найти все заказы, сделанные клиентами из Лос-Анджелеса.
-- Для начала нужно найти клиентов из этого города. Используем таблицу customers.

select * from customers
where city = 'Los Angelas'
;

-- В выводимых результатах мы получаем один столбец содержащий id таких клиентов. Нужно отфильтровать данные из таблицы orders, оставив только эти customer_id.
select * from orders
where customer_id in (
select id from customers
where city = 'Los Angelas')
;

-- Найти 10 продуктов, которые были заказаны больше всего, и узнать общую сумму заказов  по этим продуктам.
select *from products;
select * from order_details;

select pr.id, pr.product_name, st.result,  st.cnt from
(
select product_id, sum(quantity*unit_price*(1-discount)) as result, count(product_id) as cnt from order_details
group by product_id
order by count(product_id) desc
limit 10) as st
join products as pr on pr.id = st.product_id
;

-- Найти среднюю цену - это одна конкретная цифра.
-- Сравнить столбец unit_price таблицы order_details с найденным значением.
select * from order_details;

select * from order_details
where unit_price <
(
select avg(unit_price) as avg_up from order_details
);

-- Найти все заказы таблица orders оформленных сотрудниками employee_id, в контактах которых таблица employees указан Sales Representative.
select * from orders as o
 join employees as e
 on o.employee_id = e.id
 where e.job_title = 'Sales Representative';

select * from orders 
where employee_id in (
select id from employees where job_title = 'Sales Representative'
);

-- CTE 
with query_1 as 
(
select 
product_id
,sum(quantity*unit_price) summ
,count(product_id) total_orders
 from order_details
group by product_id
order by count(product_id) desc
limit 10
),
query_2 as 
(
select id,product_name from products
)

select q2.product_name,
q1.summ, q1.total_orders
from query_1 as q1
join query_2 as q2
on q1.product_id = q2.id
;

with table_1 as 
(
select 1 as id
union
select 2 as id
),
table_2 as 
(
select 1 as id
union all
select 1 as id
union all 
select 3 as id
)

select * from table_1
join table_2
on table_1.id = table_2.id;

-- Выбрать все строки из таблицы order_details где unit_price больше среднего.
select * from order_details;
select avg(unit_price) as avg_u  from order_details;

with avg_up as 
(
select avg(unit_price) as avg_u from order_details
)

select * from order_details 
where unit_price > 
(
select avg_u from avg_up
)
;

select *, (select avg(unit_price) as avg_u from order_details) as avg_u  
from order_details 
where unit_price > 
(
(select avg(unit_price) as avg_u from order_details)
)
;

with avg_up as 
(
select avg(unit_price) as avg_u from order_details
)

select *, (select avg_u from avg_up) as avg_u
 from order_details 
where unit_price > 
(
select avg_u from avg_up
)
;

SELECT 
    p.product_name,
    (
     SELECT SUM(quantity) 
     FROM order_details as od 
     WHERE od.product_id = p.id
     ) AS total_quantity
FROM products as p