[

{"num": 1, "name": "Анатолий", "Age": 28, "gender": "m"},
{"num": 2, "name": "Светлана", "Age": 25, "gender": "f"},
{"num": 3, "name": "Никита", "Age": 33, "gender": "m"},
{"num": 4, "name": "Ольга", "Age": 22, "gender": "f"}

]
/*---------------------------------------------------------------------*/

[
 
  {
"id": 5, "name": "Григорий","age": 28, "gender": "m"},

{
"id": 6, "name": "Анна","age": 25, "gender": "f"},

  {
"id": 7, "name": "Максим","age": 33, "gender": "m"},

  {
"id": 8, "name": "Ирина","age": 22, "gender": "f"}

]
/*---------------------------------------------------------------------

db["120925_Honcharov_Vitalii"].insertMany()
/*---------------------------------------------------------------------*/

db.getCollection('120925_Honcharov_Vitalii').find(
  {
    name: {
      $in: [
        'Анатолий',
        'Дмитрий',
        'Ольга',
        'Семен'
      ]
    }
  }
);
/*---------------------------------------------------------------------*/
db.getCollection('120925_Honcharov_Vitalii').find(
  { Age: { $gte: 30, $lte: 40, $ne: 33 } }
);
/*---------------------------------------------------------------------*/
db["120925_Honcharov_grades"].deleteMany({subject: "Math"})
/*---------------------------------------------------------------------*/
db["120925_Honcharov_grades"].updateMany( {"grade": {$exists: true} },{$inc: {grade: 80}})
/*---------------------------------------------------------------------*/
db["120925_Kudriashov"].insertOne({"name": "Inna", "created_on": ISODate() })
/*---------------------------------------------------------------------*/
db["120925_Honcharov_Vitalii"].insertMany([{"name": "Инна", "date": ISODate()}, {"name": "Мария", "date": ISODate()}])
/*---------------------------------------------------------------------*/
db.getCollection(
  '120925_Honcharov_bookings'
).aggregate(
  [
    {
      $group: {
        _id: '$vendor',
        cnt_vendor: { $sum: 1 }
      }
    },
    {
      $project: {
        vendor: '$_id',
        cnt_vendor: 1,
        _id: 0
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);
/*---------------------------------------------------------------------*/
db.getCollection(
  '120925_Honcharov_bookings'
).aggregate(
  [
    { $match: { distance: { $ne: null } } },
    {
      $group: {
        _id: '$vendor',
        distance: { $sum: '$distance' },
        cnt_distance: { $sum: 1 },
        avg_distance: { $avg: '$distance' }
      }
    },
    {
      $addFields: {
        avg_round: {
          $round: ['$avg_distance', 0]
        }
      }
    },
    { $match: { avg_round: { $gt: 2000 } } }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);
/*---------------------------------------------------------------------*/

[
{"name": "Mercury", "orderFromSun": 1, "hasRings": false, "surfaceTemperature": 67},
{"name": "Earth", "orderFromSun": 3, "hasRings": false, "surfaceTemperature": 14},
{"name": "Uranus", "orderFromSun": 7, "hasRings": true, "surfaceTemperature": 197.2},
{"name": "Jupiter", "orderFromSun": 5, "hasRings": true, "surfaceTemperature": 145.15},
{"name": "Mars", "orderFromSun": 4, "hasRings": false, "surfaceTemperature": 63},
{"name": "Neptune", "orderFromSun": 8, "hasRings": true, "surfaceTemperature": 201},
{"name": "Venus", "orderFromSun": 2, "hasRings": false, "surfaceTemperature": 464},
{"name": "Saturn", "orderFromSun": 6, "hasRings": true, "surfaceTemperature": 139.15}
]
/*---------------------------------------------------------------------*/
db.getCollection('120925_Honcharov_pr').find({
  surfaceTemperature: { $gt: 50, $lte: 100 }
});
/*---------------------------------------------------------------------*/
db.getCollection('120925_Honcharov_pr').find({
  orderFromSun: { $in: [1, 2, 3] }
});
/*---------------------------------------------------------------------*/
db.getCollection('120925_Honcharov_pr').find({
  hasRings: true
});
/*---------------------------------------------------------------------*/
db.getCollection('120925_Honcharov_pr').find({
  hasRings: false,
  surfaceTemperature: { $lt: 0 }
});
/*---------------------------------------------------------------------*/
db.getCollection('120925_Honcharov_pr')
  .find({})
  .sort({ orderFromSun: -1 });
/*---------------------------------------------------------------------*/
db.getCollection('120925_Honcharov_pr').aggregate(
  [
    {
      $match: { surfaceTemperature: { $gt: 50 } }
    },
    {
      $group: {
        _id: '$hasRings',
        cnt_grate_50: { $sum: 1 }
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);
/*---------------------------------------------------------------------*/
db.getCollection('120925_Honcharov_pr').aggregate(
  [
    {
      $match: { surfaceTemperature: { $gt: 50 } }
    },
    { $count: 'cnt_grate_50' }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);
/*---------------------------------------------------------------------*/
db.getCollection('120925_Honcharov_pr').aggregate(
  [
    {
      $group: {
        _id: '',
        max_tem: { $max: '$surfaceTemperature' }
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);
/*---------------------------------------------------------------------*/

db.getCollection('120925_Honcharov_pr')
  .find({
    surfaceTemperature: { $gt: 100 },
    hasRings: false
  })
  .sort({ orderFromSun: -1 });
/*---------------------------------------------------------------------*/