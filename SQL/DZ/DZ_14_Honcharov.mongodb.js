Из коллекции customers выяснить из какого города "Sven Ottlieb"
db.getCollection('customers').find(
  { ContactName: 'Sven Ottlieb' },
  { _id: 0, ContactName: 1, City: 1 }
);

Из коллекции ich.US_Adult_Income найти возраст самого взрослого человека
db.getCollection('US_Adult_Income')
  .find({}, { _id: 1, age: 1 })
  .sort({ age: -1 })
  .limit(1);


Из 2 задачи выясните, сколько человек имеют такой же возраст
db.getCollection('US_Adult_Income').find({
  age: 90
});
Cтранное задание. Мы вроде не учили еще агрегацию и подсчет строк в mongo. 
По фильтру вижу что их 43 человка. 


Найти _id ObjectId документа, в котором education " IT-career-hub"
db.getCollection('US_Adult_Income').find(
  { education: ' IT-career-hub' },
  { _id: 1 }
);

Выяснить количество людей в возрасте между 20 и 30 годами
db.getCollection('US_Adult_Income')
  .find({ age: { $gt: 20, $lt: 30 } })
  .sort({ age: 1 });

Для проверки отсортировал. Сами года 20 и 30 не учитывал(в задании не сказано.)
Количество: 7301


