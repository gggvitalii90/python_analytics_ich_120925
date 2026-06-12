/* 
Работаем с базой данных sakila.

/*
1. Вывести названия фильмов с расшифровкой рейтинга для каждого. 
Рейтинги описаны здесь. В таблице film хранятся годы рейтингов. 
Нужно воспользоваться оператором case чтобы определить для каждого кода условие, 
по которому будет выводится его развернутое описание (1 предложение). 
*/

SELECT
    title,
    rating,
    CASE rating
        WHEN 'G'     THEN 'General Audiences - All ages admitted, nothing offensive.'
        WHEN 'PG'    THEN 'Parental Guidance Suggested - Some material may not be suitable for children.'
        WHEN 'PG-13' THEN 'Parents Strongly Cautioned - Some material may be inappropriate for children under 13.'
        WHEN 'R'     THEN 'Restricted - Under 17 requires accompanying parent or adult guardian.'
        WHEN 'NC-17' THEN 'Adults Only - No one 17 and under admitted.'
        ELSE 'Rating not specified'
    END AS rating_description
FROM film;


/*
2. Выведите количество фильмов в каждой категории рейтинга. Используем group by. 
*/

SELECT
    rating,
    COUNT(*) AS film_count
FROM film
GROUP BY rating
ORDER BY rating;

/*
3. Используя оконные функции и partition by, выведите список названий фильмов, 
рейтинг и количество фильмов в каждом рейтинге. Объясните, 
чем отличаются результаты предыдущего запроса и запроса в этой задаче. 
*/

SELECT
    title,
    rating,
    COUNT(*) OVER (PARTITION BY rating) AS films_in_rating
FROM film
ORDER BY rating, title;

/*
4. Изучите таблицы payment и customer. Выведите список всех платежей с указанием 
имени и фамилии каждого заказчика, датой платежа и суммой.
*/

SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    p.payment_date,
    p.amount
FROM payment p
JOIN customer c ON p.customer_id = c.customer_id
ORDER BY c.customer_id;

/*
5. Поменяйте предыдущий запрос так, чтобы дата выводилась в формате 
“число, название месяца, год” (без времени).
*/
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    DATE_FORMAT(p.payment_date, '%d, %M, %Y') AS payment_date,
    p.amount
FROM payment p
JOIN customer c ON p.customer_id = c.customer_id
ORDER BY c.customer_id, p.payment_date DESC;



/*
MongoDB:

Работаем с коллекцией sample_data.restaurants, подключение:
mongodb://ich1:password@3.67.41.21:27017/?readPreference=primary&ssl=false&authMechanism=DEFAULT&authSource=ich

/*
6. Найти рестораны на 'Staten Island' в названии которых есть слово pizza (Pizza и PIZZA тоже считаются)
*/

use("sample_data");
db.restaurants.find(
    {
        borough: "Staten Island",
        name: { $regex: /pizza/i }
    },
    {
        _id: 0,
        name: 1,
        borough: 1
    }
);

/*
7. Выведите названия 5 лучших по среднему значению отзывов ( $avg: "$grades.score")
*/
use("sample_data");
db.restaurants.aggregate([
    {
        $project: {
            _id: 0,
            name: 1,
            avg_score: { $avg: "$grades.score" }
        }
    },
    { $sort: { avg_score: -1 } },
    { $limit: 5 }
]);
