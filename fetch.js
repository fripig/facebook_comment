
const puppeteer = require('puppeteer');
const md5 =require("md5");
var fs = require('fs');

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
async function html(page,dom){
    return await page.evaluate(d=>d.outerHTML,dom)
}

async function getUserProfile(page,dom){
    // <a class="_6qw4" data-hovercard="/ajax/hovercard/user.php?id=100009389861058" href="/people/%E9%83%AD%E5%87%B1%E7%89%B9/100009389861058">郭凱特</a>
    return await page.evaluate(d=>{
        {
            return{
                username: d.textContent,
            href : d.getAttribute('href'),
            hovercard : d.getAttribute('data-hovercard')
            }
        };
    },dom)
}

async function  ClickSkip(page){
    try{
        let target = await page.$('#expanding_cta_close_button');
        // console.log(target.content());
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

async function ChangeOrder(page){
    try{
        let target = await page.$('div._5pcr.userContentWrapper  a[data-testid="UFI2CommentsCount/root"]');
        
        await target.click();
        await page.waitFor(1000);
        
    } catch{
        return;
    }
    
}

async function HasComment(page,button){
    let result =  await page.evaluate(function(button){
        const map = [
            '則回覆',
            '查看更多',
            '更多留言',
            '查看之前'
        ];
        for(i in map){
            let content = button.text;
            let result = {
                content: button.text,
                check:true
            };
            if(content.includes(map[i])) {
                if(content.includes('隱藏')){
                    result.check = false;
                }
                return result;
            }
        }
        return {
            content: button.text,
            check:false
        };

    },button);
    return result;
}

async function  ClickMore(page){
    //driver.find_elements_by_xpath('//div[@class="_5pcr userContentWrapper"]//div[@data-testid="UFI2CommentsList/root_depth_0"]//a[@role="button"]')
    let buttons = await page.$$('div._5pcr.userContentWrapper  div[data-testid="UFI2CommentsList/root_depth_0"] a[role="button"]')
    var check = false;
    for(i in buttons){
        let button = buttons[i];
        let result = await HasComment(page,button);
        // console.log(result);
        if(result.check){
            check = true;
            // console.log(await html(page,button));
            try {
                await button.click();
            
            await page.waitFor(2000);
            await ClickSkip(page);
            } catch (error) {
                console.log(error);
                await page.screenshot('error.png');
            }
            
        }
    }
    console.log('comment length:'+buttons.length);
    //先測試10則留言就好
    if(buttons.length > 5000) {
        return false;
    }
    return check;
    //driver.find_element_by_xpath('//div[@style="display: block;"]//a[@id="expanding_cta_close_button"]').click()

}

(async () => {
    const links = ["https://www.facebook.com/twherohan/posts/2454647268105756"];

    for (key in links) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage()
        const url = links[key];
        await page.goto(url);
        await page.setViewport({ width: 800, height: 9600 });
        let PostsInformation = {};
        let PostsComments = [];

        await ClickSkip(page);
        await ShowComment(page);
        // 變更排序

        // po文區塊
        userContent = await page.$('div._5pcr.userContentWrapper');
        // 用戶留言區
        userContent = await page.$('div._5pcr.userContentWrapper');

        let notLoop = true;
        //展開留言
        while(notLoop){
            notLoop =  await ClickMore(page);
            // await autoScroll(page);
            // console.log(notLoop);
        }
        
        userContent = await page.$('div._5pcr.userContentWrapper');

        

        try {
            CommentContentList = await userContent.$$('div[data-testid="UFI2Comment/body"] a._6qw4');
        } catch (error) {
            await page.screenshot({ path: 'screenshot/'+md5(url)+'.png' });
        }
        

        let userMap = {};
        if(CommentContentList){
            for(i in CommentContentList){
                let row = CommentContentList[i];
                let temp = await getUserProfile(page,row);
                if(temp.href in userMap){
                    userMap[temp.href].count+=1;
                }else{
                    temp.count=1;
                    userMap[temp.href] = temp;
                }
                
            }
        }


        // console.log(userMap);

        fs.writeFileSync('result/'+md5(url)+'.json', JSON.stringify(userMap));
        await page.screenshot({ path: 'screenshot/'+md5(url)+'.png' });
        await browser.close()

    };

})()