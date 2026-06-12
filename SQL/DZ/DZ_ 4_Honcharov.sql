-- 1 Подключитесь к своей базе данных созданной на уроке
USE 120925_Honcharov;

-- 2 Создайте таблицу, которая отражает погоду в Вашем городе за последние 5 дней и включает следующее столбцы
-- Id - первичный ключ, заполняется автоматически
-- Дата - не может быть пропуском
-- Дневная температура - целое число, принимает значения от -30 до 30
-- Ночная температура - целое число, принимает значения от -30 до 30
-- Скорость ветра - подумайте какой тип данных и ограничения необходимы для этого столбца
SELECT * FROM t_weater_Oldenburg;
CREATE TABLE t_weater_Oldenburg (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_Data DATE NOT NULL,
    tag_temp INT CHECK (tag_temp < 30 AND tag_temp > - 30),
    nacht_temp INT CHECK (nacht_temp < 30 AND nacht_temp > - 30),
    speed_wind INT CHECK (speed_wind < 120 AND speed_wind >= 0)
);

-- 3 Заполните таблицу 5 строками - за последние 5 дней 
INSERT INTO t_weater_Oldenburg
(day_Data, tag_temp, nacht_temp, speed_wind)
VALUE
(CURDATE(), 10, 2, 6 ),
(CURDATE() - 1, 10, 2, 6 ),
(CURDATE() - 2, 15, 6, 3 ),
(CURDATE() - 3, 17, 7, 5 ),
(CURDATE() - 4, 14, 4, 2 );

-- 4 Увеличьте значения ночной температуры на градус если скорость ветра не превышала 3 м/с
UPDATE t_weater_Oldenburg 
SET 
    nacht_temp = nacht_temp + 1
WHERE
    speed_wind < 3;

-- 5 На основе полученной таблицы создайте представление в своей базе данных - включите все строки Вашей таблицы и дополнительно рассчитанные столбцы
-- Средняя суточная температура - среднее арифметическое между ночной и дневной температурами
-- Столбец на основе скорости ветра - если скорость ветра не превышала 2 м/с то значение ‘штиль’, от 2 включительно до 5 - ‘умеренный ветер’, в остальных случаях - ‘сильный ветер’
SELECT * FROM v_weater_Oldenburg;

CREATE VIEW v_weater_Oldenburg
AS 
SELECT *
, CAST((tag_temp + nacht_temp) / 2 AS DECIMAL(10,1)) AS average_temp
, CASE 
WHEN speed_wind < 2 THEN "штиль"
when speed_wind <= 5 THeN "умеренный ветер"
else "сильный ветер"
ENd as prognosis
from t_weater_Oldenburg;

-- 6 Отформатируйте стиль написания запросов


-- 7 Сохраните запросы в виде файла с расширением .sql и загрузите на платформу