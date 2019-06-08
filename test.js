
const puppeteer = require('puppeteer');
const md5 =require("md5");

async function  ClickSkip(page){
    try{
        let target = await page.$('#expanding_cta_close_button');
        await target.click();
    } catch{
        return;
    }
    

}

async function ShowComment(page){
        try{
            let target = await page.$('div._5pcr.userContentWrapper  a[data-testid="UFI2CommentsCount/root"]');
            
            await target.click();
            await page.waitFor(1000);
        } catch{
            return;
        }
        
}

async function  ClickMore(page){
    //driver.find_elements_by_xpath('//div[@class="_5pcr userContentWrapper"]//div[@data-testid="UFI2CommentsList/root_depth_0"]//a[@role="button"]')
    let buttons = await page.$$('div._5pcr.userContentWrapper  div[data-testid="UFI2CommentsList/root_depth_0"] a[role="button"]')
    for(i in buttons){
        let button = buttons[i];
        result = await page.evaluate(function(button){
            return button.text;

        },button);
        console.log(result);
    }
    //driver.find_element_by_xpath('//div[@style="display: block;"]//a[@id="expanding_cta_close_button"]').click()

}

(async () => {
    const links = ["https://www.facebook.com/twherohan/posts/2454647268105756"];

    for (key in links) {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        const url = links[key];
        await page.goto(url);
        await page.setViewport({ width: 1461, height: 869 });
        let PostsInformation = {};
        let PostsComments = [];

        await ClickSkip(page);
        await ShowComment(page);
        // po文區塊
        userContent = await page.$('div._5pcr.userContentWrapper');
        // 用戶留言區
        userContent = await page.$('div._5pcr.userContentWrapper');

        ClickMore(page);
        

        result = await page.evaluate(function(userContent){
            return userContent.querySelectorAll('div[data-testid="UFI2Comment/root_depth_0"]');

        },userContent);

        // console.log(result);

        CommentContentList = await userContent.$$('div[data-testid="UFI2Comment/root_depth_0"]');

        // console.log(CommentContentList);


        await page.screenshot({ path: 'screenshot/'+md5(url)+'.png' });
        await browser.close()

    };

})()