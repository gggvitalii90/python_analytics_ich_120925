1. Найдите средний возраст из коллекции ich.US_Adult_Income


db.getCollection('US_Adult_Income').aggregate(
  [
    {
      $group: {
        _id: null,
        avg_age: { $avg: '$age' }
      }
    },
    {
      $project: {
        _id: 0,
        avg_age: { $round: ['$avg_age', 0] }
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

2. Поменяв подключение к базе данных, создать коллекцию orders_NAME (для уникальности - добавим ваше имя в название) со свойствами id, customer, product, amount, city, используя следующие данные:

[
  { "id": 1, "customer": "Olga", "product": "Apple", "amount": 15.55, "city": "Berlin" },
  { "id": 2, "customer": "Anna", "product": "Apple", "amount": 10.05, "city": "Madrid" },
  { "id": 3, "customer": "Olga", "product": "Kiwi", "amount": 9.6, "city": "Berlin" },
  { "id": 4, "customer": "Anton", "product": "Apple", "amount": 20, "city": "Roma" },
  { "id": 5, "customer": "Olga", "product": "Banana", "amount": 8, "city": "Madrid" },
  { "id": 6, "customer": "Petr", "product": "Orange", "amount": 18.3, "city": "Paris" }
]

3. Найти сколько всего было совершено покупок

db.getCollection(
  '120925_Honcharov_orders'
).aggregate([{ $count: 'cnt' }], {
  maxTimeMS: 60000,
  allowDiskUse: true
});

4. Найти сколько всего раз были куплены яблоки

db.getCollection(
  '120925_Honcharov_orders'
).aggregate(
  [
    { $match: { product: 'Apple' } },
    {
      $group: {
        _id: '$product',
        cnt_Apple: { $sum: 1 }
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

5. Вывести идентификаторы трех самые дорогих покупок

db.getCollection(
  '120925_Honcharov_orders'
).aggregate(
  [
    { $sort: { amount: -1 } },
    { $limit: 3 },
    { $project: { _id: 1, id: 1 } }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

6. Найти сколько всего покупок было совершено в Берлине

db.getCollection(
  '120925_Honcharov_orders'
).aggregate(
  [
    { $match: { city: 'Berlin' } },
    {
      $group: {
        _id: 'city',
        cnt_Berlin: { $sum: 1 }
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

7. Найти количество покупок яблок в городах Берлин и Мадрид

db.getCollection(
  '120925_Honcharov_orders'
).aggregate(
  [
    {
      $match: {
        product: 'Apple',
        city: { $in: ['Berlin', 'Madrid'] }
      }
    },
    { $count: 'cnt_Apple' }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

8. Найти сколько было потрачено каждым покупателем

db.getCollection(
  '120925_Honcharov_orders'
).aggregate(
  [
    {
      $group: {
        _id: '$customer',
        sum_amount: { $sum: '$amount' },
        cnt_amount: { $sum: 1 }
      }
    },
    { $sort: { cnt_amount: -1 } }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

9. Найти в каких городах совершала покупки Ольга

db.getCollection(
  '120925_Honcharov_orders'
).aggregate(
  [
    { $match: { customer: 'Olga' } },
    {
      $group: {
        _id: '$city',
        cnt_city: { $sum: 1 }
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);