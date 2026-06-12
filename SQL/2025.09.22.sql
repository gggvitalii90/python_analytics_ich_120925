-- Выбрать все строки с ценой единицы товара unit price превышающей 20
select * from order_details
where unit_price > 20;

-- 2. Выбрать идентификаторы заказов order_id, если в заказе был продукт product_id равный 43 и статус заказа status_id равен 2
select order_id from order_details
where product_id = 43
and status_id = 2;
-- 3. Выбрать все строки там где количество определенного продукта в заказе quantity не превышает либо равно 15 или цена товара равна 15
select * from order_details
where quantity <= 15 
or unit_price = 15;

-- 4. Выбрать Inventory_id для всех заказов кроме заказов с id не равными 79 и 46.
select * from order_details
where order_id not in(79,46);

-- 5. Выбрать только те строки в которых либо unit_price больше 9 и order_id равен 30 либо unit_price больше 9 и status_id равен 1 
select * from order_details
where 
(unit_price > 9 and order_id = 30)
or 
(unit_price > 9 and status_id = 1);

