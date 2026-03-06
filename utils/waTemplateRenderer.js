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

    /* =========================
       VIEWPORT
    ========================= */

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

    /* =========================
       PILIH TEMPLATE
    ========================= */

    let templateFolder;

    if (type === "blur" || type === "sticker") {
      templateFolder = "blur";
    } else {
      templateFolder = "quote";
    }

    const filePath = "file://" + path.join(__dirname, `../template/${templateFolder}/index.html`);

    /* =========================
       FIX TIME
    ========================= */

    let safeTime = time;

    if (!safeTime) {
      const now = new Date();

      const hour = now.getHours().toString().padStart(2, "0");
      const minute = now.getMinutes().toString().padStart(2, "0");

      safeTime = `${hour}:${minute}`;
    }

    /* =========================
       URL PARAM
    ========================= */

    const url = filePath + "?text=" + encodeURIComponent(text || "") + "&time=" + encodeURIComponent(safeTime);

    /* =========================
       LOAD PAGE
    ========================= */

    await page.goto(url, {
      waitUntil: "networkidle0",
    });

    /* =========================
       TUNGGU FONT
    ========================= */

    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    /* =========================
       TUNGGU EMOJI
    ========================= */

    await new Promise((r) => setTimeout(r, 300));

    /* =========================
       SCREENSHOT
    ========================= */

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
