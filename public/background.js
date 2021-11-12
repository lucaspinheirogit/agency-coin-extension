const urls = ['*://*.facebook.com/', '*://*.twitter.com/', '*://*.youtube.com/', '*://*.instagram.com/']
const STORAGE = chrome.storage.local
let active = {}

async function updateStorage(active, seconds) {
  const currentDate = new Date().toISOString().substr(0, 10)
  const data = await getFromStorage(currentDate)
  const currentHost = data[active.name]

  const newTime = currentHost ? (currentHost.time += seconds) : seconds
  const newHost = {
    [active.name]: {
      ...active,
      time: newTime,
    },
  }

  const newData = {
    ...data,
    ...newHost,
  }

  console.log(newData)

  saveToStorage(currentDate, newData)
}

function saveToStorage(key, value) {
  return new Promise((resolve) => {
    STORAGE.set({ [key]: value }, () => {
      resolve()
    })
  })
}

function getFromStorage(key) {
  return new Promise((resolve) => {
    STORAGE.get(key, (result) => (result[key] ? resolve(result[key]) : resolve({})))
  })
}

function end() {
  if (active.name) {
    const timeDiff = parseInt((Date.now() - active.time) / 1000)

    updateStorage(active, timeDiff)
    active = {}
  }
}

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (activeTab) => {
        resolve(activeTab[0])
      },
    )
  })
}

async function setActive() {
  const activeTab = await getActiveTab()

  if (activeTab) {
    // check if the tab's url is among the arrays of url
    const { url } = activeTab
    let host = new URL(url).hostname
    host = host.replace('www.', '').replace('.com', '')

    if (urls.some((each) => each.includes(host))) {
      if (active.name !== host) {
        end()

        active = {
          name: host,
          faviconUrl: activeTab.favIconUrl,
          time: Date.now(),
        }
      }
    }
  }
}

function tabOnActivated() {
  if (active.name) end()

  setActive() // check to see if the active tab is among the sites being tracked
}

function tabOnFocusChanged(window) {
  if (window === -1) end()
  // browser lost focus
  else setActive()
}

chrome.tabs.onUpdated.addListener(setActive)
chrome.tabs.onActivated.addListener(tabOnActivated)
chrome.windows.onFocusChanged.addListener(tabOnFocusChanged)
