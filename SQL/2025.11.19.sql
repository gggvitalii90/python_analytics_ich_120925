select job_title,count(last_name) as cnt
from customers
group by job_title
having count(last_name) > 1
;
-- не обязательно агрегирующую функцию использовать в having
select job_title,count(last_name) as cnt
from customers
group by job_title
having job_title = 'Owner' 
;
with printer as (
select 1 as code, 'HP-888' as model, 'Y' as color, 'Laser' as type, 100 as price
union all 
select 2 as code, 'Asus-1' as model, 'N' as color, 'Laser' as type, 122 as price
),
laptop as (
select 1 as code, 'Lenovo 23' as model, 555 as speed, 16 as ram, 512 as hd,300 as price, 14 as screen 
union all
select 2 as code, 'Apple Pro' as model, 888 as speed, 16 as ram, 1024 as hd,800 as price, 14 as screen
)


select * from laptop
where speed >=555;