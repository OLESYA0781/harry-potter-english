import { test, expect } from "@playwright/test";
const answers = {
  A2: [
    "visited",
    "ate",
    "did not go",
    "Did",
    "is",
    "taller",
    "the most hardworking",
    "many",
    "any",
    "drawing",
  ],
  B1: [
    "visited",
    "finished",
    "since",
    "was reading",
    "studies",
    "'d buy",
    "is spoken",
    "that",
    "was",
    "must",
  ],
};
for (const level of ["A2", "B1"] as const)
  test(`${level}: all ten text answers check and persist`, async ({ page }) => {
    await page.goto("/#/lessons/trial");
    await page
      .locator(".nav-item")
      .nth(level === "A2" ? 12 : 13)
      .click();
    const section = page.locator(".grammar-challenge");
    await section
      .getByRole("button", { name: "Question 1", exact: true })
      .click();
    const initialProgress = await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem("hogwarts-english-v1")!).data.answers[
          key
        ],
      `grammar${level}`,
    );
    expect(initialProgress).toBeUndefined();
    await expect(section.locator("input")).toHaveCount(1);
    await expect(section.locator(".grammar-feedback")).toHaveCount(0);
    for (const [i, answer] of answers[level].entries()) {
      await expect(
        section.getByText(`Question ${i + 1} of 10`, { exact: true }),
      ).toBeVisible();
      await section.locator("input").fill(`  ${answer.toUpperCase()}  `);
      await section.getByRole("button", { name: "Check", exact: true }).click();
      await expect(section.locator(".grammar-feedback")).toContainText(
        "Well done!",
      );
      if (i < 9)
        await section
          .getByRole("button", { name: "Next question", exact: true })
          .click();
      else
        await section.getByRole("button", { name: "Finish challenge" }).click();
    }
    await expect(section.locator(".quote")).toContainText(
      `${level} Grammar: 10/10`,
    );
    await page.reload();
    await expect(section.locator(".quote")).toContainText(
      `${level} Grammar: 10/10`,
    );
    await page
      .getByRole("button", { name: "Teacher mode", exact: true })
      .click();
    await expect(section.locator(".grammar-report h3")).toHaveText(
      `${level} Grammar: 10/10`,
    );
    await page.locator(".nav-item").nth(14).click();
    await expect(
      page
        .locator(".grammar-report")
        .filter({ hasText: `${level} Grammar: 10/10` }),
    ).toBeVisible();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download results (PDF)" }).click();
    expect(await (await download).failure()).toBeNull();
  });
test("hints, retries, drafts, skipping, optional speaking and independent access", async ({
  page,
}) => {
  await page.goto("/#/lessons/trial");
  await page.locator(".nav-item").nth(12).click();
  const section = page.locator(".grammar-challenge");
  await section.locator("input").fill("visit");
  await section.getByRole("button", { name: "Check", exact: true }).click();
  await expect(section.locator(".grammar-feedback")).toContainText(
    "Answer: visited",
  );
  await section.getByRole("button", { name: "Try Again", exact: true }).click();
  await expect(section.locator(".grammar-feedback")).toHaveCount(0);
  await section.getByRole("button", { name: "Hint", exact: true }).click();
  await section.locator("input").fill("visited");
  await section.getByRole("button", { name: "Check", exact: true }).click();
  await section
    .getByRole("button", { name: "Next question", exact: true })
    .click();
  await section.locator("input").fill("my draft");
  await page.reload();
  await expect(section.locator("input")).toHaveValue("my draft");
  await section
    .getByRole("button", { name: "Next question", exact: true })
    .click();
  await page.getByRole("button", { name: "Teacher mode", exact: true }).click();
  await expect(section.locator(".grammar-report")).toContainText(
    "повторных попыток: 1",
  );
  await expect(section.locator(".grammar-report")).toContainText(
    "пропущено: 1",
  );
  await expect(section.locator(".grammar-report")).toContainText(
    "верно после Hint: 1",
  );
  await expect(section.locator(".grammar-report h3")).toHaveText(
    "A2 Grammar: 0/10",
  );
  await page.locator(".nav-item").nth(13).click();
  await expect(
    section.getByText("Can you make your own sentence?", { exact: true }),
  ).toBeVisible();
  await section
    .locator(".rating")
    .getByRole("button", { name: "Answered independently", exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "Teacher mode", exact: true }).click();
  await expect(section.locator(".rating button.chosen")).toHaveText(
    "Answered independently",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/grammar-b1-mobile.png", fullPage: true });
});
test("previous version two final results stay on results after two chapters are added", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("hogwarts-english-v1"))
      localStorage.setItem(
        "hogwarts-english-v1",
        JSON.stringify({
          version: 2,
          data: {
            step: 12,
            name: "Alice",
            answers: {
              differencesFound: [0, 1, 2, 3, 4, 5],
              differencesSceneVersion: 2,
            },
            scores: {},
            ratings: { reading: 2 },
          },
        }),
      );
  });
  await page.goto("/#/lessons/trial");
  await expect(page.locator(".congratulations")).toBeVisible();
  const s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hogwarts-english-v1")!),
  );
  expect(s.version).toBe(3);
  expect(s.data.step).toBe(14);
  expect(s.data.answers.differencesFound).toHaveLength(6);
});
