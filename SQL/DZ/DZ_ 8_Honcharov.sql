with product as (
select 'Apple' as maker, 'MacBook Pro 16 M3' as model, 'Laptop' as type 
union all 
select 'HP' as maker, 'LaserJet Pro M404dn' as model, 'Printer' as type 
union all 
select 'Dell' as maker, 'OptiPlex 7090 Tower' as model, 'PC' as type 
union all 
select 'Lenovo' as maker, 'ThinkPad X1 Carbon Gen 11' as model, 'Laptop' as type 
union all 
select 'Canon' as maker, 'PIXMA G3420' as model, 'Printer' as type 
union all
select 'Apple' as maker, 'Mac mini M2' as model, 'PC' as type 
union all 
select 'HP' as maker, 'Spectre x360 14' as model, 'Laptop' as type 
union all 
select 'Dell' as maker, 'XPS 13 Plus' as model, 'Laptop' as type 
union all 
select 'Lenovo' as maker, 'Legion Tower 5i Gen 8' as model, 'PC' as type 
union all 
select 'Canon' as maker, 'i-SENSYS MF657Cdw' as model, 'Printer' as type 
), 
pc as (
select 101 as code, 'OptiPlex 7090 Tower' as model, 2500 as speed, 16 as ram, 512 as hd, '8x' as cd, 900 as price
union all 
select 102 as code, 'Mac mini M2' as model, 3500 as speed, 8 as ram, 256 as hd, '4x' as cd, 599 as price
union all 
select 103 as code, 'Legion Tower 5i Gen 8' as model, 2500 as speed, 16 as ram, 1024 as hd, '4x' as cd, 1100 as price
),
laptop as (
select 201 as code, 'MacBook Pro 16 M3' as model, 405 as speed, 36 as ram, 1024 as hd, 2800 as price, 16 as screen 
union all
select 202 as code, 'ThinkPad X1 Carbon Gen 11' as model, 500 as speed, 16 as ram, 512 as hd, 1500 as price, 14 as screen
union all
select 203 as code, 'Spectre x360 14' as model, 500 as speed, 16 as ram, 1024 as hd, 1400 as price, 13 as screen
union all
select 204 as code, 'XPS 13 Plus' as model, 500 as speed, 32 as ram, 1024 as hd, 1600 as price, 13 as screen
),
printer as (
select 301 as code, 'LaserJet Pro M404dn' as model, 'N' as color, 'Laser' as type, 300 as price
union all 
select 302 as code, 'PIXMA G3420' as model, 'Y' as color, 'Jet' as type, 180 as price
union all 
select 303 as code, 'i-SENSYS MF657Cdw' as model, 'Y' as color, 'Matrix' as type, 650 as price
)
-- 1 Найдите все записи таблицы Printer для цветных принтеров.
select * from printer
where color = 'Y'
;
-- 2 Найдите номера моделей и цены всех имеющихся в продаже продуктов (любого типа) производителя в названии которого есть буква L (латинская буква). 
			-- Тут букву я заменил у меня в созданой таблице нет производителя с буквой B
with product as (
select 'Apple' as maker, 'MacBook Pro 16 M3' as model, 'Laptop' as type 
union all 
select 'HP' as maker, 'LaserJet Pro M404dn' as model, 'Printer' as type 
union all 
select 'Dell' as maker, 'OptiPlex 7090 Tower' as model, 'PC' as type 
union all 
select 'Lenovo' as maker, 'ThinkPad X1 Carbon Gen 11' as model, 'Laptop' as type 
union all 
select 'Canon' as maker, 'PIXMA G3420' as model, 'Printer' as type 
union all
select 'Apple' as maker, 'Mac mini M2' as model, 'PC' as type 
union all 
select 'HP' as maker, 'Spectre x360 14' as model, 'Laptop' as type 
union all 
select 'Dell' as maker, 'XPS 13 Plus' as model, 'Laptop' as type 
union all 
select 'Lenovo' as maker, 'Legion Tower 5i Gen 8' as model, 'PC' as type 
union all 
select 'Canon' as maker, 'i-SENSYS MF657Cdw' as model, 'Printer' as type 
), 
pc as (
select 101 as code, 'OptiPlex 7090 Tower' as model, 2500 as speed, 16 as ram, 512 as hd, '8x' as cd, 900 as price
union all 
select 102 as code, 'Mac mini M2' as model, 3500 as speed, 8 as ram, 256 as hd, '4x' as cd, 599 as price
union all 
select 103 as code, 'Legion Tower 5i Gen 8' as model, 2500 as speed, 16 as ram, 1024 as hd, '4x' as cd, 1100 as price
),
laptop as (
select 201 as code, 'MacBook Pro 16 M3' as model, 405 as speed, 36 as ram, 1024 as hd, 2800 as price, 16 as screen 
union all
select 202 as code, 'ThinkPad X1 Carbon Gen 11' as model, 500 as speed, 16 as ram, 512 as hd, 1500 as price, 14 as screen
union all
select 203 as code, 'Spectre x360 14' as model, 500 as speed, 16 as ram, 1024 as hd, 1400 as price, 13 as screen
union all
select 204 as code, 'XPS 13 Plus' as model, 500 as speed, 32 as ram, 1024 as hd, 1600 as price, 13 as screen
),
printer as (
select 301 as code, 'LaserJet Pro M404dn' as model, 'N' as color, 'Laser' as type, 300 as price
union all 
select 302 as code, 'PIXMA G3420' as model, 'Y' as color, 'Jet' as type, 180 as price
union all 
select 303 as code, 'i-SENSYS MF657Cdw' as model, 'Y' as color, 'Matrix' as type, 650 as price
)
select all_p.*, p.maker  from product as p
left join 
(select code, model, price from pc
union all 
select code, model, price from laptop
union all 
select code, model, price from printer
) as all_p
on p.model = all_p.model 
where maker like '%l%'
order by all_p.code
;
/* ПОЯСНЕНИЕ. 
Так как в задаче нам надо вывести всего лишь столбики номер модели и цену, а эти столибки общие у всех трех таблиц продуктов, я просто объединил их через union. 
Если б нам надо было вывести какие то уникальные столибки то такой способ не сработал бы.
*/

-- 3 Найдите производителя, выпускающего ПК, но не ПК-блокноты. 
		-- Я тут чуть повернул условие у меня вышло что все производители ПК выпускают Laptop, 
        -- а вот есть производители которые выпукаю только Laptop и не выпускаю ПК
with product as (
select 'Apple' as maker, 'MacBook Pro 16 M3' as model, 'Laptop' as type 
union all 
select 'HP' as maker, 'LaserJet Pro M404dn' as model, 'Printer' as type 
union all 
select 'Dell' as maker, 'OptiPlex 7090 Tower' as model, 'PC' as type 
union all 
select 'Lenovo' as maker, 'ThinkPad X1 Carbon Gen 11' as model, 'Laptop' as type 
union all 
select 'Canon' as maker, 'PIXMA G3420' as model, 'Printer' as type 
union all
select 'Apple' as maker, 'Mac mini M2' as model, 'PC' as type 
union all 
select 'HP' as maker, 'Spectre x360 14' as model, 'Laptop' as type 
union all 
select 'Dell' as maker, 'XPS 13 Plus' as model, 'Laptop' as type 
union all 
select 'Lenovo' as maker, 'Legion Tower 5i Gen 8' as model, 'PC' as type 
union all 
select 'Canon' as maker, 'i-SENSYS MF657Cdw' as model, 'Printer' as type 
), 
pc as (
select 101 as code, 'OptiPlex 7090 Tower' as model, 2500 as speed, 16 as ram, 512 as hd, '8x' as cd, 900 as price
union all 
select 102 as code, 'Mac mini M2' as model, 3500 as speed, 8 as ram, 256 as hd, '4x' as cd, 599 as price
union all 
select 103 as code, 'Legion Tower 5i Gen 8' as model, 2500 as speed, 16 as ram, 1024 as hd, '4x' as cd, 1100 as price
),
laptop as (
select 201 as code, 'MacBook Pro 16 M3' as model, 405 as speed, 36 as ram, 1024 as hd, 2800 as price, 16 as screen 
union all
select 202 as code, 'ThinkPad X1 Carbon Gen 11' as model, 500 as speed, 16 as ram, 512 as hd, 1500 as price, 14 as screen
union all
select 203 as code, 'Spectre x360 14' as model, 500 as speed, 16 as ram, 1024 as hd, 1400 as price, 13 as screen
union all
select 204 as code, 'XPS 13 Plus' as model, 500 as speed, 32 as ram, 1024 as hd, 1600 as price, 13 as screen
),
printer as (
select 301 as code, 'LaserJet Pro M404dn' as model, 'N' as color, 'Laser' as type, 300 as price
union all 
select 302 as code, 'PIXMA G3420' as model, 'Y' as color, 'Jet' as type, 180 as price
union all 
select 303 as code, 'i-SENSYS MF657Cdw' as model, 'Y' as color, 'Matrix' as type, 650 as price
)
select maker, type from product
where type = 'Laptop' and maker not in 
(
select maker from product
where type = 'PC'
)
;


-- 4 Найдите производителей ПК с процессором не менее 450 Мгц. Вывести: Maker
with product as (
select 'Apple' as maker, 'MacBook Pro 16 M3' as model, 'Laptop' as type 
union all 
select 'HP' as maker, 'LaserJet Pro M404dn' as model, 'Printer' as type 
union all 
select 'Dell' as maker, 'OptiPlex 7090 Tower' as model, 'PC' as type 
union all 
select 'Lenovo' as maker, 'ThinkPad X1 Carbon Gen 11' as model, 'Laptop' as type 
union all 
select 'Canon' as maker, 'PIXMA G3420' as model, 'Printer' as type 
union all
select 'Apple' as maker, 'Mac mini M2' as model, 'PC' as type 
union all 
select 'HP' as maker, 'Spectre x360 14' as model, 'Laptop' as type 
union all 
select 'Dell' as maker, 'XPS 13 Plus' as model, 'Laptop' as type 
union all 
select 'Lenovo' as maker, 'Legion Tower 5i Gen 8' as model, 'PC' as type 
union all 
select 'Canon' as maker, 'i-SENSYS MF657Cdw' as model, 'Printer' as type 
), 
pc as (
select 101 as code, 'OptiPlex 7090 Tower' as model, 2500 as speed, 16 as ram, 512 as hd, '8x' as cd, 900 as price
union all 
select 102 as code, 'Mac mini M2' as model, 3500 as speed, 8 as ram, 256 as hd, '4x' as cd, 599 as price
union all 
select 103 as code, 'Legion Tower 5i Gen 8' as model, 2500 as speed, 16 as ram, 1024 as hd, '4x' as cd, 1100 as price
),
laptop as (
select 201 as code, 'MacBook Pro 16 M3' as model, 405 as speed, 36 as ram, 1024 as hd, 2800 as price, 16 as screen 
union all
select 202 as code, 'ThinkPad X1 Carbon Gen 11' as model, 500 as speed, 16 as ram, 512 as hd, 1500 as price, 14 as screen
union all
select 203 as code, 'Spectre x360 14' as model, 500 as speed, 16 as ram, 1024 as hd, 1400 as price, 13 as screen
union all
select 204 as code, 'XPS 13 Plus' as model, 500 as speed, 32 as ram, 1024 as hd, 1600 as price, 13 as screen
),
printer as (
select 301 as code, 'LaserJet Pro M404dn' as model, 'N' as color, 'Laser' as type, 300 as price
union all 
select 302 as code, 'PIXMA G3420' as model, 'Y' as color, 'Jet' as type, 180 as price
union all 
select 303 as code, 'i-SENSYS MF657Cdw' as model, 'Y' as color, 'Matrix' as type, 650 as price
)
select pc.speed, p.maker from pc
join product as p on pc.model = p.model
where pc.speed > 450;

-- 5 Найдите среднюю скорость ПК.
with product as (
select 'Apple' as maker, 'MacBook Pro 16 M3' as model, 'Laptop' as type 
union all 
select 'HP' as maker, 'LaserJet Pro M404dn' as model, 'Printer' as type 
union all 
select 'Dell' as maker, 'OptiPlex 7090 Tower' as model, 'PC' as type 
union all 
select 'Lenovo' as maker, 'ThinkPad X1 Carbon Gen 11' as model, 'Laptop' as type 
union all 
select 'Canon' as maker, 'PIXMA G3420' as model, 'Printer' as type 
union all
select 'Apple' as maker, 'Mac mini M2' as model, 'PC' as type 
union all 
select 'HP' as maker, 'Spectre x360 14' as model, 'Laptop' as type 
union all 
select 'Dell' as maker, 'XPS 13 Plus' as model, 'Laptop' as type 
union all 
select 'Lenovo' as maker, 'Legion Tower 5i Gen 8' as model, 'PC' as type 
union all 
select 'Canon' as maker, 'i-SENSYS MF657Cdw' as model, 'Printer' as type 
), 
pc as (
select 101 as code, 'OptiPlex 7090 Tower' as model, 2500 as speed, 16 as ram, 512 as hd, '8x' as cd, 900 as price
union all 
select 102 as code, 'Mac mini M2' as model, 3500 as speed, 8 as ram, 256 as hd, '4x' as cd, 599 as price
union all 
select 103 as code, 'Legion Tower 5i Gen 8' as model, 2500 as speed, 16 as ram, 1024 as hd, '4x' as cd, 1100 as price
),
laptop as (
select 201 as code, 'MacBook Pro 16 M3' as model, 405 as speed, 36 as ram, 1024 as hd, 2800 as price, 16 as screen 
union all
select 202 as code, 'ThinkPad X1 Carbon Gen 11' as model, 500 as speed, 16 as ram, 512 as hd, 1500 as price, 14 as screen
union all
select 203 as code, 'Spectre x360 14' as model, 500 as speed, 16 as ram, 1024 as hd, 1400 as price, 13 as screen
union all
select 204 as code, 'XPS 13 Plus' as model, 500 as speed, 32 as ram, 1024 as hd, 1600 as price, 13 as screen
),
printer as (
select 301 as code, 'LaserJet Pro M404dn' as model, 'N' as color, 'Laser' as type, 300 as price
union all 
select 302 as code, 'PIXMA G3420' as model, 'Y' as color, 'Jet' as type, 180 as price
union all 
select 303 as code, 'i-SENSYS MF657Cdw' as model, 'Y' as color, 'Matrix' as type, 650 as price
)
select avg(speed) as AVG_S from pc;


-- 6 Для каждого производителя, имеющего модели в таблице Laptop, найдите средний размер экрана выпускаемых им ПК-блокнотов.
-- Вывести: maker, средний размер экрана.
with product as (
select 'Apple' as maker, 'MacBook Pro 16 M3' as model, 'Laptop' as type 
union all 
select 'HP' as maker, 'LaserJet Pro M404dn' as model, 'Printer' as type 
union all 
select 'Dell' as maker, 'OptiPlex 7090 Tower' as model, 'PC' as type 
union all 
select 'Lenovo' as maker, 'ThinkPad X1 Carbon Gen 11' as model, 'Laptop' as type 
union all 
select 'Canon' as maker, 'PIXMA G3420' as model, 'Printer' as type 
union all
select 'Apple' as maker, 'Mac mini M2' as model, 'PC' as type 
union all 
select 'HP' as maker, 'Spectre x360 14' as model, 'Laptop' as type 
union all 
select 'Dell' as maker, 'XPS 13 Plus' as model, 'Laptop' as type 
union all 
select 'Lenovo' as maker, 'Legion Tower 5i Gen 8' as model, 'PC' as type 
union all 
select 'Canon' as maker, 'i-SENSYS MF657Cdw' as model, 'Printer' as type 
), 
pc as (
select 101 as code, 'OptiPlex 7090 Tower' as model, 2500 as speed, 16 as ram, 512 as hd, '8x' as cd, 900 as price
union all 
select 102 as code, 'Mac mini M2' as model, 3500 as speed, 8 as ram, 256 as hd, '4x' as cd, 599 as price
union all 
select 103 as code, 'Legion Tower 5i Gen 8' as model, 2500 as speed, 16 as ram, 1024 as hd, '4x' as cd, 1100 as price
),
laptop as (
select 201 as code, 'MacBook Pro 16 M3' as model, 405 as speed, 36 as ram, 1024 as hd, 2800 as price, 16 as screen 
union all
select 202 as code, 'ThinkPad X1 Carbon Gen 11' as model, 500 as speed, 16 as ram, 512 as hd, 1500 as price, 14 as screen
union all
select 203 as code, 'Spectre x360 14' as model, 500 as speed, 16 as ram, 1024 as hd, 1400 as price, 13 as screen
union all
select 204 as code, 'XPS 13 Plus' as model, 500 as speed, 32 as ram, 1024 as hd, 1600 as price, 13 as screen
),
printer as (
select 301 as code, 'LaserJet Pro M404dn' as model, 'N' as color, 'Laser' as type, 300 as price
union all 
select 302 as code, 'PIXMA G3420' as model, 'Y' as color, 'Jet' as type, 180 as price
union all 
select 303 as code, 'i-SENSYS MF657Cdw' as model, 'Y' as color, 'Matrix' as type, 650 as price
)
select p.maker, avg(screen) as avg_d from laptop as l
left join product as p on l.model = p.model
group by p.maker
;


