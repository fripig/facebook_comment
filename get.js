
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const sort_select_target = 'UFI2ViewOptionsSelector/root';
  const comment_count_target = 'UFI2CommentsCount/root';
  await page.goto('https://www.facebook.com/twherohan/posts/2452156781688138')
  
  await page.setViewport({ width: 1461, height: 869 })
  let target = await page.$('[data-testid="'+comment_count_target+'"]');
//   console.log(target);

  await page.click('[data-testid="'+comment_count_target+'"]');

  await page.waitFor('[data-testid="'+sort_select_target+'"]');

  // 切換成所有留言
//   await page.click('[data-testid="'+sort_select_target+'"]');




//   const menutarget = 'a[role="menuitemcheckbox"]';

//   await page.waitFor(menutarget);

//   const elementHandle = await page.$$(menutarget);

//   console.log(elementHandle[2].click());



//   const elementHandle = await page.$('[data-testid="'+sort_select_target+'"]');


// 抓取留言

//UFI2CommentsList/root_depth_0
//UFI2Comment/root_depth_0
//UFI2Comment/body > div.1 html

const result = await page.evaluate(() => {
    let data = []; // Create an empty array that will store our data

    let elements = document.querySelectorAll('div[data-testid="UFI2Comment/body"]'); // Select all Products

    for (var element of elements){ // Loop through each proudct
        console.log(element.childNodes[0])
        let username = element.childNodes[0].childNodes[0].innerHTML; // Select the title
        let price = element.childNodes[0].textContent; // Select the price

        data.push(price); // Push an object with the data onto our array
    }

    return data; // Return our data array
});

//UFI2CommentsPagerRenderer/pager_depth_0

await page.click('[data-testid="UFI2CommentsPagerRenderer/pager_depth_0"]');
await page.waitFor(100);

  
console.log(result);

  await page.screenshot({path: 'example.png'});
  await browser.close()
})()