import { test, expect } from "@playwright/test";
async function stage(page: any, n: number) {
  await page.locator(".nav-item").nth(n).click();
}
test("welcome, navigation, persistence and confirmed restart", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome to Hogwarts!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start our adventure!" }).click();
  await page.getByPlaceholder("Your name", { exact: true }).fill("Алиса");
  await page.getByRole("button", { name: "Happy!" }).click();
  await page.reload();
  await expect(page.getByPlaceholder("Your name", { exact: true })).toHaveValue(
    "Алиса",
  );
  await stage(page, 7);
  await page
    .getByRole("group")
    .first()
    .getByRole("button", { name: "go", exact: true })
    .click();
  await expect(page.getByText("A little more magic… Try again!")).toBeVisible();
  await page
    .getByRole("group")
    .first()
    .getByRole("button", { name: "goes", exact: true })
    .click();
  await expect(page.getByText("✦ Well done!")).toBeVisible();
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("hogwarts-english-v1")!).data,
  );
  expect(saved.scores.grammar0.first).toBe(false);
  expect(saved.scores.grammar0.correct).toBe(true);
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page.getByRole("button", { name: "Keep learning" }).click();
  await expect(page.locator(".section-heading h1")).toHaveText(
    "Grammar spells",
  );
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page.getByRole("button", { name: "Restart lesson" }).click();
  await expect(page.locator(".hero")).toBeVisible();
  expect(errors).toEqual([]);
});
test("sentence order validates real answers and supports tap and reorder", async ({
  page,
}) => {
  await page.goto("/");
  await stage(page, 7);
  const ex = page.locator(".sentence-exercise").first();
  for (const w of ["I", "usually", "get up", "at seven"])
    await ex
      .locator(".drag-tile")
      .filter({ hasText: new RegExp("^" + w + "$") })
      .click();
  await ex.getByRole("button", { name: "Check my order" }).click();
  await expect(ex.getByText("✦ Fantastic! You did it!")).toBeVisible();
  await ex.getByRole("button", { name: "Clear cards" }).click();
  for (const w of ["usually", "I", "get up", "at seven"])
    await ex
      .locator(".drag-tile")
      .filter({ hasText: new RegExp("^" + w + "$") })
      .click();
  await ex.getByRole("button", { name: "Move I left", exact: true }).click();
  await expect(ex.locator(".ordered .drop-target").first()).toContainText("I");
});
test("matching and school bag checks reject extra objects", async ({
  page,
}) => {
  await page.goto("/");
  await stage(page, 9);
  for (const item of ["book", "pencil", "apple", "phone"]) {
    await page
      .locator(".drag-tile")
      .filter({ hasText: new RegExp("^[^a-z]*" + item + "$") })
      .click();
    await page.locator(".drop-target").first().click();
  }
  await page.getByRole("button", { name: "Check my answers" }).click();
  await expect(page.getByText("Keep going! Try again.")).toBeVisible();
  await page.locator(".placed button").filter({ hasText: "phone" }).click();
  await page.getByRole("button", { name: "Check my answers" }).click();
  await expect(page.getByText("✦ Fantastic! You did it!")).toBeVisible();
});
test("listening hides scripts, teacher ratings and both PDF downloads", async ({
  page,
}) => {
  await page.goto("/");
  await stage(page, 8);
  await expect(
    page.getByText("I have got red hair.", { exact: false }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Ron", exact: true }).click();
  await expect(page.getByText("✦ Well done!")).toBeVisible();
  await page.getByRole("button", { name: "Teacher mode", exact: true }).click();
  await page.getByText("Текст и ответ для преподавателя").click();
  await expect(
    page.getByText("I have got red hair. I like eating sandwiches.", {
      exact: true,
    }),
  ).toBeVisible();
  await stage(page, 6);
  await page
    .locator(".rating")
    .first()
    .getByRole("button", { name: "Answered independently" })
    .click();
  await stage(page, 14);
  await expect(page.getByText("Недостаточно данных")).toBeVisible();
  await page.getByPlaceholder("Your name", { exact: true }).fill("Алиса");
  for (const label of ["Download certificate", "Download results (PDF)"]) {
    const dl = page.waitForEvent("download");
    await page.getByRole("button", { name: label, exact: true }).click();
    const download = await dl;
    expect(await download.failure()).toBeNull();
    expect(download.suggestedFilename()).toContain(".pdf");
  }
});
test("reading highlighting and true-false answers persist", async ({
  page,
}) => {
  await page.goto("/");
  await stage(page, 4);
  await page.getByRole("button", { name: "Hello!", exact: true }).click();
  await expect(page.locator(".diary-text button").first()).toHaveClass(/read/);
  await page.getByRole("button", { name: "I have finished reading" }).click();
  await stage(page, 5);
  await page
    .getByRole("group")
    .first()
    .getByRole("button", { name: "Eggs and toast" })
    .click();
  await expect(page.getByText("✦ Well done!")).toBeVisible();
  const tf = page.getByRole("group").nth(5);
  await tf.getByRole("button", { name: "False", exact: true }).click();
  await expect(tf.getByText("✦ Well done!")).toBeVisible();
});
test("all chapters render without browser errors; responsive layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (let i = 0; i < 15; i++) {
    await stage(page, i);
    await expect(page.locator("main")).not.toBeEmpty();
  }
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  for (let i = 0; i < 15; i++) {
    await page.getByRole("combobox").selectOption(String(i));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("combobox").selectOption("0");
  await page.screenshot({ path: "/tmp/english-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.screenshot({ path: "/tmp/english-desktop.png", fullPage: true });
});
test("pointer drag moves a vocabulary object into the bag", async ({
  page,
}) => {
  await page.goto("/");
  await stage(page, 9);
  const source = page.locator(".drag-tile").filter({ hasText: "book" }).first();
  const target = page.locator(".drop-target").first();
  const a = await source.boundingBox(),
    b = await target.boundingBox();
  if (!a || !b) throw Error("Missing drag target");
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 12, a.y + a.height / 2, {
    steps: 4,
  });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 20 });
  await page.mouse.up();
  await expect(page.locator(".placed")).toContainText("book");
});
test("complete lesson produces balanced A2 diagnosis and 37 stars", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.getByRole("button", { name: "Teacher mode", exact: true }).click();
  await stage(page, 3);
  for (let i = 0; i < 6; i++) {
    await page
      .locator(".drag-tile")
      .filter({
        hasText: new RegExp(
          "^" +
            ["Harry", "Hermione", "Ron", "Draco", "Hagrid", "Dumbledore"][i] +
            " is",
        ),
      })
      .click();
    await page.locator(".match-targets .drop-target").nth(i).click();
  }
  await page.getByRole("button", { name: "Check my answers" }).click();
  await expect(page.getByText("6 / 6 matched. Great job!")).toBeVisible();
  await stage(page, 4);
  await page
    .getByRole("button", { name: "Answered independently", exact: true })
    .click();
  await stage(page, 5);
  for (const [i, n] of [0, 1, 2, 0, 0, 1, 0, 1, 0].entries())
    await page
      .getByRole("group")
      .nth(i)
      .locator(".choices button")
      .nth(n)
      .click();
  for (const w of [
    "🌅 Hermione gets up.",
    "🍳 Hermione has breakfast.",
    "🏫 Hermione goes to school.",
    "✏️ Hermione does her homework.",
    "🌙 Hermione goes to bed.",
  ])
    await page
      .locator(".drag-tile")
      .filter({ hasText: w.replace(/^[^A-Za-z]+/, "") })
      .click();
  await page.getByRole("button", { name: "Check my order" }).click();
  await stage(page, 6);
  for (const r of await page.locator(".rating").all())
    await r
      .getByRole("button", { name: "Answered independently", exact: true })
      .click();
  await stage(page, 7);
  for (const [i, n] of [1, 1, 0, 1, 0, 1].entries())
    await page
      .getByRole("group")
      .nth(i)
      .locator(".choices button")
      .nth(n)
      .click();
  const sentences = [
    ["I", "usually", "get up", "at seven"],
    ["Harry", "is", "drinking", "tea"],
    ["I", "can", "play", "football"],
    ["Hermione", "likes", "reading", "books"],
    ["I", "prefer", "reading", "to watching TV"],
  ];
  for (const [i, words] of sentences.entries()) {
    const ex = page.locator(".sentence-exercise").nth(i);
    for (const w of words)
      await ex
        .locator(".drag-tile")
        .filter({ hasText: new RegExp("^" + w + "$") })
        .click();
    await ex.getByRole("button", { name: "Check my order" }).click();
  }
  await stage(page, 8);
  for (const [i, p] of [
    "Ron",
    "Harry",
    "Hermione",
    "Hagrid",
    "Dumbledore",
  ].entries()) {
    await page.getByRole("button", { name: p, exact: true }).click();
    if (i < 4) await page.getByRole("button", { name: "Next clue" }).click();
  }
  await stage(page, 9);
  for (const [i, bag] of [
    ["book", "pencil", "apple"],
    ["pen", "ruler", "notebook"],
    ["sandwich", "phone", "ball"],
  ].entries()) {
    await page
      .getByRole("button", { name: `Bag ${i + 1}`, exact: true })
      .click();
    for (const item of bag) {
      await page
        .locator(".drag-tile")
        .filter({ hasText: new RegExp("^[^a-z]*" + item + "$") })
        .click();
      await page.locator(".bag-targets .drop-target").click();
    }
    await page.getByRole("button", { name: "Check my answers" }).click();
  }
  for (const [i, words] of [
    ["There", "is", "a book", "in the bag"],
    ["There", "are", "two pencils", "in the bag"],
  ].entries()) {
    const ex = page.locator(".sentence-exercise").nth(i);
    for (const w of words)
      await ex
        .locator(".drag-tile")
        .filter({ hasText: new RegExp("^" + w + "$") })
        .click();
    await ex.getByRole("button", { name: "Check my order" }).click();
  }
  await stage(page, 10);
  await page
    .getByRole("button", { name: "Answered independently", exact: true })
    .click();
  await stage(page, 14);
  await expect(page.getByText("Предварительный уровень:")).toContainText("A2");
  await expect(page.locator(".final-stars strong")).toHaveText("37");
});

test("all illustrated chapters load local artwork without system emoji", async ({
  page,
}) => {
  await page.goto("/");
  for (const asset of [
    "characters",
    "objects",
    "environments",
    "differences",
  ]) {
    const response = await page.request.get(`/art/${asset}.webp`);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/webp");
    expect((await response.body()).length).toBeGreaterThan(10000);
  }
  for (let i = 0; i < 15; i++) {
    await stage(page, i);
    const visibleText = await page.locator("main").innerText();
    expect(visibleText).not.toMatch(/\p{Extended_Pictographic}/u);
  }
  await stage(page, 1);
  await expect(page.locator(".moods .mood-art")).toHaveCount(5);
  await page.getByRole("button", { name: "Happy!", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Happy!", exact: true }),
  ).toHaveClass("chosen");
  await stage(page, 2);
  await page
    .getByRole("button", { name: "My magic star", exact: true })
    .click();
  await page.locator(".preference-match .drop-target").first().click();
  await expect(
    page.getByText("I love Harry Potter!", { exact: true }),
  ).toBeVisible();
  await stage(page, 0);
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.screenshot({
    path: "/tmp/english-3d-desktop.png",
    fullPage: true,
  });
  await stage(page, 3);
  await page.screenshot({ path: "/tmp/english-3d-room.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("combobox").selectOption("5");
  await page.screenshot({
    path: "/tmp/english-3d-food-mobile.png",
    fullPage: true,
  });
});

test("teacher sees transcripts for every audio and each round", async ({
  page,
}) => {
  await page.goto("/");
  await stage(page, 8);
  await expect(page.getByTestId("audio-transcript")).toHaveCount(0);
  await page.getByRole("button", { name: "Teacher mode", exact: true }).click();
  const clues = [
    "I have got red hair. I like eating sandwiches.",
    "I have got glasses and a scar. I am brave.",
    "I am a girl. I like Maths and reading.",
    "I am big and friendly. I like animals.",
    "I have got a long white beard. I am the head teacher.",
  ];
  for (const [i, text] of clues.entries()) {
    await expect(page.getByTestId("audio-transcript")).toContainText(text);
    await expect(page.getByTestId("audio-transcript")).toBeVisible();
    if (i < 4) await page.getByRole("button", { name: "Next clue" }).click();
  }
  await stage(page, 4);
  await expect(page.getByTestId("audio-transcript")).toContainText(
    "Hello! My name is Hermione.",
  );
  await expect(page.getByTestId("audio-transcript")).toContainText(
    "I love my school days because I can learn and see my friends!",
  );
  await stage(page, 9);
  for (const [i, text] of [
    "Put a book, a pencil and an apple in my school bag!",
    "Put a pen, a ruler and a notebook in my school bag!",
    "Put a sandwich, a phone and a ball in my school bag!",
  ].entries()) {
    await page
      .getByRole("button", { name: `Bag ${i + 1}`, exact: true })
      .click();
    await expect(page.getByTestId("audio-transcript")).toContainText(text);
    await expect(page.locator(".quote")).toHaveText(text);
  }
  await page.getByRole("button", { name: "Exit teacher mode" }).click();
  await expect(page.getByTestId("audio-transcript")).toHaveCount(0);
});

test("spot six differences, oral examples, teacher grades and persistence", async ({
  page,
}) => {
  await page.goto("/");
  await stage(page, 11);
  await expect(
    page.getByRole("heading", {
      name: "Find the Differences — Spot 6 Differences",
    }),
  ).toBeVisible();
  await expect(page.locator(".difference-counter")).toContainText("0 / 6");
  await expect(page.locator(".difference-scene").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(page.locator(".difference-scene").first()).toHaveCSS(
    "mix-blend-mode",
    "normal",
  );
  await expect(page.locator(".difference-scene").first()).toHaveCSS(
    "background-position",
    "0% 50%",
  );
  await expect(page.locator(".difference-scene").nth(1)).toHaveCSS(
    "background-position",
    "100% 50%",
  );
  await expect(page.locator(".difference-hotspot")).toHaveCount(12);
  await page
    .getByRole("button", { name: "Compare area 1 in picture A", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare area 1 in picture B", exact: true })
    .click();
  await expect(page.locator(".difference-counter")).toContainText("1 / 6");
  const card = page.locator(".difference-answer").first();
  await expect(
    card.getByRole("button", { name: "Show example" }),
  ).toBeDisabled();
  await card.getByRole("button", { name: "I have tried!" }).click();
  await card.getByRole("button", { name: "Show example" }).click();
  await expect(card.locator(".quote")).toContainText(
    "Ron is eating an apple, but in picture B, he is drinking water.",
  );
  for (let i = 2; i <= 6; i++)
    await page
      .getByRole("button", {
        name: `Compare area ${i} in picture A`,
        exact: true,
      })
      .click();
  await expect(page.locator(".difference-counter")).toContainText("6 / 6");
  await expect(page.locator(".difference-hotspot.found")).toHaveCount(12);
  await page.getByRole("button", { name: "Teacher mode", exact: true }).click();
  for (const r of await page.locator(".rating").all())
    await r
      .getByRole("button", { name: "Answered independently", exact: true })
      .click();
  await page.reload();
  await expect(page.locator(".difference-counter")).toContainText("6 / 6");
  await page.getByRole("button", { name: "Teacher mode", exact: true }).click();
  await expect(page.locator(".rating button.chosen")).toHaveCount(4);
  await stage(page, 14);
  await expect(page.getByText("Найдено: 6/6.", { exact: false })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download results (PDF)" }).click();
  expect(await (await download).failure()).toBeNull();
  await stage(page, 11);
  await page.getByRole("button", { name: "Find them again" }).click();
  await expect(page.locator(".difference-counter")).toContainText("0 / 6");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/english-differences-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.screenshot({
    path: "/tmp/english-differences-desktop.png",
    fullPage: true,
  });
});
test("existing saved lesson results migrate to the new final chapter", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("hogwarts-english-v1"))
      localStorage.setItem(
        "hogwarts-english-v1",
        JSON.stringify({
          version: 1,
          data: {
            step: 11,
            name: "Alice",
            answers: { mood: "Happy!" },
            scores: {
              grammar0: { correct: true, first: true, skill: "Grammar" },
            },
            ratings: { reading: 2 },
          },
        }),
      );
  });
  await page.goto("/");
  await expect(page.locator(".congratulations")).toBeVisible();
  await expect(page.getByPlaceholder("Your name", { exact: true })).toHaveValue(
    "Alice",
  );
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hogwarts-english-v1")!),
  );
  expect(stored.version).toBe(3);
  expect(stored.data.step).toBe(14);
  expect(stored.data.scores.grammar0.correct).toBe(true);
  expect(stored.data.ratings.reading).toBe(2);
  await page.reload();
  await expect(page.locator(".congratulations")).toBeVisible();
});

test("revised fifth difference preserves four discoveries and teaches floor versus sofa", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "hogwarts-english-v1",
      JSON.stringify({
        version: 2,
        data: {
          step: 11,
          name: "Alice",
          answers: {
            differencesFound: [0, 1, 2, 3, 4],
            differenceAttempt4: true,
            differenceExample4: true,
          },
          scores: {},
          ratings: {},
        },
      }),
    );
  });
  await page.goto("/");
  await expect(page.locator(".difference-counter")).toContainText("4 / 6");
  const card = page.locator(".difference-answer").nth(4);
  await expect(card.getByRole("button", { name: "Show example" })).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Compare area 5 in picture B", exact: true })
    .click();
  await expect(page.locator(".difference-counter")).toContainText("5 / 6");
  await expect(
    card.getByRole("button", { name: "Show example" }),
  ).toBeDisabled();
  await card.getByRole("button", { name: "I have tried!" }).click();
  await card.getByRole("button", { name: "Show example" }).click();
  await expect(card.locator(".quote")).toHaveText(
    "In picture A, Hermione is sitting on the floor, but in picture B, she is sitting on the sofa.",
  );
  await page.getByRole("button", { name: "Teacher mode", exact: true }).click();
  await expect(card.locator(".teacher-note")).toContainText(
    "Гермиона сидит на полу / на диване",
  );
});

test("day and night is a sixth difference and preserves earlier finds", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("hogwarts-english-v1"))
      localStorage.setItem(
        "hogwarts-english-v1",
        JSON.stringify({
          version: 2,
          data: {
            step: 11,
            name: "Alice",
            answers: {
              differencesFound: [0, 1, 2, 3, 4],
              differencesSceneVersion: 2,
            },
            scores: {},
            ratings: {},
          },
        }),
      );
  });
  await page.goto("/");
  await expect(page.locator(".difference-counter")).toContainText("5 / 6");
  await page
    .getByRole("button", { name: "Compare area 6 in picture B", exact: true })
    .click();
  await expect(page.locator(".difference-counter")).toContainText("6 / 6");
  const card = page.locator(".difference-answer").nth(5);
  await expect(
    card.getByRole("heading", { name: "6. Day or night?" }),
  ).toBeVisible();
  await expect(
    card.getByRole("button", { name: "Show example" }),
  ).toBeDisabled();
  await card.getByRole("button", { name: "I have tried!" }).click();
  await card.getByRole("button", { name: "Show example" }).click();
  await expect(card.locator(".quote")).toHaveText(
    "In picture A, it is daytime, but in picture B, it is night.",
  );
  await page.reload();
  await expect(page.locator(".difference-counter")).toContainText("6 / 6");
  await page.getByRole("button", { name: "Teacher mode", exact: true }).click();
  await expect(card.locator(".teacher-note")).toContainText(
    "В A день, в B ночь",
  );
});
