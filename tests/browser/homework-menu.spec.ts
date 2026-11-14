import {test,expect} from '@playwright/test';
for(const width of [390,1440])test(`homework is newest-first, independent of lesson order, after reload at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/');
 const menu=page.locator('.homework-menu');await menu.locator('summary').click();await expect(menu.locator('li strong')).toHaveText(['Homework 1','Homework 0']);
 await menu.getByRole('link',{name:/Homework 1/}).click();await expect(page.getByRole('heading',{name:'Lesson 1 — Present Simple Homework',exact:true})).toBeVisible();
 await page.reload();await menu.locator('summary').click();await expect(menu.locator('li strong')).toHaveText(['Homework 1','Homework 0']);
 await menu.getByRole('link',{name:/Homework 0/}).click();await expect(page.getByRole('heading',{name:'Hogwarts Homework — The Magic of To Be',exact:true})).toBeVisible();
 await page.locator('.lesson-menu:not(.homework-menu) > summary').click();await expect(page.locator('.lesson-menu:not(.homework-menu) li strong')).toHaveText(['Lesson 2 — The Hogwarts Mystery: Questions & Articles','Lesson 1 — Present Simple','Lesson 0 — To Be','Trial Lesson']);
});
