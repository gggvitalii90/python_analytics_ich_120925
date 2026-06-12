-- 1. Выведите текущую дату и время
select now();
select current_timestamp();
-- 2. Выведите день недели, когда был сделан каждый заказ из таблицы orders
select order_date, date_format(order_date, '%W') as Day_of_week,
case 
when date_format(order_date, '%W') = 'Monday' then 'Montag'
when date_format(order_date, '%W') = 'Thursday' then 'Dienstag'
when date_format(order_date, '%W') = 'Wednesday' then 'Mitwoch'
when date_format(order_date, '%W') = 'Thursday' then 'Donnerstag'
when date_format(order_date, '%W') = 'Friday' then 'Freitag'
when date_format(order_date, '%W') = 'Saturday' then 'Samstag'
when date_format(order_date, '%W') = 'Sunday' then 'Sonntag'
end as Wochentag,
date_format(order_date, '%w') as NUm_Day_of_week
from orders;



-- 3. Добавьте 30 дней к дате каждого заказа в таблице orders и выведите результат
select order_date, date_add(order_date, interval 30 Day) as Next_date from orders
;

-- 4. Выведите количество дней между датой заказа и датой доставки для каждого заказа из таблицы orders
SELECT 
    order_date,
    shipped_date,
    DATEDIFF(shipped_date, order_date) AS between_date
FROM
    orders;

-- 5. Найдите все заказы, сделанные в пятницу из таблицы orders
select *, date_format(order_date, '%W') from orders
where date_format(order_date, '%w') = 5
;

-- 6. Выведите дату, которая будет через 100 дней от текущей:
select current_date() as Today, date_add(current_date(), interval 100 Day) as next_date;

-- 7. Выведите заказы, сделанные в выходные дни (суббота и воскресенье) из таблицы orders
select *, date_format(order_date, '%W') from orders
where date_format(order_date, '%w') = 6 
or
 date_format(order_date, '%w') = 0 
;
select *, date_format(order_date, '%W') from orders
where date_format(order_date, '%w') in (6 , 0) 
;

-- 8. Найдите количество дней до конца текущего года
select current_date() as Today, datediff('2025-12-31', current_date()) as to_new_year;
SELECT 
    CURDATE(),
    CONCAT(YEAR(CURDATE()), '-12-31') AS end_year,
    DATEDIFF(CONCAT(YEAR(CURDATE()), '-12-31'),
            CURDATE()) AS to_new_year;

-- 9. Выведите дату, которая была 15 дней назад от текущей даты
select current_date() as Today, date_add(current_date(), interval -15 Day) as last_date;

-- 10. Примените явное преобразование Выведите столбец id из таблицы customers в виде строки
select id, cast(id as Char) as text_id from customers
;
