import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.bbc.com/indonesia/articles/cm2yp236n1yo", {waitUntil: "networkidle2"});
  await page.emulateMediaType("screen");
  const buffer = await page.pdf({format: "A4", printBackground: true, margin: {top: '1cm', right: '1cm', bottom: '1cm', left: '1cm'}});
  writeFileSync("bbc.pdf", buffer);
  console.log("Success");
  await browser.close();
})();
