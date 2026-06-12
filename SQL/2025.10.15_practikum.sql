/* 1. Создайте таблицу products со следующими столбцами и ограничениями:
● product_id — тип INT, автоинкремент, первичный ключ.
● product_name — тип VARCHAR100, не может быть пустым.
● category — тип VARCHAR50, значение по умолчанию — 'General'.
● price — тип DECIMAL8, 2, не может быть отрицательным, добавьте ограничение CHECK (price >= 0.
● stock_quantity — тип INT, не может быть отрицательным.
● supplier_id — тип INT, может быть NULL, указывает на поставщика продукта.

2. Заполните таблицу products 5 строками данных.
3. Измените значение в таблице, например, уменьшите количество на складе для продукта с product_id = 1 */
select * from t_products;
CREATE TABLE t_products
(
product_id int auto_increment primary Key,
product_name varchar(100) Not null unique,
category varchar(50) default('General'),
price decimal(8,2) check (price >= 0),
stock_quantity int check (stock_quantity >= 0),
supplier_id int 

);

insert into t_products 
(product_name, category, price, stock_quantity, supplier_id)
value
('Apple', 'food', 20.2, 50, 'lidl' ),
('Dress', 'sahen', 50.5, 20, 'new_yourker'),
('BMW_s_3', 'auto', 1000.00, 2, 'u_BMW'),
('Asus_1351', 'PC', 500.1, 3, 'Mediamarket'),
('Iphone_17', 'handy', 400, 600, 'Temu');

update t_products set supplier_id = 444 where product_id = 1;
update t_products set supplier_id = 555 where product_id = 2;
update t_products set supplier_id = 666 where product_id = 3;
update t_products set supplier_id = 777 where product_id = 4;
update t_products set supplier_id = 888 where product_id = 5;

update t_products set stock_quantity = stock_quantity - 1 where  product_id = 1;


-- 4. Создайте представление product_overview, которое будет содержать следующие данные:
-- ● product_name — название продукта.
-- ● category — категория продукта.
-- ● stock_value — расчетная стоимость запасов (произведение price и stock_quantity).
-- ● stock_status — строка "Low Stock", если stock_quantity меньше 20, и "In Stock" в противном случае.
select * from v_product_overview;
create view v_product_overview
as 
select	product_name,  category, (price * stock_quantity) as stock_value, 
case 
when stock_quantity < 20 then "Low Stock"
else "In Stock"
end as stock_status

from t_products;

-- 5. Вам необходима таблица с данными о мониторинге основных показателей здоровья. Подумайте какие
-- столбцы и с какими ограничениями вы будете использовать. Создайте такую таблицу и заполните ее тремя
-- тестовыми строками. Обсудите результаты с коллегами.
select * from t_health;
CREATE TABLE t_health
(
id int auto_increment primary key,
Name varchar(50) not null,
Last_Name varchar(50) unique,
Age int not null check(Age > 18),
Weight decimal(4,2) not null,
Height int not null check(Height > 30),
Pressure int ,
Sugar decimal(2,1), 
created_on timestamp default(current_timestamp())
);
insert into t_health
(Name, Last_Name, Age, Weight, Height, Pressure, Sugar)
value
('Margo', 'Kumenko', 25, 53, 163, 100, 5),
('Anna', 'Vedovihc', 35, 62, 178, 115, 4.8),
('Mark', 'Karpov', 28, 85, 181, 135, 6.4),
('Sofai', 'Timchenko', 47, 78, 165, 120, 4.5),
('Andey', 'Sarnavskiy', 47, 95, 175, 130, 5.5);
