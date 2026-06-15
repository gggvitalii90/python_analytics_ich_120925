// Из базы данных ich работаем с коллекцией ich.Spotify_Youtube:
// Найдите трек с наивысшими показателями  Danceability и Energy. 

db.getCollection('Spotify_Youtube')
  .find({
    Danceability: { $exists: true },
    Energy: { $exists: true }
  })
  .sort({ Danceability: -1, Energy: -1 })
  .limit(1);
/*---------------------------------------------------------------------*/
// У какого трека (но не compilation) самая большая длительность? 
db.getCollection('Spotify_Youtube')
  .find({ Album_type: { $ne: 'compilation' } })
  .sort({ Duration_ms: -1 })
  .limit(1);

/*---------------------------------------------------------------------*/
// В каком одном альбоме самое большее количество треков? 
db.getCollection('Spotify_Youtube').aggregate(
  [
    {
      $group: { _id: '$Album', CNT_: { $sum: 1 } }
    },
    { $sort: { CNT_: -1 } },
    { $limit: 1 }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

/*---------------------------------------------------------------------*/
// Сколько просмотров видео на youtube у трека с самым высоким количеством прослушиваний на spotify (Stream)? 
db.getCollection('Spotify_Youtube').aggregate(
  [
    {
      $project: {
        Stream: 1,
        _id: 0,
        Views: 1,
        Track: 1
      }
    },
    { $sort: { Stream: -1 } },
    { $limit: 1 }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

/*---------------------------------------------------------------------*/
// Экспортируйте 20 самых популярных (прослушивания или просмотры) треков по версиям youtube и spotify и импортируйте в базу ich_edit 
// их с именами top20youtube и top20spotify, и добавьте им свои имена для уникальности.


// Это можно было сделать в MongoDB, но тогда продемонстрировать процесс не получиться. 
// Я понял что тут поможет только Python.

from pymongo import MongoClient

client = MongoClient(
    "mongodb://YOUR_USER:YOUR_PASSWORD@YOUR_HOST/?readPreference=primary&ssl=false&authMechanism=DEFAULT&authSource=ich"
)
db = client["ich"]
coll = db["Spotify_Youtube"]

top20youtube = client['ich']['Spotify_Youtube'].aggregate(
  [
    {"$match": {}},
    {"$sort": {"Views": -1}},
    {"$limit": 20},
    {"$project": {"Track":1, "Views":1, "_id":0}}
  ]
)


top20spotify = client['ich']['Spotify_Youtube'].aggregate(
  [
    {"$match": {}},
    {"$sort": {"Stream": -1}},
    {"$limit": 20},
    {"$project": {"Track":1, "Stream":1, "_id":0}}
  ]
)

edit_client = MongoClient(
    "mongodb://YOUR_EDITOR_USER:YOUR_PASSWORD@YOUR_HOST/?readPreference=primary&ssl=false&authSource=ich_edit"
)
edit_db = edit_client["ich_edit"]

edit_db["120925_Honcharov_top20youtube"].delete_many({})
edit_db["120925_Honcharov_top20youtube"].insert_many(top20youtube) 
edit_db["120925_Honcharov_top20spotify"].delete_many({})
edit_db["120925_Honcharov_top20spotify"].insert_many(top20spotify)

// Это по желанию выводить в Python не требовалось по задаче
print("-" * 40 + " top20youtube"+ "-" * 40)
for doc in edit_db["120925_Honcharov_top20youtube"].find():
    print(doc)

print("-" * 40 + " top20spotify"+ "-" * 40)
for doc in edit_db["120925_Honcharov_top20spotify"].find():
    print(doc)
