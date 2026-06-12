/*Составьте запрос чтобы: классифицировать товары таблицы products по их стоимости standard_cost, присваивая
-- каждому из них категорию:
-- ● "Дорогой" от 50
-- ● "Средний" от 20 до 50 включая 50
-- ● "Дешевый" до 20 включительно */

SELECT 
    standard_cost,
    CASE
        WHEN standard_cost > 50 THEN 'Дорогой'
        WHEN standard_cost > 20 THEN 'Средний'
        WHEN standard_cost <= 20 THEN 'Дешевый'
        ELSE ''
    END AS 'Класc'
FROM
    products;
    
/* Предположим, что вы хотите предоставить разные скидки discount клиентам таблицы customers в зависимости от их региона.

Составьте для этого запрос
• 'WA', 'CA' - 5% скидка
• 'ID', 'OR' - 7% скидка
• 'UT', 'NV' - 13% скидка
• Остальные - без скидки
*/

select *, 
case
	when state_province = 'WA' or state_province = 'CA' then '5%'
    when state_province = 'ID' or state_province = 'OR' then '7%'
    when state_province = 'UT' or state_province = 'NV' then '13%'
    else "без скидки"
    end as "Скидка"
from customers;

/*Вы хотите установить статус для заказов таблица orders в зависимости от даты отправки shipped_date и даты заказа
-- order_date. Составьте этот запрос.
-- ● Если нет данных в shipped_date то статус 'Ожидание отправки',
-- ● Если shipped_date = order_date, то 'Отправлено в день заказа'.
-- ● В остальных случаях -'Отправлено'.*/

select shipped_date, order_date,
case 
	when shipped_date is Null then 'Ожидание отправки'
    when shipped_date = order_date then 'Отправлено в день заказа'
    else 'Отправлено'
    end as "Статус"
from orders;

-- Напишите запрос для выбора пяти самых дешевых
-- продуктов standard_cost из таблицы products.
select *  from products
order by standard_cost
limit 5;


-- Напишите запрос для вывода имени продукта и
-- standard_cost.
select product_name, standard_cost  from products
order by standard_cost
limit 5;

-- Напишите запрос для выбора id десяти последних
-- заказов.
-- Таблица orders.
select id, order_date from orders
order by order_date desc
limit 10;

-- Напишите запрос для вывода первых 5 записей.
-- Таблица Customers:
select id, last_name, first_name from customers
limit 5
offset 2 ;

/*Предположим, что в products данные из интернетмагазина, где ассортимент продуктов выводится покупателю по страницам, отсортированный от А 
до Z по 10 продуктов на страницу.
Составьте запрос, который выведет этот список.*/
select id, replace(product_name,'Northwind Traders ', '') as product_name,
case
when product_name is not null  then 1
else ""
end as page 
 from products
order by product_name 
limit 10
offset 2;

-- Составьте запрос для выбора уникальных городов,
-- в которых находятся клиенты.
-- Таблица customers.
SELECT DISTINCT
    city
FROM
    customers
;
-- Из таблицы inventory_transactions вывести столбец quantity, а также рассчитанный на его основе столбец
-- category, который принимает значения 'Almost finish', если quantity меньше 20 и 'Enought', если quantity
-- больше либо равно 20. Решить задачу с помощью IF и CASE.
select quantity, 
case 
when  quantity < 20 then  'Almost finish'
when  quantity >= 20 then  'Enought'
else ''
end as category
 from inventory_transactions 
; 
select quantity, 
if(quantity < 20, 'Almost finish', 'Enought') as category
from inventory_transactions 
; 

-- 2. Из таблицы purchase_order_details вывести все строки, где purchase_order_id изменяется от 90 до 100
-- включительно. Добавить столбец с категорией по количеству Если quantity меньше 30 то 'small', от 30 до 70
-- включительно - 'medium', в остальных случаях 'large'.
select *, 
case 
when quantity < 30 then 'small'
when quantity between 30 and 70 then 'medium'
else 'large'
end as category
from purchase_order_details
where purchase_order_id between 90 and 100;

-- 3. Решите предыдущую задачу используя вложенные IF.

-- 4. Вывести уникальные значения purchase_order_id для строк где unit_cost больше 10. Отсортировать данные
-- по убыванию выводимого столбца. Таблица purchase_order_details.

select Distinct purchase_order_id from purchase_order_details
where unit_cost > 10 
order by purchase_order_id desc;

select * from purchase_order_details;


/*5. Вывести пять строк начиная со второй из customers, где job_title равно 'Owner'. Отсортировать строки в
алфавитном порядке по state_province.*/
select * from customers
where job_title = "Owner"
order by state_province
limit 5
offset 1;


/*6. Выбрать уникальные id продуктов из таблицы order_details в том случае, если суммарная стоимость
продукта quantity*unit_price превышает 200 отсортировать столбец по возрастанию и выбрать 7 строк.*/

select distinct id, quantity*unit_price from order_details
where quantity*unit_price > 200
order by quantity*unit_price
limit 7;


-- 7. Вывести инициалы - первую букву имени и первую букву фамилии сотрудника из таблицы employees.
select last_name, first_name, 
concat(left(last_name,1),'. ' ,left(first_name,1), '. ') as "Инициалы"
 from employees ;


/* 8. Вывести все строки и вычисляемый столбец - если payment_type не указан, то "No data" в остальных 
случаях значение столбца payment_type из таблицы orders.  Решить задачу с помощью "Если " и "CASE"  */
select *, 
case 
when payment_type is null then "No data"
else payment_type
end as Type_2
 from orders;
 
 select *, 
if(payment_type is null, "No data",payment_type) as Type_2
 from orders;

-- 9. Вывести имя и фамилию клиентов из таблицы customers в верхнем регистре.
select concat(UPPER(last_name),' ', UPPER(first_name)) as "ФИО", last_name, first_name,
case when left(last_name,1) = 'A' then concat('xxx', RIGHT(last_name, LENGTH(last_name) - 1))
end as Tun
from customers;

select left(last_name,-2) from customers;
