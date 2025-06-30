// Scroll to top button
window.onscroll = function () {
  const topBtn = document.getElementById("topBtn");
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
};

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 🎤 Text-to-Speech
let utterance = null;
let isSpeaking = false;
let lastHighlighted = null;

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");
const statusText = document.getElementById("speechStatus");

// Helper: Update buttons and status
function updateUI(state) {
  switch (state) {
    case "reading":
      pauseBtn.disabled = false;
      resumeBtn.disabled = true;
      stopBtn.disabled = false;
      statusText.textContent = "🔊 Reading...";
      break;
    case "paused":
      pauseBtn.disabled = true;
      resumeBtn.disabled = false;
      stopBtn.disabled = false;
      statusText.textContent = "⏸ Paused";
      break;
    case "stopped":
      pauseBtn.disabled = true;
      resumeBtn.disabled = true;
      stopBtn.disabled = true;
      statusText.textContent = "";
      break;
  }
}

// Read multiple sections by IDs (comma-separated)
function readSections(sectionIds) {
  stopSpeech(); // Stop any existing speech first

  const ids = sectionIds.split(",").map((id) => id.trim());
  let index = 0;

  function readNext() {
    if (index >= ids.length) {
      isSpeaking = false;
      updateUI("stopped");
      clearHighlight();
      return;
    }

    const section = document.getElementById(ids[index]);
    if (!section) {
      index++;
      readNext(); // Skip invalid ID
      return;
    }

    clearHighlight(); // Clear any previous highlight
    section.classList.add("reading-highlight"); // Highlight current
    lastHighlighted = section;

    utterance = new SpeechSynthesisUtterance(section.innerText);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      isSpeaking = true;
      updateUI("reading");
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    utterance.onend = () => {
      section.classList.remove("reading-highlight");
      index++;
      readNext();
    };

    speechSynthesis.speak(utterance);
  }

  readNext();
}

// Clear highlight
function clearHighlight() {
  if (lastHighlighted) {
    lastHighlighted.classList.remove("reading-highlight");
    lastHighlighted = null;
  }
}

// Pause
function pauseSpeech() {
  if (isSpeaking && speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    updateUI("paused");
  }
}

// Resume
function resumeSpeech() {
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    updateUI("reading");
  }
}

// Stop
function stopSpeech() {
  if (speechSynthesis.speaking || speechSynthesis.paused) {
    speechSynthesis.cancel();
    isSpeaking = false;
    updateUI("stopped");
    clearHighlight();
  }
}

// Attach event listeners to Listen buttons
document.querySelectorAll(".listenBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const sectionIds = btn.getAttribute("data-target");
    readSections(sectionIds);
  });
});

// Attach event listeners to control buttons (pause, resume, stop)
pauseBtn.addEventListener("click", pauseSpeech);
resumeBtn.addEventListener("click", resumeSpeech);
stopBtn.addEventListener("click", stopSpeech);

// Adjust table layout on window resize
window.addEventListener("resize", () => {
  const tables = document.querySelectorAll("table");
  tables.forEach((table) => {
    if (window.innerWidth <= 768) {
      table.classList.add("mobile-table");
    } else {
      table.classList.remove("mobile-table");
    }
  });
});

// Initial table layout check
document.addEventListener("DOMContentLoaded", () => {
  const tables = document.querySelectorAll("table");
  if (window.innerWidth <= 768) {
    tables.forEach((table) => table.classList.add("mobile-table"));
  }
});

// Zoom-In/Out Image Feature
document.addEventListener('DOMContentLoaded', () => {
  const zoomables = document.querySelectorAll('.zoomable-image');

  zoomables.forEach(wrapper => {
    const img = wrapper.querySelector('img');

    img.addEventListener('click', () => {
      wrapper.classList.toggle('zoomed');
    });
  });

  document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'IMG' && document.querySelector('.zoomable-image.zoomed')) {
      document.querySelector('.zoomable-image.zoomed').classList.remove('zoomed');
    }
  });
});

// interactive decision guide
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("decision-form");
  const resultContainer = document.getElementById("result-container");
  const resultText = document.getElementById("result-text");

  // Restore values if they exist in localStorage
  ["task", "interactivity", "autonomy"].forEach((id) => {
    const val = localStorage.getItem(id);
    if (val) document.getElementById(id).value = val;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const selections = {
      task: document.getElementById("task").value,
      interactivity: document.getElementById("interactivity").value,
      autonomy: document.getElementById("autonomy").value
    };

    // Save to localStorage
    for (const [key, value] of Object.entries(selections)) {
      localStorage.setItem(key, value);
    }

    // Scoring logic
    const score = { rag: 0, tool: 0, agent: 0 };
    Object.values(selections).forEach((val) => {
      score[val]++;
    });

    const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];

    const descriptions = {
      rag: "RAG-Enabled Gen AI: Ideal for static, factual, document-based tasks.",
      tool: "Tool-Augmented Gen AI: Best for real-time actions and tool integrations.",
      agent: "Agentic AI: Perfect for complex, autonomous workflows with orchestration."
    };

    resultText.textContent = descriptions[best];
    resultContainer.classList.remove("hidden");
    resultContainer.classList.add("animated");
    form.classList.add("hidden");
  });
});

function restart() {
  localStorage.clear();
  document.getElementById("decision-form").reset();
  document.getElementById("decision-form").classList.remove("hidden");
  document.getElementById("result-container").classList.add("hidden");
}

