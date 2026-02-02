import "./style.css";
import $ from "jquery";
window.$ = $;

$(function () {
  const $p = $("#p");
  const $textarea = $("#textarea");
  let word = "";
  let DEBOUNCE = 50;
  let $spans;

  const englishFromFrench = [
    "agenda",
    "alibi",
    "amateur",
    "animal",
    "artist",
    "ballet",
    "banana",
    "bar",
    "basketball",
    "beef",
    "bingo",
    "blonde",
    "bonus",
    "bouquet",
    "buffet",
    "bus",
    "café",
    "camera",
    "cannabis",
    "canyon",
    "capital",
    "caramel",
    "cartoon",
    "casino",
    "catalogue",
    "chef",
    "cinema",
    "cocktail",
    "coffee",
    "comment",
    "concert",
    "control",
    "costume",
    "crocodile",
    "danger",
    "debut",
    "detail",
    "dialogue",
    "diesel",
    "diploma",
    "doctor",
    "dollar",
    "dragon",
    "dynamic",
    "elephant",
    "email",
    "energy",
    "engine",
    "error",
    "espresso",
    "euro",
    "expert",
    "festival",
    "figure",
    "final",
    "garage",
    "genius",
    "gorilla",
    "graffiti",
    "guitar",
    "hamburger",
    "helicopter",
    "hotel",
    "idea",
    "image",
    "interview",
    "jazz",
    "jungle",
    "kangaroo",
    "karate",
    "kilo",
    "laser",
    "lemon",
    "level",
    "logic",
    "marathon",
    "marketing",
    "massage",
    "menu",
    "metal",
    "minute",
    "mobile",
    "model",
    "moment",
    "motor",
    "museum",
    "music",
    "natural",
    "normal",
    "ogre",
    "opera",
    "original",
    "panic",
    "piano",
    "police",
    "popular",
    "problem",
    "radio",
    "restaurant",
    "robot",
    "salad",
    "sandwich",
    "scenario",
    "second",
    "shampoo",
    "shock",
    "simple",
    "sport",
    "standard",
    "station",
    "stress",
    "studio",
    "taxi",
    "tennis",
    "terminal",
    "terror",
    "ticket",
    "tomato",
    "tunnel",
    "vampire",
    "vanilla",
    "video",
    "virus",
    "yoga",
    "zoo",
  ];

  const frenchFromEnglish = [
    "backstage",
    "bestseller",
    "black",
    "blog",
    "brainstorming",
    "business",
    "casting",
    "check-up",
    "coaching",
    "cool",
    "copyright",
    "corner",
    "crash",
    "designer",
    "digital",
    "doping",
    "email",
    "feedback",
    "feeling",
    "fitness",
    "football",
    "freelance",
    "geek",
    "glamour",
    "hashtag",
    "high-tech",
    "hobby",
    "interview",
    "job",
    "jogging",
    "leader",
    "lobby",
    "manager",
    "marketing",
    "meeting",
    "notebook",
    "parking",
    "people",
    "pitch",
    "planning",
    "podcast",
    "press",
    "quiz",
    "ranking",
    "record",
    "selfie",
    "skateboard",
    "smoking",
    "software",
    "spoiler",
    "start-up",
    "stress",
    "surfer",
    "talk-show",
    "teenager",
    "tennis",
    "timing",
    "training",
    "trend",
    "weekend",
    "workshop",
    "yoga",
  ];
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

  // Ensure origin UI exists
  let $origin = $("#origin");
  if ($origin.length === 0) {
    $origin = $("<div>")
      .attr("id", "origin")
      .addClass("absolute top-4 left-4 flex items-center gap-2 ");
    const $flag = $("<img>")
      .attr("id", "flag")
      .attr("alt", "Origin flag")
      .addClass("w-30 h-30");
    const $label = $("<span>").attr("id", "originLabel");
    $origin.append($flag).append($label);
    $("main").append($origin);
  }

  $textarea.trigger("focus");
  setTimeout(() => {
    $textarea.trigger("focus");
  }, 100);

  function nextword() {
    if (frenchFromEnglish.length === 0 && englishFromFrench.length === 0) {
      window.location.reload();
      return;
    }

    // Toggle origin each word, but avoid toggling to an empty list
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

    // Update origin UI (flag + label)
    const $flag = $("#flag");
    const $label = $("#originLabel");
    if (isFrench) {
      $flag.attr("src", GB_FLAG_SVG);
      $label.text("from English");
    } else {
      $flag.attr("src", FR_FLAG_SVG);
      $label.text("from French");
    }

    // rainbow colors rgb base array
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

    word = isFrench ? frenchFromEnglish.pop() : englishFromFrench.pop();
    $p.empty();
    for (let i = 0; i < word.length; i++) {
      const $span = $("<span>").text(word[i]);
      $span.css("color", `rgb(${colors[i % colors.length].join(", ")})`);
      $p.append($span);
    }
    $spans = $p.children();
  }

  nextword();
  let inputTimeOut;

  /*
  let index = 0;

  $textarea.on("keypress", (e) => {
    clearTimeout(inputTimeOut);
    inputTimeOut = setTimeout(() => {
      let inputText = $textarea.val().toLowerCase().trim();
      const $currentSpan = $spans.eq(index);
      if (index > 0) $spans.eq(0).removeClass("underline");
      const letter = $currentSpan.text();
      if (inputText[inputText.length -1] == letter) $currentSpan.addClass(
        "correct",
      );
      //$currentSpan.removeClass("underline");
      if (index >= $spans.length) {
        $textarea.val("");
        index = -1;
        nextword();
      }
      index++;
    }, DEBOUNCE);
  });

  const currentYear = new Date().getFullYear();
  const $copyRight = $("#date");
  $copyRight.text(currentYear);
*/

  $(document).on("click", function (event) {
    event.preventDefault();
    //$("textarea").trigger("focus");

    clearTimeout(inputTimeOut);
    inputTimeOut = setTimeout(() => {
      nextword();
    }, DEBOUNCE);
  });
  /*
   */
});
