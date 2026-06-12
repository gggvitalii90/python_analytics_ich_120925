Коллекция imdb : Используя оператор $size , найдите фильмы, написанные 3 сценаристами (writers) и снятые 2 режиссерами (directors)

db.getCollection('imdb').find(
  {
    $and: [
      { writers: { $size: 3 } },
      { directors: { $size: 2 } }
    ]
  },
  { title: 1, directors: 1, writers: 1 }
);

Коллекция bookings: Найдите адрес нахождения автомобиля с vin WME4530421Y135045 по самой последней дате (и времени) final_date
  
db.getCollection('bookings')
  .find(
    { vin: 'WME4530421Y135045' },
    {
      _id: 0,
      vin: 1,
      final_address: 1,
      final_date: 1
    }
  )
  .sort({ final_date: -1 })
  .limit(1);

  через агрегации

db.getCollection('bookings').aggregate(
  [
    { $match: { vin: 'WME4530421Y135045' } },
    { $sort: { final_date: -1 } },
    { $limit: 1 },
    {
      $project: {
        _id: 0,
        vin: 1,
        final_address: 1,
        final_date: 1
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

Коллекция bookings: подсчитайте, у скольких автомобилей при окончании аренды закончилось топливо (final_fuel)

db.getCollection('bookings').aggregate(
  [
    { $match: { final_fuel: 0 } },
    { $count: 'not_fuel' }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

Коллекция bookings: найдите номерной знак и vin номер авто, с самым большим километражом (distance)

db.getCollection('bookings').aggregate(
  [
    {
      $project: {
        distance: 1,
        vin: 1,
        plate: 1,
        _id: 0
      }
    },
    { $sort: { distance: -1 } },
    { $limit: 1 }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

Коллекция imdb. Найдите фильм с участием "Brad Pitt" с самым высоким рейтингом (imdb.rating)

db.getCollection('imdb')
  .find({
    cast: 'Brad Pitt',
    'imdb.rating': { $ne: '' }
  })
  .sort({ 'imdb.rating': -1 })
  .limit(1);