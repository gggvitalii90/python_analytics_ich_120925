Из коллекции sample_airbnb.listings 
AndReviews найдите среднюю цену за сутки проживания на Гавайских островах. 
Островов несколько, поэтому либо используем {'address.location': {$geoWithin: { $centerSphere …. 
Либо перечисляем все возможные острова в поле market
Подсказка - нам понадобится 2 этапа агрегации : $match и $group


db.getCollection('listingsAndReviews').aggregate(
  [
    {
      $match: {
        'address.location': {
          $geoWithin: {
            $geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-160.247, 18.911],
                  [-154.807, 18.911],
                  [-154.807, 22.228],
                  [-160.247, 22.228],
                  [-160.247, 18.911]
                ]
              ]
            }
          }
        }
      }
    },
    {
      $group: {
        _id: '$id',
        AVG_price: { $avg: '$price' }
      }
    },
    {
      $project: {
        _id: 0,
        AVG_price: { $round: ['$AVG_price', 2] }
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

/*------------------------------------------------------------------------------*/

Подсчитайте в коллекции sample_mflix.movies, сколько фильмов имеют imdb рейтинг выше 8 
и выходили в период с 2015 до 2023 года (используем year) 
Какой из них имеет самый высокий рейтинг ?

db.getCollection('movies')
  .find({
    'imdb.rating': { $gt: 8 },
    year: { $gte: 2015, $lte: 2023 }
  })
  .sort({ 'imdb.rating': -1 });

/*------------------------------------------------------------------------------*/

db.getCollection('movies').aggregate(
[
{
  $match: {
    'imdb.rating': { $gt: 8 },
    year: { $gte: 2015, $lte: 2023 }
  }
},
{
  $group: {
    _id: 'max',
    Max_imdb: { $max: '$imdb.rating' }
  }
}
],
{ maxTimeMS: 60000, allowDiskUse: true }
);