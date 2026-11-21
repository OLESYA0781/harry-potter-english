import { expect, test } from '@playwright/test';

test('Lesson 3 keeps the village, opens all sections and restores a mobile writing draft', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/lessons/lesson-3');
  const sections = page.getByLabel('Choose Lesson 3 section');
  await expect(sections.locator('option')).toHaveCount(11);
  await expect(page.locator('.village-house')).toHaveCount(8);
  await sections.selectOption('1');
  await page.getByRole('button', { name: 'Открыть Bag A — Emma' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Открыть Bag A — Emma' })).toHaveAttribute('aria-expanded', 'true');
  await sections.selectOption('2');
  await expect(page.locator('.bag-cards article')).toHaveCount(13);
  await page.getByRole('button', { name: 'key', exact: true }).click();
  await page.getByRole('button', { name: 'Картинка 1', exact: true }).first().click();
  await expect(page.locator('.bag-target').first().getByRole('button', { name: 'key' })).toBeVisible();
  for (const [index, title] of [[3, 'A. Who Speaks First?'], [4,'A or An?'], [5,'One or Many?'], [6,'Have or Has?'], [7,'Round 1. A or An?'], [8,'E. Ask the Teacher'], [9,'C. Write Your Own Post'], [10,'Part 1 — Vocabulary']] as const) {
    await sections.selectOption(String(index));
    await expect(page.getByRole('heading', { name: title, exact: false }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  await sections.selectOption('8');
  await expect(page.getByRole('heading', { name: 'Questions with Have — Do or Does?' })).toBeVisible();
  await expect(page.getByText("Does Harry have two pens? No, he doesn't.", { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Teacher mode', exact: true }).click();
  await page.getByRole('heading', { name: 'E. Ask the Teacher' }).locator('..').locator('summary').click();
  await expect(page.getByText("Does Harry have two pens? No, he doesn't.", { exact: true })).toBeVisible();
  await sections.selectOption('9');
  await page.getByLabel('Предмет', { exact: true }).selectOption('notebook');
  await page.getByLabel('Твоё объявление').fill('LOST. A small blue notebook.');
  await page.getByLabel('Твоё личное сообщение').fill('Hi! I found your notebook.');
  await page.reload();
  await expect(sections).toHaveValue('9');
  await expect(page.getByLabel('Твоё объявление')).toHaveValue('LOST. A small blue notebook.');
  await expect(page.getByLabel('Твоё личное сообщение')).toHaveValue('Hi! I found your notebook.');
});

test('desktop sidebar opens each grammar section and remembers an article placement', async ({ page }) => {
  await page.goto('/#/lessons/lesson-3');
  const nav = page.getByRole('navigation', { name: 'Lesson 3 sections' });
  await expect(nav.getByRole('button')).toHaveCount(11);
  await nav.getByRole('button', { name: '5 A or An?' }).click();
  const explanation = page.getByRole('region', { name: 'A or An? — Как выбрать правильный артикль' });
  await expect(explanation.locator('table')).toBeVisible();
  await explanation.getByRole('button', { name: /Понятно/ }).click();
  const source = page.getByRole('button', { name: 'address', exact: true });
  const target = page.getByRole('button', { name: 'AN', exact: true });
  await source.dragTo(target);
  await expect(target.locator('..').getByRole('button', { name: 'address' })).toBeVisible();
  await page.reload();
  await expect(target.locator('..').getByRole('button', { name: 'address' })).toBeVisible();
  await expect(explanation).toBeVisible();
});

test('final challenge checks vocab and grammar and awaits teacher speaking approval', async ({ page }) => {
  await page.goto('/#/lessons/lesson-3');
  await page.getByRole('navigation', { name: 'Lesson 3 sections' }).getByRole('button', { name: '11 Final Challenge' }).click();
  const vocab = page.getByRole('heading', { name: 'Part 1 — Vocabulary' }).locator('..');
  const grammar = page.getByRole('heading', { name: 'Part 2 — Grammar' }).locator('..');
  for (const [index, answer] of ['umbrella','wallet','bottle of water','notebook','banana'].entries()) {
    await vocab.getByRole('textbox').nth(index).fill(answer);
  }
  await vocab.getByRole('button', { name: 'Проверить', exact: true }).click();
  for (const [index, answer] of ['an','a','sandwiches','has','have'].entries()) {
    await grammar.locator('form').getByRole('textbox').nth(index).fill(answer);
  }
  await grammar.locator('form').getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mission Complete!' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Teacher mode', exact: true }).click();
  const speaking = page.getByRole('heading', { name: 'Part 3 — Speaking' }).locator('..');
  await speaking.locator('summary').click();
  await speaking.getByRole('button', { name: 'Подтвердить выполнение' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Mission Complete!' })).toBeVisible();
});

test('source activities contain all interview prompts and the Grammar Bank counts', async ({ page }) => {
  await page.goto('/#/lessons/lesson-3');
  const nav = page.getByRole('navigation', { name: 'Lesson 3 sections' });
  await nav.getByRole('button', { name: '4 Street Interviews' }).click();
  const names = page.getByRole('heading', { name: 'B. Name Detective' }).locator('..');
  await expect(names.getByRole('textbox')).toHaveCount(9);
  await expect(names.getByLabel('Исправление: Simnit')).toBeVisible();
  const things = page.getByRole('heading', { name: 'D. Who Has What?' }).locator('..');
  await expect(things.getByRole('combobox')).toHaveCount(6);
  await expect(things.getByLabel('3. A laptop and two books.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Ключ, сверенный по оригинальной записи')).toHaveCount(0);

  await nav.getByRole('button', { name: '7 Have or Has?' }).click();
  const mixed = page.getByRole('heading', { name: '4A. A / An / Have / Has' }).locator('..');
  for (const [i, key] of ['an', 'have a a', 'have a', 'have', 'has'].entries()) {
    await mixed.locator('form').getByRole('textbox').nth(i).fill(key);
  }
  await mixed.locator('form').getByRole('button', { name: 'Проверить' }).click();
  await expect(mixed.getByText('Верно 5 из 5.')).toBeVisible();

  await nav.getByRole('button', { name: '8 Grammar Bank Challenge' }).click();
  const plural = page.getByRole('heading', { name: 'Round 2. Singular and Plural Nouns' }).locator('..');
  await expect(plural.locator('form').getByRole('textbox')).toHaveCount(10);
  await expect(plural.getByLabel('one American city → six …')).toBeVisible();
  const pictures = page.getByRole('heading', { name: 'Round 3. I have… / My city has…' }).locator('..');
  await expect(pictures.locator('form').getByRole('textbox')).toHaveCount(8);
  await expect(pictures.getByRole('img', { name: 'Количество зданий: 3' })).toBeVisible();

  await nav.getByRole('button', { name: '9 Speaking: Compare the Bags' }).click();
  await expect(page.getByRole('heading', { name: '5A. List What You Have' }).locator('..').getByRole('textbox')).toHaveCount(6);
  await expect(page.getByRole('heading', { name: '6A–C. Compare Your Bags' })).toBeVisible();
  await nav.getByRole('button', { name: '10 Writing: Lost & Found' }).click();
  await expect(page.getByRole('button', { name: /Evi · LOST.*High Street/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Jim · FOUND.*Adastra Park/ })).toBeVisible();
});
