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
  const buttons = await page.locator("//tr[td[contains(., '07:00')]]//td[contains(., 'Silovo-kondičný tréning') and contains(., 'Blahuta Ján')]//button[contains(text(), 'PRIHLÁSIŤ')]");

  const count = await buttons.count();
  if (count === 0) {
    console.error("❌ Tréning nebol nájdený!");
    await page.screenshot({ path: "screenshots/error_no_training.png" });
    await browser.close();
    process.exit(1);
  }

  // Použijeme posledný (najneskorší) dostupný tréning
  const index = count - 1;
  const button = buttons.nth(index);

  // Získame dátum tréningu z hlavičky tabuľky (podľa stĺpca)
  const cell = await button.locator("xpath=ancestor::td");
  const cellIndex = await cell.evaluate((el) => el.cellIndex);

  const header = await page.locator(`table thead tr th:nth-child(${cellIndex + 1})`);
  const dateText = await header.textContent();
  console.log(`📅 Dátum tréningu: ${dateText?.trim()}`);

  console.log("✅ Tréning nájdený, klikám na PRIHLÁSIŤ...");
  await button.click();
  
  // Vyplnenie formulára
  console.log("✍️ Vyplňujem formulár...");
  await page.fill('input[name="Name"]', USER_NAME);
  await page.fill('input[name="ContactEmail"]', USER_EMAIL);
  await page.click('button:has-text("Záväzne rezervovať")');

  console.log("🎉 Rezervácia dokončená!");
  await page.screenshot({ path: "screenshots/success.png" });

  await browser.close();
})();
