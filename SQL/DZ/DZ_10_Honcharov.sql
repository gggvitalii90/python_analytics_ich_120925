-- Таблица order_details
-- 1 Для каждого product_id выведите inventory_id а также предыдущий и последующей inventory_id по убыванию quantity
select * from order_details;

select product_id, inventory_id, quantity,
lag(inventory_id) over (partition by product_id order by quantity) as pr,
lead(inventory_id) over (partition by product_id order by quantity) as pos
from order_details;

-- 2 Выведите максимальный и минимальный unit_price для каждого order_id с помощью функции FIRST VALUE  Вывести order_id и полученные значения
select order_id, unit_price,
FIRST_VALUE(unit_price) over (partition by order_id order by unit_price) as min_,
FIRST_VALUE(unit_price) over (partition by order_id order by unit_price desc) as max_
from order_details;

-- 3 Выведите order_id и столбец с разнице между  unit_price для каждой заказа и минимальным unit_price в рамках одного заказа Задачу решить двумя способами - с помощью First VAlue и MIN
select order_id, unit_price,
FIRST_VALUE(unit_price) over (partition by order_id order by unit_price) as min_first,
min(unit_price) over (partition by order_id) as min_,
(unit_price - FIRST_VALUE(unit_price) over (partition by order_id order by unit_price)) as delta
from order_details;

-- 4 Присвойте ранг каждой строке используя RANK по убыванию quantity
select *, 
rank() over (order by quantity desc) as Rank_
from order_details;

-- 5  Из предыдущего запроса выберите только строки с рангом до 10 включительно
select * from(
select *, 
rank() over (order by quantity desc) as Rank_
from order_details) as od
where Rank_ <= 10;