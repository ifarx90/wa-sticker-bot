const puppeteer = require("puppeteer");
const path = require("path");

async function generateWATemplate(text, type = "quote") {
  let browser;

  try {
    console.log("🚀 Launch puppeteer...");

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    const page = await browser.newPage();

    console.log("📐 Set viewport...");

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

    /* ======================
   PILIH TEMPLATE
====================== */

    let templateFolder;

    if (type === "blur" || type === "sticker") {
      templateFolder = "blur";
    } else {
      templateFolder = "quote";
    }

    const filePath = "file://" + path.join(__dirname, `../template/${templateFolder}/index.html`);

    console.log("📂 Load template:", templateFolder);

    const url = filePath + "?text=" + encodeURIComponent(text) + "&mode=" + type;

    await page.goto(url, {
      waitUntil: "networkidle0",
    });

    /* tunggu font */

    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    /* tunggu emoji */

    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log("📸 Screenshot...");

    const buffer = await page.screenshot({
      type: "png",
      omitBackground: type === "sticker",
    });

    await browser.close();

    console.log("✅ Template selesai dirender");

    return buffer;
  } catch (err) {
    console.error("❌ Render Error:", err);

    if (browser) await browser.close();

    throw err;
  }
}

module.exports = { generateWATemplate };
