// Load saved color when popup opens
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["backgroundColor"], (result) => {
    if (result.backgroundColor) {
      // Update color picker input to reflect saved color
      document.getElementById("colorPicker").value = result.backgroundColor;
    }
  });
});

// Color picker input event
document.getElementById("colorPicker").addEventListener("input", (event) => {
  const color = event.target.value;
  saveColor(color);
  changeBackground(color);
});

const colors = ["#fffaec", "#f8f3e7", "#d9d9d9", "#bdbdbd"];

for (var i = 0; i < 4; i++) {
  let ele = document.getElementById(`color${i}`);
  let color = colors[i];
  ele.addEventListener("click", () => {
    saveColor(color);
    changeBackground(color);
  });
  ele.style.backgroundColor = color;
}

// Radio button change events to reapply saved color (with reset first)
document.querySelectorAll('input[name="colorScope"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    chrome.storage.local.get(["backgroundColor"], (result) => {
      if (result.backgroundColor) {
        changeBackgroundWithReset(result.backgroundColor);
      }
    });
  });
});

// Save color to chrome storage
function saveColor(color) {
  chrome.storage.local.set({ backgroundColor: color });
}

// Apply background color with reset (used when switching scopes)
function changeBackgroundWithReset(color) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const scope = document.querySelector('input[name="colorScope"]:checked').value;

    // First, reset all previously applied background styles
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: resetStyles,
    });

    // Then apply the new background based on scope
    setTimeout(() => {
      const func = scope === "body" ? changeBackgroundColor : changeAllElementsBackgroundColor;
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: func,
        args: [color],
      });
    }, 50);
  });
}

// Apply background color without reset (used when selecting new color)
function changeBackground(color) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const scope = document.querySelector('input[name="colorScope"]:checked').value;
    const func = scope === "body" ? changeBackgroundColor : changeAllElementsBackgroundColor;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: func,
      args: [color],
    });
  });
}

function changeBackgroundColor(color) {
  document.body.style.backgroundColor = color;
}

function resetStyles() {
  // Remove CSS rules inserted by this extension (matching our pattern)
  for (let i = document.styleSheets.length - 1; i >= 0; i--) {
    const sheet = document.styleSheets[i];
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (!rules) continue;

      // Collect indices to remove (in reverse order)
      const indicesToRemove = [];
      for (let j = rules.length - 1; j >= 0; j--) {
        const rule = rules[j];
        if (rule.cssText && rule.cssText.startsWith("* { background-color:")) {
          indicesToRemove.push(j);
        }
      }

      // Remove the rules
      for (const index of indicesToRemove) {
        sheet.deleteRule(index);
      }
    } catch (e) {
      // Cross-origin stylesheets may throw, skip them
    }
  }

  // Clear inline backgroundColor styles from all elements
  document.querySelectorAll("*").forEach((el) => {
    el.style.backgroundColor = "";
  });
}

function changeAllElementsBackgroundColor(color) {
  const sheet = window.document.styleSheets[0];
  sheet.insertRule("* { background-color: " + color + " !important; }", sheet.cssRules.length);
}
