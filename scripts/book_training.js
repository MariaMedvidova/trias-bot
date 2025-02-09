const { chromium } = require("playwright");
require("dotenv").config();

const URL = "https://triasperformance.sk/calendar";
const USER_NAME = process.env.USER_NAME;
const USER_EMAIL = process.env.USER_EMAIL;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log("🟢 Otváram kalendár...");
  await page.goto(URL);

  // Nájdeme správny tréning na základe názvu a trénera
  const button = await page.locator("//td[contains(., 'Silovo-kondičný tréning') and contains(., 'Blahuta Ján')]//button[contains(text(), 'PRIHLÁSIŤ')]");
  
  if (await button.count() === 0) {
    console.error("❌ Tréning nebol nájdený!");
    await page.screenshot({ path: "screenshots/error_no_training.png" });
    await browser.close();
    process.exit(1);
  }

  console.log("✅ Tréning nájdený, klikám na PRIHLÁSIŤ...");
  await button.first().click();
  
  // Vyplnenie formulára
  console.log("✍️ Vyplňujem formulár...");
  await page.fill('input[name="Name"]', USER_NAME);
  await page.fill('input[name="ContactEmail"]', USER_EMAIL);
  await page.click('button:has-text("Záväzne rezervovať")');

  console.log("🎉 Rezervácia dokončená!");
  await browser.close();
})();
