document.getElementById("colorPicker").addEventListener("input", event => {
  changeBackground(event.target.value)
})

document.getElementById("color1").addEventListener("click", () => {
  changeBackground("#FFFBEB")
})

document.getElementById("color2").addEventListener("click", () => {
  changeBackground("#D9D9D9")
})

document.getElementById("color3").addEventListener("click", () => {
  changeBackground("#292929")
})

function changeBackground(color) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: changeBackgroundColor,
      args: [color],
    })
  })
}

function changeBackgroundColor(color) {
  document.body.style.backgroundColor = color
}
