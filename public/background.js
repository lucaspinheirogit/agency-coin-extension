const AGENCY_DECREASING_URLS = [
  '*://*.facebook.com/',
  '*://*.twitter.com/',
  '*://*.youtube.com/',
  '*://*.instagram.com/',
]
const EXCLUDED_URLS = ['chrome://']
const STORAGE = chrome.storage.local
const BASE_URL = 'https://www.theagencycoin.com/api'

let active = {}

async function postBalance(amount = 0) {
  const body = {
    wallet: '0x036dB8d2eacF572876247236D766A3A706Bd33cA',
    amount: String(amount * 10e18),
  }

  const response = await fetch(`${BASE_URL}/balance`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  console.log('status:', response.status)
}

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
  const balanceToChange = currentHost?.agencyDecreasing ? -seconds : seconds

  const newData = {
    ...data,
    ...newHost,
  }

  console.log(`${currentHost?.name} - decreasing: ${currentHost?.agencyDecreasing}`)
  console.log(balanceToChange)

  saveToStorage(currentDate, newData)
  postBalance(balanceToChange)
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
    let agencyDecreasing = false
    const includesAgencyDecreasingHost = AGENCY_DECREASING_URLS.some((each) => each.includes(host))
    const includesExcludedHost = EXCLUDED_URLS.some((each) => url.includes(each))

    if (includesExcludedHost) return
    if (includesAgencyDecreasingHost) agencyDecreasing = true

    if (active.name !== host) {
      end()

      active = {
        name: host,
        faviconUrl: activeTab.favIconUrl,
        time: Date.now(),
        agencyDecreasing,
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
