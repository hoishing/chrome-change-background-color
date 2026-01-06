// Pre-defined colors
const bgColors = ["#fffaec", "#f8f3e7", "#d9d9d9", "#bdbdbd"];
const fontColors = ["#3f3f3f", "#929292", "#d6d6d6", "#efefef"];

// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  // Load saved background color
  chrome.storage.local.get(["backgroundColor"], (result) => {
    if (result.backgroundColor) {
      document.getElementById("bgColorPicker").value = result.backgroundColor;
      document.getElementById("bgColorValue").textContent = result.backgroundColor;
    }
  });

  // Load saved font color
  chrome.storage.local.get(["fontColor"], (result) => {
    if (result.fontColor) {
      const savedColor = result.fontColor;
      const sixDigitColor = savedColor.length === 9 ? savedColor.substring(0, 7) : savedColor;
      document.getElementById("fontColorPicker").value = sixDigitColor;
      document.getElementById("fontColorValue").textContent = savedColor;
    }
  });

  initializeBackgroundColorHandlers();
  initializeFontColorHandlers();
});

// =====================
// Background Color Section
// =====================

function initializeBackgroundColorHandlers() {
  // Set up pre-defined background color buttons
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`bg-color${i}`);
    const color = bgColors[i];
    btn.style.backgroundColor = color;
    btn.addEventListener("click", () => {
      saveBackgroundColor(color);
      changeBackgroundColor(color);
    });
  }

  // Custom background color picker
  const bgColorPicker = document.getElementById("bgColorPicker");
  const bgColorValue = document.getElementById("bgColorValue");

  bgColorPicker.addEventListener("input", (event) => {
    const color = event.target.value;
    bgColorValue.textContent = color;
    saveBackgroundColor(color);
    changeBackgroundColor(color);
  });

  // Radio button change events for background
  document.querySelectorAll('input[name="bgColorScope"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      chrome.storage.local.get(["backgroundColor"], (result) => {
        if (result.backgroundColor) {
          changeBackgroundWithReset(result.backgroundColor);
        }
      });
    });
  });
}

function saveBackgroundColor(color) {
  chrome.storage.local.set({ backgroundColor: color });
}

// =====================
// Font Color Section
// =====================

function initializeFontColorHandlers() {
  // Set up pre-defined font color buttons
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`font-color${i}`);
    const color = fontColors[i];
    btn.style.backgroundColor = color;
    btn.addEventListener("click", () => {
      selectAndApplyFontColor(color);
    });
  }

  // Custom font color picker
  const fontColorPicker = document.getElementById("fontColorPicker");
  const fontColorValue = document.getElementById("fontColorValue");

  fontColorPicker.addEventListener("input", (event) => {
    const color = event.target.value;
    fontColorValue.textContent = color;
    selectAndApplyFontColor(color);
  });

  // Radio button change events for font
  document.querySelectorAll('input[name="fontColorScope"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      chrome.storage.local.get(["fontColor"], (result) => {
        if (result.fontColor) {
          changeFontColorWithReset(result.fontColor);
        }
      });
    });
  });
}

function selectAndApplyFontColor(color) {
  // Strip alpha channel if present (convert #rrggbbaa to #rrggbb)
  const sixDigitColor = color.length === 9 ? color.substring(0, 7) : color;
  document.getElementById("fontColorPicker").value = sixDigitColor;
  document.getElementById("fontColorValue").textContent = color;
  saveFontColor(color);
  changeFontColor(color);
}

function saveFontColor(color) {
  chrome.storage.local.set({ fontColor: color });
}

// =====================
// Background Color Change Functions
// =====================

function changeBackgroundColor(color) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const scope = document.querySelector('input[name="bgColorScope"]:checked').value;

    if (scope === "body") {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (c) => {
          document.body.style.backgroundColor = c;
        },
        args: [color],
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (c) => {
          const sheet = document.styleSheets[0];
          sheet.insertRule("* { background-color: " + c + " !important; }", sheet.cssRules.length);
        },
        args: [color],
      });
    }
  });
}

function changeBackgroundWithReset(color) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const scope = document.querySelector('input[name="bgColorScope"]:checked').value;

    // First, reset all previously applied background styles
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          // Remove CSS rules inserted by this extension
          for (let i = document.styleSheets.length - 1; i >= 0; i--) {
            const sheet = document.styleSheets[i];
            try {
              const rules = sheet.cssRules || sheet.rules;
              if (!rules) continue;
              const indicesToRemove = [];
              for (let j = rules.length - 1; j >= 0; j--) {
                const rule = rules[j];
                if (rule.cssText && rule.cssText.startsWith("* { background-color:")) {
                  indicesToRemove.push(j);
                }
              }
              for (const index of indicesToRemove) {
                sheet.deleteRule(index);
              }
            } catch (e) {}
          }
          // Clear inline backgroundColor styles from all elements
          document.querySelectorAll("*").forEach((el) => {
            el.style.backgroundColor = "";
          });
        },
      },
      () => {
        // Then apply the new background based on scope
        setTimeout(() => {
          if (scope === "body") {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (c) => {
                document.body.style.backgroundColor = c;
              },
              args: [color],
            });
          } else {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (c) => {
                const sheet = document.styleSheets[0];
                sheet.insertRule("* { background-color: " + c + " !important; }", sheet.cssRules.length);
              },
              args: [color],
            });
          }
        }, 50);
      },
    );
  });
}

// =====================
// Font Color Change Functions
// =====================

function changeFontColor(color) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const scope = document.querySelector('input[name="fontColorScope"]:checked').value;

    if (scope === "body") {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (c) => {
          document.body.style.color = c;
        },
        args: [color],
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (c) => {
          const sheet = document.styleSheets[0];
          sheet.insertRule("* { color: " + c + " !important; }", sheet.cssRules.length);
        },
        args: [color],
      });
    }
  });
}

function changeFontColorWithReset(color) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const scope = document.querySelector('input[name="fontColorScope"]:checked').value;

    // First, reset all previously applied font styles
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          // Remove CSS rules inserted by this extension
          for (let i = document.styleSheets.length - 1; i >= 0; i--) {
            const sheet = document.styleSheets[i];
            try {
              const rules = sheet.cssRules || sheet.rules;
              if (!rules) continue;
              const indicesToRemove = [];
              for (let j = rules.length - 1; j >= 0; j--) {
                const rule = rules[j];
                if (rule.cssText && (rule.cssText.startsWith("* { color:") || rule.cssText.includes("font-color"))) {
                  indicesToRemove.push(j);
                }
              }
              for (const index of indicesToRemove) {
                sheet.deleteRule(index);
              }
            } catch (e) {}
          }
          // Clear inline color styles from all elements
          document.querySelectorAll("*").forEach((el) => {
            el.style.color = "";
          });
        },
      },
      () => {
        // Then apply the new font color based on scope
        setTimeout(() => {
          if (scope === "body") {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (c) => {
                document.body.style.color = c;
              },
              args: [color],
            });
          } else {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (c) => {
                const sheet = document.styleSheets[0];
                sheet.insertRule("* { color: " + c + " !important; }", sheet.cssRules.length);
              },
              args: [color],
            });
          }
        }, 50);
      },
    );
  });
}
