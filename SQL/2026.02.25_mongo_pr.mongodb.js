// Из коллекции sample_airbnb.listingsAndReviews отсортировать по цене за ночь
// недвижимость Барселоны:
// ● 0-50
// ● 50-100
// ● 100-1000
// ● Дороже 1000

db.getCollection('listingsAndReviews').aggregate(
  [
    { $match: { 'address.market': 'Barcelona' } },
    {
      $bucket: {
        groupBy: '$price',
        boundaries: [0, 50, 100, 1000],
        default: 'Other'
      }
    }
  ],    
  { maxTimeMS: 60000, allowDiskUse: true }
);
/*---------------------------------------------------------------------*/
db.getCollection('listingsAndReviews').find(
    {  'address.market': 'Barcelona', price: { $gt: 0, $lt: 50 } }
  );
/*---------------------------------------------------------------------*/

// Из коллекции sample_airbnb.listingsAndReviews создать новую коллекцию reviews и
// отправить в нее все отзывы из исходной коллекции. 1 документ - 1 отзыв.
db.getCollection('listingsAndReviews').aggregate(
  [
    { $match: { reviews: { $ne: [] } } },
    {
      $project: { _id: 0, 'reviews.comments': 1 }
    },
    { $unwind: { path: '$reviews' } }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);
// качаем и создаем новую коллекцию reviews и грузим туда 
/*---------------------------------------------------------------------*/
// Из коллекции sample_restaurants.restaurants: выяснить, в каких диапазонах средняя оценка
// этих ресторанов, расположив их по группам 0, 20, 40, 60, 80, 100
// Таким образом выяснить группу лучших и худших ресторанов. 
db.getCollection('restaurants').aggregate(
  [
    {
      $match: {
        'grades.score': { $exists: true }
      }
    },
    { $project: { grades: 1, _id: 0, name: 1 } },
    {
      $set: {
        AvgScore: { $avg: '$grades.score' }
      }
    },
    {
      $bucket: {
        groupBy: '$AvgScore',
        boundaries: [0, 20, 40, 60, 80, 100],
        default: 'Other'
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);
/*---------------------------------------------------------------------*/
// Из коллекции sample_restaurants.restaurants: узнать, какие кухни самые популярные ? (топ 5)
db.getCollection('restaurants').aggregate(
  [
    {
      $match: {
        'grades.score': { $exists: true }
      }
    },
    {
      $project: {
        grades: 1,
        _id: 0,
        name: 1,
        cuisine: 1
      }
    },
    {
      $set: {
        AvgScore: { $avg: '$grades.score' }
      }
    },
    {
      $group: {
        _id: '$cuisine',
        CNT_: { $sum: 1 },
        AVG_score: { $avg: '$AvgScore' },
        SUM_score: { $sum: '$AvgScore' }
      }
    },
    {
      $sort: {
        CNT_: -1,
        AVG_score: -1,
        SUM_score: -1
      }
    },
    { $limit: 5 }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

/*---------------------------------------------------------------------*/
// Из коллекции sample_airbnb.listingsAndReviews: найти самого активного пользователя,
// который оставил больше всего отзывов
db.getCollection('listingsAndReviews').aggregate(
  [
    {
      $match: {
        'reviews.reviewer_name': {
          $exists: true,
          $ne: null
        }
      }
    },
    {
      $project: {
        name: 1,
        _id: 0,
        'reviews.reviewer_name': 1
      }
    },
    { $unwind: { path: '$reviews' } },
    {
      $group: {
        _id: '$reviews.reviewer_name',
        total: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 1 }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);
/*---------------------------------------------------------------------*/
// Использовать $lookup, чтобы объединить эти коллекции на основе поля accounts в
// коллекции customers и поля account_id в коллекции transactions
db.getCollection('customers').aggregate(
  [
    { $project: { accounts: 1, _id: 0 } },
    { $unwind: { path: '$accounts' } },
    {
      $lookup: {
        from: 'transactions',
        localField: 'accounts',
        foreignField: 'account_id',
        as: 'result'
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);