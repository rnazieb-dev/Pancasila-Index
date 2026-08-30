import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto("https://www.bbc.com/indonesia/articles/cm2yp236n1yo", {waitUntil: "networkidle2"});
  await page.evaluate(() => { window.scrollBy(0, window.innerHeight); });
  await new Promise(r => setTimeout(r, 1000));
  await page.emulateMediaType("screen");
  
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  
  const buffer = await page.pdf({
    width: "768px",
    height: (height + 100) + "px",
    printBackground: true
  });
  writeFileSync("bbc-full.pdf", buffer);
  console.log("Success");
  await browser.close();
})();
