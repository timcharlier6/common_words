import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

async function scrapeWords(url, category) {
  console.log(`Scraping ${category} from ${url}...`);
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  let allWords = [];
  let currentUrl = url;

  try {
    while (currentUrl) {
      await page.goto(currentUrl, { waitUntil: "networkidle2" });

      // Extract words from the current page
      const words = await page.evaluate(() => {
        // Prefer category listing when available (#mw-pages present)
        const categoryRoot = document.querySelector("#mw-pages");
        if (categoryRoot) {
          const links = Array.from(
            categoryRoot.querySelectorAll(".mw-category-group ul li a"),
          );
          return links
            .map((link) => (link.textContent || "").trim())
            .filter(Boolean);
        }

        // Fallback for annex-like pages (e.g., fr.wiktionary annex)
        const root = document.querySelector(".mw-parser-output");
        if (!root) return [];

        const set = new Set();

        // Collect linked words
        const linkEls = Array.from(root.querySelectorAll("a"));
        linkEls.forEach((a) => {
          const t = (a.textContent || "").trim();
          if (t) set.add(t);
        });

        // Collect bolded words
        const boldEls = Array.from(root.querySelectorAll("b, strong"));
        boldEls.forEach((b) => {
          const t = (b.textContent || "").trim();
          if (t) set.add(t);
        });

        // Collect words from list items (tokenize to pick word-like chunks)
        const liEls = Array.from(root.querySelectorAll("li"));
        liEls.forEach((li) => {
          const text = (li.textContent || "").trim();
          const tokens = text.match(/[A-Za-zÀ-ÖØ-öø-ÿœæç]+/g) || [];
          tokens.forEach((tok) => set.add(tok.trim()));
        });

        return Array.from(set);
      });

      allWords = allWords.concat(words);
      console.log(
        `Found ${words.length} words on this page (total: ${allWords.length})`,
      );

      // Check for "next page" link
      currentUrl = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("#mw-pages a"));
        const nextLink = links.find(
          (el) =>
            el.textContent.includes("page suivante") ||
            el.textContent.includes("next page"),
        );
        return nextLink ? nextLink.href : null;
      });

      if (currentUrl) {
        console.log("Moving to next page...");
      }
    }
  } catch (error) {
    console.error(`Error scraping ${category}:`, error);
  }

  await browser.close();
  return allWords;
}

async function main() {
  const urlEnglishFromFrench =
    "https://en.wiktionary.org/wiki/Category:English_terms_derived_from_French";
  const urlFrenchFromEnglish =
    "https://fr.wiktionary.org/wiki/Cat%C3%A9gorie:Mots_en_fran%C3%A7ais_issus_d%E2%80%99un_mot_en_anglais";

  // Scrape both sources
  const englishFromFrench = await scrapeWords(
    urlEnglishFromFrench,
    "English from French",
  );
  const frenchFromEnglish = await scrapeWords(
    urlFrenchFromEnglish,
    "French from English",
  );

  // Filter to keep only simple words (no spaces, hyphens, or special characters)
  const filterSimpleWords = (words) => {
    return words
      .map((word) => word.toLowerCase())
      .filter(
        (word) =>
          /^[a-zàâäéèêëïîôùûüÿæœç]+$/.test(word) &&
          word.length >= 3 &&
          word.length <= 15,
      );
  };

  const filteredEnglishFromFrench = [
    ...new Set(filterSimpleWords(englishFromFrench)),
  ].sort();
  const filteredFrenchFromEnglish = [
    ...new Set(filterSimpleWords(frenchFromEnglish)),
  ].sort();

  console.log(`\nFiltered results:`);
  console.log(`English from French: ${filteredEnglishFromFrench.length} words`);
  console.log(`French from English: ${filteredFrenchFromEnglish.length} words`);

  // Generate JavaScript file with the word lists
  const jsContent = `// Auto-generated word lists from Wiktionary
// Generated on ${new Date().toISOString()}

export const englishFromFrench = ${JSON.stringify(filteredEnglishFromFrench, null, 2)};

export const frenchFromEnglish = ${JSON.stringify(filteredFrenchFromEnglish, null, 2)};
`;

  fs.writeFileSync("words.js", jsContent);
  console.log("\nWords saved to words.js");

  // Also save as JSON for backup
  const jsonContent = {
    englishFromFrench: filteredEnglishFromFrench,
    frenchFromEnglish: filteredFrenchFromEnglish,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync("words.json", JSON.stringify(jsonContent, null, 2));
  console.log("Words also saved to words.json");
}

main().catch(console.error);
