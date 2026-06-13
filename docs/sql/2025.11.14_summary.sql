-- 1. У каких сотрудников в таблице employees нет привилегий таблица employee_privileges. Выведите имя и фамилию. 
-- Выполните задание тремя способами - с помощью left join, подзапроса и сte.
select * from employees;
select * from employee_privileges;
select * from privileges;

select e.id, e.company, concat(e.last_name, " ", e.first_name) as FIO,  
case when ep.privilege_id is null then "NOT privilege" else ep.privilege_id end as status  from employees as e
left join employee_privileges as ep
on e.id = ep.employee_id
;
/*----------------------------------------------------------------------------------*/
with e as 
(
select id, company, concat(last_name, " ", first_name) as FIO from employees
),
ep as
(
select employee_id, privilege_id from employee_privileges
)
select e.id, company, FIO, case when ep.privilege_id is null then "NOT privilege" else ep.privilege_id end as status from e
left join ep
on e.id = ep.employee_id
;
/*----------------------------------------------------------------------------------*/
select id, company, concat(last_name, " ", first_name) as FIO, 
case when
(select privilege_id from employee_privileges where employee_id = id) is null then "NOT privilege" 
else 
(select privilege_id from employee_privileges where employee_id = id) 
end as status
 from employees;
/*----------------------------------------------------------------------------------*/
select 
e.last_name
, e.first_name
, e.job_title
, case when ep.privilege_id is null then 'No'
else 'Yes'
end as status_pr
, coalesce(p.privilege_name, '---') as "privilege_name"
from employees as e
left join employee_privileges as ep
on e.id = ep.employee_id
left join privileges as p
on ep.privilege_id = p.id;


-- 2. Выберите только тех сотрудников из таблицы, имя которых содержит английскую букву 'e' или их job_title =
-- Sales Representative. Из заказов orders выберите заказы в которых город отправки ship_city = Las Vegas.
-- Проверьте, отправляли ли найденные сотрудники заказы в Las Vegas. Решите задачу с помощью
-- подзапросов и cte.
select id, company, concat(last_name, " ", first_name) as FIO, email_address from employees where first_name Like '%e%' or job_title = 'Sales Representative';
select * from orders where ship_city = 'Las Vegas';
select DISTINCT employee_id, ship_city from orders where ship_city = 'Las Vegas';

select e.id, e.company, concat(e.last_name, " ", e.first_name) as FIO, coalesce(o.ship_city, "another City") as  City
from employees as e 
left join (select DISTINCT employee_id, ship_city from orders where ship_city = 'Las Vegas') as o 
on o.employee_id = e.id
where first_name Like '%e%' or job_title = 'Sales Representative'
;
select * from 
(
select id, company, concat(last_name, " ", first_name) as FIO from employees where first_name Like '%e%' or job_title = 'Sales Representative'
) as e
where id in (select employee_id from orders where ship_city = 'Las Vegas')
;




-- 3. Выберите клиентов из компаний A, B, C, D, F. Проверьте, делали ли они заказы orders, используя
-- перевозчика shipper_id = 3. Выведите имя клиента и наименование перевозчика company из таблицы
-- shippers. Решить задачу тремя способами - с помощью JOIN, подзапросов и временных таблиц.
select id, company, concat(last_name, " ", first_name) as FIO from customers where company in ("Company A", "Company B", "Company C", "Company D", "Company F");
select * from orders where shipper_id = 3;
select id, company from shippers;

select * from (
select id, company, concat(last_name, " ", first_name) as FIO from customers where company in ("Company A", "Company B", "Company C", "Company D", "Company F")) as c
left join (select id, customer_id, shipper_id,  ship_name from orders where shipper_id = 3) as o
on o.customer_id = c.id
left join (select id, company from shippers) as s
on o.shipper_id = s.id
;
