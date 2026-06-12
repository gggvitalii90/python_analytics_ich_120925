-- 1   Вывести названия продуктов таблица products, включая количество заказанных единиц quantity для каждого продукта таблица order_details.
-- Решить задачу с помощью cte и подзапроса
select id, product_name  from products;
select product_id, quantity from order_details;
/*--------------------- обычный join -----------------------------*/
select p.id, p.product_name, sum(o.quantity)  from products as p
left join order_details as o on o.product_id = p.id
group by p.product_name
;
/*-------------------подзапросом-------------------------------*/
select p.id, p.product_name, o.kol  from 
(
(select id, product_name from products) as p
left join 
(select product_id, sum(quantity) as kol from order_details
group by product_id
) as o on o.product_id = p.id
)
;
/*------------------------CTE-------------------------------------*/
with p as
(
select id, product_name  from products
),
od as 
(
select product_id, sum(quantity) as kol from order_details
group by product_id
)
select p.id, p.product_name, od.kol from p
left join od on p.id = od.product_id
;

-- 2  Найти все заказы таблица orders, сделанные после даты самого первого заказа клиента Lee таблица customers.
select * from orders
where order_date > 
(
select min(order_date) from orders
where ship_name like "%Lee%"
);

select * from orders
where order_date >
(
select min(order_date) from orders as o
join customers as c
on o.customer_id = c.id
where last_name LIKE '%Lee%'
);


-- 3 Найти все продукты таблицы  products c максимальным target_level

select * from products
where target_level = 
(
select max(target_level) as max_t from products
);