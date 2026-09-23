const puppeteer = require('puppeteer');

(async () => {
  const brand = process.argv[2];
  const model = process.argv[3];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`https://repairmymobile.co/search/?q=${brand}+${model}`, { waitUntil: 'networkidle2' });

  const links = await page.$$eval('a', anchors =>
    anchors.map(a => a.href).filter(href => href.includes('flash-file'))
  );

  console.log(`✅ Found ${links.length} firmware links`);
  console.log(links.join('\n'));

  await browser.close();
})();
