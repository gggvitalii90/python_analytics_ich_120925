-- Задание 1
use hr;
-- Работа с базой данных hr Таблица employees
select * from employees;

-- ● Найти всех сотрудников, работающих в департаменте с id 90.
select * from employees
where department_id = 90;
-- ● Найти всех сотрудников, зарабатывающих больше 5000.
select * from employees
where salary > 5000;
-- ● Найти всех сотрудников, чья фамилия начинается на букву L.
select * from employees
where last_name like "L%";
-- ● Вывести зарплату сотрудника с именем ‘Lexʼ и фамилией ‘De Haan'.
select concat(first_name," ", last_name) as FIO, salary from employees
where first_name like "%Lex%" and last_name like "%De Haan%";
-- ● Сформировать поле SALARY_GROUP которое принимает
		-- ○ значение 1, если зп сотрудника больше 10000
		-- ○ значение 0, если зп сотрудника меньше или равна 10000
select *, 
case 
when salary > 10000 then 1
when salary <= 10000 then 0
else null
end as 'SALARY_GROUP'
from employees
;
-- ● Найти среднюю зарплату тех сотрудников, которые зарабатывают меньше 10000. 
select *, avg(salary) from employees
where salary < 10000;

select *, sum(salary), count(*), sum(salary)/count(*) from employees
where salary < 10000;


-- Задание 2
-- Работа с базой данных world
use world;
-- ● Выведите список стран со столицами.
select * from country;
select * from city;
select c.Code, c.Name, ci.Name as Capital from country as c
left join city as ci
on c.Code = ci.CountryCode and c.Capital = ci.id
;

-- ● Выведите список стран с языками, на которых в них говорят.
select * from countrylanguage;

select c.Code, c.Name, cl.Language from country as c
join countrylanguage as cl
on c.Code = cl.CountryCode
;
-- ● Выведите список стран с официальными языками.
select c.Code, c.Name, cl.IsOfficial from country as c
join countrylanguage as cl
on c.Code = cl.CountryCode and cl.IsOfficial = 'T'
;
-- ● Сравните результаты (количество записей в результате) предыдущих запросов. Где в результате больше
-- записей?
select * from 
(
select count(*) as l from country as c
join countrylanguage as cl
on c.Code = cl.CountryCode
) as l
,(
select count(*) as o  from country as c
join countrylanguage as cl
on c.Code = cl.CountryCode and cl.IsOfficial = 'T'
) as o

;


-- Задание 3
-- Работа с базой данных Airlines.
use airport;
-- ● Вывести количество самолетов каждой модели.
select * from airliners;
select model_name, count(model_name) as cnt from airliners
group by model_name
order by count(model_name) desc;

-- ● Вывести количество самолетов по странам.
select country, count(country) as cnt from airliners
group by country;

-- ● Вывести количество trips для каждого типа лайнера.
select * from `trips`;

select a.model_name, count(t.id) as cnt_trips, count(*) from airliners as a
left join trips as t
on a.id = t.airliner_id
group by a.model_name
;

-- ● Вывести id билетов, цену билета и среднюю стоимость билета (таблица tickets).
select * from tickets;
select id, price, trip_id, sum(price)/count(trip_id) as avg_price from tickets
group by trip_id;

select * from tickets;
select id, price, (select avg(price) from tickets) as avg, price-(select avg(price) from tickets) as dif from tickets
;

-- ● Вывести среднюю стоимость билета в каждом классе обслуживания (service_class).
select * from tickets;
select service_class, sum(price)/count(service_class) as avg_price from tickets
group by service_class
order by service_class;

-- ● Вывести список поездок (trips) по убыванию количество билетов для каждой поездки.
select * from tickets;
select * from trips;
select trip_id, count(id) as avg_price from tickets
group by trip_id
order by count(id) desc;

select tr.*, count(t.id) as cnt from trips as tr
left join tickets as t
on tr.id = t.trip_id
group by tr.id
order by count(t.id) desc
;


-- ● 7 Изменить предыдущий запрос так, чтобы выводился ранк каждой поездки в зависимости от количества билетов в ней.
select trip_id, count(id) as avg_price,
case 
when count(id) > 2 then 'popular'
when count(id) <= 1 then 'Obscure'
else 'normal'
end as 'rank'
 from tickets
group by trip_id
order by count(id) desc;

select tr.*, count(t.id) as cnt, 
case 
when count(t.id) > 2 then 'popular'
when count(t.id) <= 1 then 'Obscure'
else 'normal'
end as 'rank'
 from trips as tr
left join tickets as t
on tr.id = t.trip_id
group by tr.id
order by count(t.id) desc
;