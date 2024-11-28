const puppeteer = require('puppeteer');
const checker=CheckMap();
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://testsite.getjones.com/ExampleForm/');



    for (let i= 0; i < 6; i++) {
        for (let [key, values] of checker) {

            //Type values in the Name, Email, Phone and Company fields.

            await page.type(key, values[i]);
        }

        // Bonus: Change the Number of Employees from 1-10 to 51-500


        await page.select('#employees','51-500');

//Click the “Request a call back” button
        //boolean condition to check if we arrived thank you page

        let thank=false;
        try {
            await Promise.all([
                page.click('.primary.button'),
                page.screenshot({ path: `screenshots/screenshot_${i + 1}.jpg`, type:'jpeg' })//screenshot before clicking
        ,
                page.waitForNavigation({ timeout: 5000 }) // Wait for 5 seconds max
            ]);
            console.log('thank you page at url: ', page.url());


        } catch (error) {
            //
        }

        //clean fields,When we were able to gather, then for the next test we will have to enter the page again.




        //check  page-many options to check it but i chose 1
        const cleaner=await page.$("#name");
        if(cleaner) {

            for (let key of checker.keys()) {
                await page.$eval(key, el => el.value = '');
            }
        }
        else {
            await page.goto('https://testsite.getjones.com/ExampleForm/');

        }



    }

    await browser.close();
})();

//Write Map includes all check values
//at Value exist array["","Not FormatValue","start space "," end space"," inside space  ","FormatValue"]
function CheckMap()
{
    const myMap = new Map();

    myMap.set("#name", ["", "Bo99@b", " Charlie", "Charlie ", "Ch arlie", "Charlie"]);
    myMap.set("#email", ["", "example.com", " charlie@example.com", "charlie@example.com ", "ch arlie@example.com", "charlie@example.com"]);
    myMap.set("#phone", ["", "--9876543210", " +5412345678", "+5412345678 ", "+54 12345678", "+5412345678"]);//+54 Argentina Telephone prefix
    myMap.set("#company", ["", "-Com+pan@y", " BBB", "BBB " , "BB B", "BBB"]);

    return myMap;
}