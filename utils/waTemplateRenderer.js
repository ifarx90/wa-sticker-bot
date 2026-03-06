const puppeteer = require("puppeteer");
const path = require("path");

async function generateWATemplate(text, time, type = "quote") {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",

      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-first-run", "--no-zygote", "--single-process"],
    });

    const page = await browser.newPage();

    if (type === "sticker") {
      await page.setViewport({
        width: 512,
        height: 512,
        deviceScaleFactor: 3,
      });
    } else {
      await page.setViewport({
        width: 480,
        height: 820,
        deviceScaleFactor: 3,
      });
    }

    /* pilih template */

    let templateFolder;

    if (type === "blur" || type === "sticker") {
      templateFolder = "blur";
    } else {
      templateFolder = "quote";
    }

    const filePath = "file://" + path.join(__dirname, `../template/${templateFolder}/index.html`);

    const url = filePath + "?text=" + encodeURIComponent(text) + "&time=" + encodeURIComponent(time);

    await page.goto(url, {
      waitUntil: "networkidle0",
    });

    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    await new Promise((r) => setTimeout(r, 300));

    const buffer = await page.screenshot({
      type: "png",
      omitBackground: type === "sticker",
    });

    await browser.close();

    return buffer;
  } catch (err) {
    if (browser) await browser.close();

    throw err;
  }
}

module.exports = { generateWATemplate };
