export const sections = [
  'Warm-up: The Mixed-Up Village', 'Look Inside the Bags', 'Vocabulary: Common Objects',
  'Street Interviews', 'A or An?', 'Singular and Plural Nouns', 'Have or Has?',
  'Grammar Bank Challenge', 'Speaking: Compare the Bags', 'Writing: Lost & Found', 'Final Challenge',
];

export const objects = [
  ['bag', 'сумка', 'bag'], ['banana', 'банан', 0], ['book', 'книга', 'book'],
  ['bottle of water', 'бутылка воды', 1], ['key', 'ключ', 'key'],
  ['laptop', 'ноутбук', 2], ['make-up', 'косметика', 3], ['mobile phone', 'мобильный телефон', 'phone'],
  ['notebook', 'блокнот, тетрадь', 'notebook'], ['purse', 'кошелёк', 4],
  ['sandwich', 'сэндвич', 'sandwich'], ['umbrella', 'зонт', 5], ['wallet', 'кошелёк', 6],
] as const;
export type ObjectWord = typeof objects[number][0] | 'pen';
export type BagItem = readonly [ObjectWord, number];
export const emmaBag: readonly BagItem[] = [['mobile phone', 1], ['notebook', 1], ['pen', 2], ['key', 3], ['book', 1]];
export const harryBag: readonly BagItem[] = [['mobile phone', 1], ['notebook', 1], ['banana', 1], ['umbrella', 1], ['wallet', 1]];
export const finalBag: readonly BagItem[] = [['laptop', 1], ['sandwich', 2], ['key', 3], ['bottle of water', 1]];

export type Prompt = readonly [prompt: string, answer: string];
export const articlePractice: readonly Prompt[] = [
  ['photo','a'], ['restaurant','a'], ['Indian name','an'], ['nationality','a'],
  ['phone number','a'], ['address','an'], ['shop assistant','a'], ['American city','an'],
  ['taxi driver','a'], ['sandwich','a'],
];
export const pluralPractice: readonly Prompt[] = [
  ['one book → two …','books'], ['one phone → four …','phones'], ['one key → three …','keys'],
  ['one box → two …','boxes'], ['one sandwich → three …','sandwiches'], ['one bus → five …','buses'],
  ['one watch → two …','watches'], ['one country → six …','countries'], ['one city → three …','cities'],
  ['one nationality → four …','nationalities'],
];
export const havePractice: readonly Prompt[] = [
  ['Emma / umbrella','Emma has an umbrella.'], ['Harry / two books','Harry has two books.'],
  ['I / phone','I have a phone.'], ['We / three keys','We have three keys.'],
  ['They / banana','They have a banana.'], ['She / notebook','She has a notebook.'],
  ['He / two sandwiches','He has two sandwiches.'], ['You / laptop','You have a laptop.'],
];
export const finalGrammar: readonly Prompt[] = [
  ['___ umbrella','an'], ['___ university','a'], ['One sandwich → two …','sandwiches'],
  ['She ___ a notebook.','has'], ['They ___ three keys.','have'],
];

export type Rule = {
  title: string; rule: string; columns: readonly [string,string]; rows: readonly Prompt[];
  examples: readonly Prompt[]; remember: string; quick: readonly Prompt[]; start?: string;
};
export const rules: Record<'articles'|'plural'|'have'|'questions', Rule> = {
  articles: {
    title:'A or An? — Как выбрать правильный артикль',
    rule:'Когда речь об одном исчисляемом предмете, часто ставим a или an. A ставим перед согласным звуком, an — перед гласным. Слушай первый звук следующего слова. University начинается со звука /j/, как русское «й».',
    columns:['A','AN'], rows:[['a book','an umbrella'],['a phone','an actor'],['a banana','an apple'],['a university','an office worker']],
    examples:[['I have a book.','У меня есть книга.'],['This is an umbrella.','Это зонт.'],['It is a university.','Это университет.']],
    remember:'Правильно: a phone и an umbrella. Формы an phone и a umbrella ошибочны.',
    quick:[['___ umbrella','an'],['___ phone','a'],['___ actor','an'],['___ university','a']],start:'Start the A/An Challenge',
  },
  plural: {
    title:'One or Many? — Один предмет или несколько',
    rule:'Когда предметов несколько, обычно добавляем -s. После -s, -x, -sh и -ch обычно добавляем -es. После согласной меняем -y на -ies. В key перед y стоит гласная, поэтому key → keys.',
    columns:['One','Many'], rows:[['book','books'],['phone','phones'],['key','keys'],['box','boxes'],['sandwich','sandwiches'],['bus','buses'],['watch','watches'],['country','countries'],['city','cities'],['nationality','nationalities']],
    examples:[['I have two books.','У меня две книги.'],['She has three sandwiches.','У неё три сэндвича.'],['They visit two countries.','Они посещают две страны.']],
    remember:'С множественным числом артикль a/an не ставим. A book → two books.',
    quick:[['One sandwich → two …','sandwiches'],['One country → three …','countries'],['One phone → four …','phones']],
  },
  have: {
    title:'Have or Has? — У кого что есть?',
    rule:'Чтобы сказать, что у кого-то что-то есть, используем have или has. Выбираем форму по тому, о ком говорим.',
    columns:['Кто?','Форма'], rows:[['I','have'],['You','have'],['We','have'],['They','have'],['He','has'],['She','has'],['It','has']],
    examples:[['I have a notebook.','У меня есть блокнот.'],['She has an umbrella.','У неё есть зонт.'],['They have two books.','У них две книги.']],
    remember:'He / she / it → has. I / you / we / they → have.',
    quick:[['I ___ a phone.','have'],['Emma ___ a wallet.','has'],['They ___ two books.','have'],['Harry ___ an umbrella.','has']],
  },
  questions: {
    title:'Questions with Have — Do or Does?',
    rule:'В начале вопроса ставим Do с I / you / we / they, а Does с he / she / it. После подлежащего всегда ставим have.',
    columns:['Утверждение','Вопрос'], rows:[['Emma has a phone.','Does Emma have a phone?'],['Harry has a book.','Does Harry have a book?'],['They have keys.','Do they have keys?']],
    examples:[['Yes, she does.','Да, у неё есть.'],["No, she doesn't.",'Нет, у неё нет.'],['Yes, he does.','Да, у него есть.'],["No, he doesn't.",'Нет, у него нет.']],
    remember:'После does нужно have. Правильно: Does Emma have a phone?',
    quick:[['___ Harry have a book?','does'],['Do they ___ keys?','have']],
  },
};
