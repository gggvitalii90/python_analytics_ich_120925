select employee_id from orders
group by employee_id
;

select 
  job_title, count(company) as cnt, count(distinct company) as d_cnt
  from customers
  group by job_title
  order by count(company) desc
  ;
  
-- Найдите общее количество товаров quantity в таблице order_details.
select sum(quantity) as "Кол-во товаров" from order_details;
select order_id, sum(quantity) as "Кол-во товаров" 
from order_details
group by order_id
;

-- Посчитайте количество уникальных order_id в таблице order_details.
select * from order_details;
select count(distinct order_id) from order_details;
select order_id, count(order_id)
 from order_details
 group by order_id
 order by count(order_id) desc
 ;

-- Перечислите через запятую имена всех сотрудников из таблицы employees.
select * from employees;
select count(first_name) as cnt_, group_concat(first_name) from employees;

-- Выведите среднее, минимум и макисиму столбца unit_price таблицы order_details.
select * from order_details;
select avg(unit_price), min(unit_price), max(unit_price), count(*), count(unit_price) from order_details;

-- 1. Из таблицы employees посчитать количество сотрудников в каждом городе city.
select city, concat(first_name, ' ', last_name) as FIO, count(id), count(*) 
from employees
group by city
;

-- 2. Отсортировать результаты по убыванию.
select city, concat(first_name, ' ', last_name) as FIO, count(id), count(*) 
from employees
group by city
order by count(first_name)  desc
;

-- 3. Посчитать общее количество продуктов из таблицы order_details для каждого заказа.
select order_id, count(product_id)
from order_details
group by order_id
;

-- 4. Отсортировать по убыванию общего количества продуктов. Для краткости записи в GROUP BY можно не
-- указывать конкретное имя колонки, а указать ее порядковый номер в SELECT.
-- 5. Сделать то же самое в ORDER BY.
select order_id, count(product_id)
from order_details
group by 1
order by 2 desc
;


-- 6. Посчитать сколько сотрудников работает в каждой компании из таблицы customers. Учитывать только
-- тех сотрудников, у которых job_id равен 'Purchasing Manager'.
select company,  job_title, count(id)
from customers
where job_title = 'Purchasing Manager'
group by company
;
select *
from customers
where job_title = 'Purchasing Manager'
;
-- 7. Если столбец, который вы хотите использовать для группировки содержит только уникальные
-- неповторяющиеся значения, то в группировке нет смысла - любая агрегатная функция даст один и тот
-- же результат. Попробуйте сгруппировать любую таблицу по первичному ключу и применить агрегатные
-- функции к столбцам.
select id, company, last_name, first_name, job_title
from customers
group by id
;

-- 8. Посчитать количество сотрудников в разрезе компании и занимаемой должности из таблицы employees.
select company, job_title, count(id)
from employees
group by company, job_title
;
select * from employees;

select order_id, count(product_id) 
from order_details
where product_id >2
group by order_id
HAVING count(product_id) >2;


-- Выбрать supplier_ids для тех поставщиков, у которых количество продуктов больше 2. Используем таблицу products
select supplier_ids, count(id)
from products
group by supplier_ids
HAVING count(id) >2
;


-- Вы можете использовать несколько условий в HAVING Сгруппировать продукты по standard_cost и list_price Посчитать количество продуктов и
-- вывести только те данные, где количество продуктов не менее 2
select standard_cost, list_price, count(id)
from products
group by standard_cost, list_price
HAVING count(id) >=2
;

-- Часто HAVING и WHERE используются вместе, чтобы максимально сузить набор данных перед тем, как применять агрегатные функции и группировку.
-- Выбрать только те продукты в quantity_per_unit встречается слово 'oz' как в нижнем так и в верхнем регистрах Сгруппировать по standard_cost
-- Оставить только данные где количество продуктов не менее 3
select standard_cost, quantity_per_unit, count(id)
from products
where lower(quantity_per_unit) Like "%oz%" 
group by standard_cost
HAVING count(id) >=3
;
select *
from products
where lower(quantity_per_unit) Like "%oz%" 
-- group by standard_cost
-- HAVING count(id) >=3
;