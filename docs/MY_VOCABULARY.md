# My Vocabulary — Мой словарь

Отдельная страница `#/vocabulary` открывается из верхней панели и отдельной карточки на главной. Доступна без входа. Данные только для чтения, не создают записей Supabase и не меняют прогресс уроков. Существующие учебные словари не изменены.

57 записей: General Words — 6, Places in Town — 11, Transport — 10, Everyday Life — 15, Jobs — 15. У каждой English, русский перевод и полноценный пример. На компьютере/планшете — три колонки, на телефоне — карточки с тремя полями. Поиск по English/переводу не зависит от регистра, принимает café/cafe; фильтр темы применяется совместно с поиском. Нет микрофона, записи, регистрации или проверки произношения.

Для пополнения добавьте запись с уникальным стабильным id в `src/vocabulary/entries.json`: english, russian, example, group и lessonSources. `lessonSources` содержит пути только при дословном совпадении с текущим учебным материалом; пустой список означает отдельный пример из задания на словарь. Примеры не обозначаются ученице как уже пройденные.

## Происхождение предложений

Первоначальные 42 предложения сохранены из таблицы пользовательского задания. Дословный поиск в текущем исходном коде уроков (без тестов) дал одно совпадение: **bus — I go to school by bus.**, `src/lessons/presentSimple/course.ts` (Lesson 1). Это не утверждение о том, что ученица уже проходила предложение.

Остальные **41 пример** — новые для отдельного словаря, предоставленные в задании; они не выдаются за цитаты существующих уроков. Для первоначальных 42 записей новых предложений сверх таблицы не сочинялось. Полный список для проверки:

| English | Example | Источник |
| --- | --- | --- |
| pupil | Harry is a pupil at Hogwarts. | Задание на My Vocabulary; новый пример в словаре |
| rich | Malfoy is a rich boy. | Задание на My Vocabulary; новый пример в словаре |
| swimming pool | We swim in a swimming pool. | Задание на My Vocabulary; новый пример в словаре |
| clean | My room is clean and comfortable. | Задание на My Vocabulary; новый пример в словаре |
| tired | Ron is tired after school. | Задание на My Vocabulary; новый пример в словаре |
| to paint | Hermione paints a picture of Hogwarts. | Задание на My Vocabulary; новый пример в словаре |
| wall | There is a beautiful picture on the wall. | Задание на My Vocabulary; новый пример в словаре |
| bank | The bank is next to the museum. | Задание на My Vocabulary; новый пример в словаре |
| café | We have lunch at a café after school. | Задание на My Vocabulary; новый пример в словаре |
| cinema | Harry and Ron go to the cinema on Saturdays. | Задание на My Vocabulary; новый пример в словаре |
| hospital | The hospital is near the park. | Задание на My Vocabulary; новый пример в словаре |
| hotel | My family stays at a hotel on holiday. | Задание на My Vocabulary; новый пример в словаре |
| museum | Hermione visits the museum with her friends. | Задание на My Vocabulary; новый пример в словаре |
| park | I walk in the park with my family. | Задание на My Vocabulary; новый пример в словаре |
| restaurant | We have dinner at a restaurant on Sundays. | Задание на My Vocabulary; новый пример в словаре |
| stadium | Harry plays Quidditch at the stadium. | Задание на My Vocabulary; новый пример в словаре |
| theatre | We go to the theatre with our teacher. | Задание на My Vocabulary; новый пример в словаре |
| bike / bicycle | I go to school by bike. | Задание на My Vocabulary; новый пример в словаре |
| boat | The students travel across the lake by boat. | Задание на My Vocabulary; новый пример в словаре |
| bus | I go to school by bus. | Lesson 1, дословное совпадение |
| car | My dad goes to work by car. | Задание на My Vocabulary; новый пример в словаре |
| taxi | We go to the hotel by taxi. | Задание на My Vocabulary; новый пример в словаре |
| motorbike | My uncle goes to work by motorbike. | Задание на My Vocabulary; новый пример в словаре |
| plane | We travel to another country by plane. | Задание на My Vocabulary; новый пример в словаре |
| train | Harry goes to Hogwarts by train. | Задание на My Vocabulary; новый пример в словаре |
| tram | My friend goes to school by tram. | Задание на My Vocabulary; новый пример в словаре |
| underground | I go to the city centre by underground. | Задание на My Vocabulary; новый пример в словаре |
| to sleep | I sleep for eight hours every night. | Задание на My Vocabulary; новый пример в словаре |
| to write a letter | Hermione writes a letter to her friend. | Задание на My Vocabulary; новый пример в словаре |
| usually | I usually eat porridge for breakfast. | Задание на My Vocabulary; новый пример в словаре |
| after school | I play chess with my friends after school. | Задание на My Vocabulary; новый пример в словаре |
| sometimes | I sometimes watch films with my family. | Задание на My Vocabulary; новый пример в словаре |
| porridge | I eat porridge for breakfast every morning. | Задание на My Vocabulary; новый пример в словаре |
| language | English is my favourite foreign language. | Задание на My Vocabulary; новый пример в словаре |
| literature | We study Russian language and literature at school. | Задание на My Vocabulary; новый пример в словаре |
| to rest | I rest at home after school. | Задание на My Vocabulary; новый пример в словаре |
| to spend time with my family | I spend time with my family at weekends. | Задание на My Vocabulary; новый пример в словаре |
| to clean my room | I clean my room every Saturday. | Задание на My Vocabulary; новый пример в словаре |
| to drink | I drink a cup of tea in the morning. | Задание на My Vocabulary; новый пример в словаре |
| a cup of tea | My mum drinks a cup of tea after breakfast. | Задание на My Vocabulary; новый пример в словаре |
| on the floor | Our cat sleeps on the floor. | Задание на My Vocabulary; новый пример в словаре |
| to sit | Ron sits on the sofa. | Задание на My Vocabulary; новый пример в словаре |

## Проверки

Unit-тесты: число/уникальность записей, обязательные поля и группы, отсутствие This is/These are, восемь infinitive-форм, двуязычный поиск и совместный фильтр. Browser-тесты: все 42 записи/три поля, поиск/пустая выдача/сброс, ссылки и reload на ширинах 390, 820, 1180, 1440. Проверка настоящего Safari/iPad не заменяется Chromium-эмуляцией.

## Jobs — Go Getter 3, страница 6

Добавлены 15 профессий из блока Vocabulary Jobs на проверенной странице 6 PDF. Примеры к ним авторские, это не предложения учебника: artist, builder, bus driver, chef, doctor, farmer, footballer, nurse, office worker, pilot, police officer, shop assistant, singer, teacher, vet. В записях указан bookSource, lessonSources оставлен пустым.
