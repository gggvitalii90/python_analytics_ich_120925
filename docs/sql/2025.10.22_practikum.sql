-- 1. Вывести среднее, минимум, максимум и сумму по столбцу standard_cost
SELECT
    avg(standard_cost),
    min(standard_cost),
    max(standard_cost),
    sum(standard_cost),
    count(standard_cost)
FROM
    products;

-- 2. Посчитайте количество товаров в каждой категории category Выведите только записи с количеством
-- товаров не менее 3
SELECT
    category,
    count(id)
FROM
    products
GROUP BY
    category
HAVING
    count(id) >= 3;

SELECT
    category,
    count(id)
FROM
    products
WHERE
    quantity_per_unit >= 3
GROUP BY
    category;

-- 3. Выведите среднюю себестоимость standard_cost для пары supplier_ids + category
SELECT
    supplier_ids AS id_,
    category,
    avg(standard_cost) AS avg_
FROM
    products
GROUP BY
    supplier_ids,
    category;

SELECT
    supplier_ids AS id_,
    category,
    avg(standard_cost) AS avg_
FROM
    products
GROUP BY
    1,
    2;

-- 4. Посчитайте количество продуктов, для которых отсутсвует minimum_reorder_quantity
SELECT
    minimum_reorder_quantity,
    count(id) AS "Кол-во продуктов"
FROM
    products
WHERE
    minimum_reorder_quantity IS NULL;

SELECT
    minimum_reorder_quantity,
    COUNT(*)
FROM
    products
WHERE
    minimum_reorder_quantity IS NULL
GROUP BY
    1;

-- 5. Посчитайте количество уникальных категорий
SELECT
    count(DISTINCT category) AS "Кол-во категорий"
FROM
    products;

SELECT
    *
FROM
    products;

-- 6. Разделите все товары на группы по reorder_level если reorder_level меньше 10 то 'low' , от 10 до 20
-- включительно - 'medium' , осталные - 'hight' Вывести среднее, максимум и минимум столбца list_price для
-- каждой группы
SELECT
    reorder_level,
    CASE
        WHEN reorder_level < 10 THEN 'low'
        WHEN reorder_level BETWEEN 10
        AND 20 THEN 'medium'
        ELSE 'hight'
    END AS category,
    avg(list_price) AS "среднее",
    max(list_price) AS "максимум",
    min(list_price) AS "минимум"
FROM
    products
GROUP BY
    reorder_level;

-- 7. Найти средний standard_cost только для тех продуктов, которые продаются коробками quantity_per_unit
SELECT
    id,
    quantity_per_unit,
    avg(standard_cost)
FROM
    products
WHERE
    lower(quantity_per_unit) LIKE '%box%';

-- 8. Вычислите суммарную прибыль компании для каждой категории для продуктов с target_level больше 40
-- Прибыль компании вычисляется как list_price - standard_cost
SELECT
    category,
    list_price - standard_cost AS "прибыль компании",
    list_price,
    standard_cost
FROM
    products
WHERE
    target_level > 40
GROUP BY
    category;