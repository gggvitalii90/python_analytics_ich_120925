select * from information_schema.columns;
select * from customers;

-- Выведите информацию о каждом заказе, включая
-- идентификатор заказа OrderID, расчетную полную
-- стоимость заказа после применения скидки
-- NetPrice.

SELECT 
    *,
    unit_price * quantity AS Total_Price,
    unit_price * quantity * discount AS total_discount,
    (unit_price - unit_price * discount) * quantity AS NetPrice
FROM
    order_details
;

-- Выведите полный адрес каждого клиента,
-- объединяя адрес Address, город City и страну
-- Country в одну строку.

select *, concat(address," ", city, " ", country_region) as full_adress from customers
;

-- Выведите информацию о каждом сотруднике,
-- включая идентификатор сотрудника EmployeeID,
-- имя FirstName, фамилию LastName и роль Role, где
-- роль определяется на основе значения поля
-- IsManager (если значение 1, то "Manager", иначе
-- "Employee").

select id, first_name, last_name, 
case when is_manager  = 1 then "Manager" 
else "Employee"
end as Role, is_manager  from employees
;

-- Создать отчет, который показывает количество и
-- цену продуктов в текстовом формате, чтобы
-- представить информацию в более понятном виде
-- для конечных пользователей.
-- Количество и цена хранятся в числовом формате,
-- но для отчетов вы хотите объединить эти данные в
-- строку, которая будет легко читаться.

select list_price, unit_in_stock, 
concat('Цена: ', cast(list_price as char), '; Кол-во: ', cast(unit_in_stock as char)) as press
from products
;
-- Выведите дату и время отправки заказа
-- ShippedDate из таблицы Orders
-- В формате ДД/ММ/ГГГГ ЧЧММСС

select Shipped_Date, date_format(Shipped_Date, '%d/%m/%Y %H:%i:%s') as new_date from orders
;

-- Найдите дату, которая была 90 дней до текущей
-- даты.

select curdate() as Today, curdate() - 30 as last_date;

SELECT CURDATE(), DATE_SUB(CURDATE(), INTERVAL 90 DAY) AS PastDate;
SELECT DATE_ADD(CURDATE(), INTERVAL -90 year) AS FutureDate;
SELECT EXTRACT( Month FROM NOW()) AS CurrentYear;

SELECT TIME_TO_SEC('02:30:00') AS Seconds;

-- Найдите разницу в днях между датой заказа order_date и датой отправки shipped_date для всех заказов в таблице orders.
select order_date, shipped_date, datediff(shipped_date, order_date) as beetwen_day from orders
;

-- Использование скрытых преобразований.
-- Сложите строку, содержащую дату, с числом и выведите результат.
-- Объедините числовое значение с текстом и выведите результат в виде строки.

SELECT '2024-08-25' + 5 AS Result;

SELECT CONCAT('Total sales: $', 12345.67) AS SalesReport;

-- Извлеките год из даты получения заказа OrderDate.
select order_date, extract(year from order_date) as YEAR from orders
;
select order_date, date_format(order_date, '%Y') as YEAR, year(order_date) from orders
;

-- Преобразуйте текстовое значение, представляющее дату, в формат DATE.
select 'Дата - 2020.12.03' as Data, date_format('2020.12.03', '%Y-%m-%d') as Date;


