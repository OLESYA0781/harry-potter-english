import {test,expect} from '@playwright/test';
test('all lessons render from same-origin resources without remote CDN or font requests',async({page})=>{
 const external:string[]=[];
 page.on('request',request=>{const url=new URL(request.url());if(url.protocol.startsWith('http') && url.origin!=='http://127.0.0.1:5173')external.push(url.origin);});
 await page.goto('/');await expect(page.getByRole('heading',{name:'My Lessons',exact:true})).toBeVisible();
 for(const [id,heading] of [['trial','Welcome to Hogwarts!'],['lesson-0','TO BE — Am / Is / Are'],['lesson-1','My Vocabulary']]){
  await page.goto(`/#/lessons/${id}`);await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();
  await expect(page.getByText(/Зарегистрироваться|Sign up/, {exact:true})).toHaveCount(0);
 }
 expect([...new Set(external)]).toEqual([]);
});
