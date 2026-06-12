Тестовая коллекция в mongo atlas  sample_mflix.theaters
Найти все кинотеатры в Калифорнии и посчитать их количество

db.getCollection('theaters').aggregate(
  [
    {
      $match: { 'location.address.state': 'CA' }
    },
    {
      $group: {
        _id: '$location.address.state',
        CNT_: { $sum: 1 }
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);
/*---------------------------------------------------*/

Тестовая коллекция в mongo atlas  sample_airbnb.listingsAndReviews
Найти недвижимость с самым большим количеством спален (bedrooms) и напишите ее название

db.getCollection('listingsAndReviews')
  .find({}, { _id: 0, name: 1, bedrooms: 1 })
  .sort({ bedrooms: -1 })
  .limit(1);
/*---------------------------------------------------*/
Тестовая коллекция в mongo atlas  sample_airbnb.listingsAndReviews
Найти недвижимость с самым высоким рейтингом  review_scores_rating при минимальном количестве отзывов 50 (number_of_reviews) и напишите ее название 

db.getCollection('listingsAndReviews')
  .find(
    { number_of_reviews: { $gte: 50 } },
    {
      _id: 0,
      name: 1,
      'review_scores.review_scores_rating': 1,
      number_of_reviews: 1
    }
  )
  .sort({
    'review_scores.review_scores_rating': -1
  });
По заданию я вижу что самый высокий рейтинг то 100 но таких объектов много
Поэтому я решил их посчитать. 

db.getCollection('listingsAndReviews').aggregate(
  [
    {
      $match: { number_of_reviews: { $gte: 50 } }
    },
    {
      $project: {
        _id: 0,
        name: 1,
        number_of_reviews: 1,
        'review_scores.review_scores_rating': 1
      }
    },
    { $unwind: { path: '$review_scores' } },
    {
      $group: {
        _id: '$review_scores.review_scores_rating',
        CNT_: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);