document.getElementById("colorPicker").addEventListener("input", (event) => {
  changeBackground(event.target.value);
});

const colors = ["#fffaec", "#f8f3e7", "#d9d9d9", "#bdbdbd"];

for (var i = 0; i < 4; i++) {
  let ele = document.getElementById(`color${i}`);
  let color = colors[i];
  ele.addEventListener("click", () => {
    changeBackground(color);
  });
  ele.style.backgroundColor = color;
}

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

function changeAllElementsBackgroundColor(color) {
  const sheet = window.document.styleSheets[0];
  sheet.insertRule("* { background-color: " + color + " !important; }", sheet.cssRules.length);
}
