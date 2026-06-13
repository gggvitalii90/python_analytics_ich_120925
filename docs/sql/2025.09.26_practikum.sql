select * from orders
where ship_city in ("Chicago", "Miami")
and shipping_fee between 0 and 60;
/* -----------------------------------------*/
select * from products
where standard_cost between 10 and 20;
/* -----------------------------------------*/
select * from orders
where payment_type is null
and ship_state_province = "CA";
/* -----------------------------------------*/
select * from employees
where last_name LIKE "C%";
/* -----------------------------------------*/

/* Найдите всех клиентов в таблице customers, которые проживают в городах
Minneapolis, Denver, Boston или работают в качестве Purchasing Manager (колонка job_title).*/
select * from customers
where city in ("Minneapolis","Denver","Boston")
or job_title = "Purchasing Manager";
/* -----------------------------------------*/

/*5. Измените предыдущий запрос таким образом, чтобы из предыдущего результата выводились только записи там где state_province Колородо 'CO'.*/
select * from customers
where state_province = "CO"
and (city in ("Minneapolis","Denver","Boston")
or job_title = "Purchasing Manager");
/* -----------------------------------------*/

/*6. Выведите все строки из таблицы products там где minimum_reorder_quantity входит в диапазон от 10 до 25,
включая концы и quantity_per_unit включает в себя слово 'boxes'. Кроме того? standard_cost должен быть
менее 10.*/
select * from products
where minimum_reorder_quantity between 10 and 25
and quantity_per_unit LIKE "%boxes%"
and standard_cost >10;
/* -----------------------------------------*/

-- 7. Измените предыдущий запрос заменив операторы and на or Объясните какие строки выводятся в данном запросе.
select * from products
where minimum_reorder_quantity between 10 and 25
or  quantity_per_unit LIKE "%boxes%"
or  standard_cost >10;
/* -----------------------------------------*/
-- 8. Подумайте одинаковый ли результат дадут эти два запроса.
/* -----------------------------------------*/
-- 9. Выберите все строки из таблицы products где есть пропуски в столбце quantity_per_unit и reorder_level равен 100.
select * from products
where quantity_per_unit is null 
and  reorder_level = 100;
/* -----------------------------------------*/

-- 10. Выберите имена продуктов из таблицы products где минимальная цена list_price превышает себестоимость standard_cost более чем на 5 уе.
select * from products
where (list_price - standard_cost) >= 5;
/* -----------------------------------------*/

-- 11. Выбрать все строки из таблицы products где reorder_level в два раза меньше target_level.
select * from products
where (reorder_level / target_level) = 0.5;
/* -----------------------------------------*/

/*12. Выберите все строки из таблицы products для которых product_code содержит 'NWTSO' и стандартная
себестоимость standard_cost равна 1, либо минимальная цена list_price меньше 5 и target_level = 40.*/
select * from products
where (product_code LIKE "%NWTSO%"
and standard_cost = 1)
or (list_price < 5 
and target_level = 40);
/* -----------------------------------------*/

/*13. Выберите все строки из таблицы products для которых product_code содержит 'NWTSO' или стандартная 
себестоимость standard_cost равна 1 минимальная. При этом target_level должен быть равен 40. Решить задачу двумя способами.*/
select * from products
where (product_code LIKE "%NWTSO%"
and target_level = 40)
or (standard_cost = 1
and target_level = 40);


