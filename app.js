const herbSlugs = [
  "basil",
  "mint",
  "rosemary",
  "thyme",
  "lavender",
  "sage",
  "chamomile",
  "chives"
]

const sectionSlugs = new Set(["herbs", "visit", "about"])
const herbCache = new Map()
const herbsSection = document.querySelector("#herbs")
const directory = document.querySelector("#herb-directory")
const list = document.querySelector("#herbs-list")
const count = document.querySelector("#directory-count")
const directoryStatus = document.querySelector("#directory-status")
const search = document.querySelector("#herb-search")
const detail = document.querySelector("#herb-detail")
const detailName = document.querySelector("#herb-detail-name")
const detailLatin = document.querySelector("#herb-detail-latin")
const detailUse = document.querySelector("#herb-detail-use")
const detailLife = document.querySelector("#herb-detail-life")
const herbMessage = document.querySelector("#herb-message")

let catalogPromise
let routeVersion = 0

function element(tag, className, text) {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text
  return node
}

function isHerb(value) {
  return value &&
    typeof value.name === "string" &&
    typeof value.latin === "string" &&
    typeof value.use === "string" &&
    ["annual", "perennial"].includes(value.life)
}

async function loadHerb(slug) {
  if (herbCache.has(slug)) return herbCache.get(slug)

  const response = await fetch(`data/${slug}.json`)
  if (!response.ok) {
    const error = new Error(`The server returned ${response.status}.`)
    error.status = response.status
    throw error
  }

  const herb = await response.json()
  if (!isHerb(herb)) throw new Error("The herb data is missing a required field.")

  herbCache.set(slug, herb)
  return herb
}

function card(herb, slug) {
  const item = element("li", "card", "")
  const heading = element("h3", "name", "")
  const link = element("a", "herb-link", herb.name)
  link.href = `#${slug}`
  heading.append(link)
  item.append(
    heading,
    element("p", "latin", herb.latin),
    element("p", "use", herb.use),
    element("p", "life", herb.life)
  )
  return item
}

function applySearch() {
  const query = search.value.trim().toLocaleLowerCase()
  let visibleCount = 0

  for (const item of list.children) {
    const matches = item.textContent.toLocaleLowerCase().includes(query)
    item.hidden = !matches
    if (matches) visibleCount += 1
  }

  count.textContent = `${visibleCount} ${visibleCount === 1 ? "herb" : "herbs"} shown.`
}

async function loadCatalog() {
  if (catalogPromise) return catalogPromise

  count.textContent = "Loading herbs…"
  catalogPromise = Promise.allSettled(herbSlugs.map(async (slug) => ({
    slug,
    herb: await loadHerb(slug)
  }))).then((results) => {
    const loaded = []
    const failed = []

    for (const [index, result] of results.entries()) {
      if (result.status === "fulfilled") loaded.push(result.value)
      else failed.push(herbSlugs[index])
    }

    list.replaceChildren(...loaded.map(({ slug, herb }) => card(herb, slug)))
    applySearch()

    if (failed.length === 0) {
      directoryStatus.textContent = ""
    } else if (window.location.protocol === "file:") {
      directoryStatus.textContent = "Herb data needs a web server. Run npx serve in this folder and open its local address."
    } else if (loaded.length === 0) {
      directoryStatus.textContent = "The herb data could not be loaded. Check that the site is being served and try again."
    } else {
      directoryStatus.textContent = `Some herb files could not be loaded: ${failed.map((slug) => `data/${slug}.json`).join(", ")}.`
    }
  })

  return catalogPromise
}

function showDirectory(message = "") {
  directory.hidden = false
  detail.hidden = true
  herbMessage.textContent = message
  document.title = "Herbs | The Little Herb Garden"
  void loadCatalog()
}

function describeLoadError(slug, error) {
  if (error.status === 404) {
    return `The data file for ${slug} could not be found (404). Please try another herb.`
  }
  if (window.location.protocol === "file:") {
    return "Herb data cannot be loaded from a file. Run npx serve in this folder and open its local address."
  }
  return `The data for ${slug} could not be loaded. Check your connection and try again.`
}

async function showHerb(slug, version) {
  directory.hidden = true
  detail.hidden = false
  herbMessage.textContent = "Loading herb details…"
  detailName.textContent = ""
  detailLatin.textContent = ""
  detailUse.textContent = ""
  detailLife.textContent = ""

  try {
    const herb = await loadHerb(slug)
    if (version !== routeVersion) return

    detailName.textContent = herb.name
    detailLatin.textContent = herb.latin
    detailUse.textContent = herb.use
    detailLife.textContent = herb.life
    herbMessage.textContent = ""
    document.title = `${herb.name} | The Little Herb Garden`
    herbsSection.scrollIntoView()
  } catch (error) {
    if (version !== routeVersion) return
    herbMessage.textContent = describeLoadError(slug, error)
  }
}

function routeFromHash() {
  const version = ++routeVersion
  let slug = window.location.hash.slice(1)

  try {
    slug = decodeURIComponent(slug)
  } catch {
    // Keep the raw hash so malformed or unknown values receive a safe message.
  }

  slug = slug.toLowerCase()

  if (!slug || sectionSlugs.has(slug)) {
    showDirectory()
  } else if (herbSlugs.includes(slug)) {
    void showHerb(slug, version)
  } else {
    showDirectory(`We couldn't find a herb named “${slug}”. Choose a herb from the list below.`)
  }
}

search.addEventListener("input", applySearch)
window.addEventListener("hashchange", routeFromHash)
routeFromHash()
