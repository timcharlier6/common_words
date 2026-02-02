import { englishFromFrench, frenchFromEnglish } from "./words.js";

document.addEventListener("DOMContentLoaded", () => {
  const wordEl = document.getElementById("word");

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffleArray(frenchFromEnglish);
  shuffleArray(englishFromFrench);
  let isFrench = false;

  const FR_FLAG_SVG =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='48' viewBox='0 0 3 2'><rect width='1' height='2' x='0' fill='%23005BFF'/><rect width='1' height='2' x='1' fill='%23FFFFFF'/><rect width='1' height='2' x='2' fill='%23FF0018'/></svg>";
  const GB_FLAG_SVG =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='48' viewBox='0 0 60 30'><clipPath id='t'><path d='M30,15 h30 v15 h-60 v-15 z'/></clipPath><path d='M0,0 v30 h60 v-30 z' fill='%23001284'/><path d='M0,0 L60,30 M60,0 L0,30' stroke='%23FFFFFF' stroke-width='6'/><path d='M0,0 L60,30 M60,0 L0,30' stroke='%23CF142B' stroke-width='4' clip-path='url(%23t)'/><path d='M30,0 v30 M0,15 h60' stroke='%23FFFFFF' stroke-width='10'/><path d='M30,0 v30 M0,15 h60' stroke='%23CF142B' stroke-width='6'/></svg>";

  const colors = [
    [255, 0, 0],
    [255, 128, 0],
    [255, 255, 0],
    [128, 255, 0],
    [0, 255, 0],
    [0, 255, 128],
    [0, 255, 255],
    [0, 128, 255],
    [0, 0, 255],
    [128, 0, 255],
    [255, 0, 255],
    [255, 0, 128],
  ];

  function nextWord() {
    if (frenchFromEnglish.length === 0 && englishFromFrench.length === 0) {
      window.location.reload();
      return;
    }

    // Toggle origin, avoiding empty lists
    if (
      isFrench &&
      frenchFromEnglish.length === 0 &&
      englishFromFrench.length > 0
    ) {
      isFrench = false;
    } else if (
      !isFrench &&
      englishFromFrench.length === 0 &&
      frenchFromEnglish.length > 0
    ) {
      isFrench = true;
    } else {
      isFrench = !isFrench;
    }

    // Update flag and label
    const flagEl = document.getElementById("flag");
    const labelEl = document.getElementById("originLabel");
    if (isFrench) {
      flagEl.src = GB_FLAG_SVG;
      labelEl.textContent = "from English";
    } else {
      flagEl.src = FR_FLAG_SVG;
      labelEl.textContent = "from French";
    }

    // Get and display next word
    const word = isFrench ? frenchFromEnglish.pop() : englishFromFrench.pop();
    wordEl.innerHTML = "";
    for (let i = 0; i < word.length; i++) {
      const span = document.createElement("span");
      span.textContent = word[i];
      span.style.color = `rgb(${colors[i % colors.length].join(", ")})`;
      wordEl.appendChild(span);
    }
  }

  nextWord();

  let inputTimeOut;
  document.addEventListener("click", (event) => {
    event.preventDefault();
    clearTimeout(inputTimeOut);
    nextWord();
  });
});
