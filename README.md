# The Little Herb Garden

A small, responsive herb garden website. The page reads each herb from its own JSON file and uses the URL hash to show that herb, for example `index.html#basil` or `index.html#thyme`.

## Run locally

The site uses `fetch()` to load JSON, so open it through a web server instead of double-clicking `index.html`:

```sh
npx serve
```

Open the local address printed by the command. Search the herb list by name, Latin name, use, or growing cycle; select a herb to open its detail view.

## Herb data format

Every file in `data/` uses the same JSON object shape:

```json
{
  "name": "Basil",
  "latin": "Ocimum basilicum",
  "use": "Tomatoes, pesto and anything summery.",
  "life": "annual"
}
```

- `name`: the common name shown on the page.
- `latin`: the scientific name.
- `use`: a short description of culinary or garden uses.
- `life`: the growing cycle, either `annual` or `perennial`.

The filename (without `.json`) is the URL hash and must be lowercase, such as `data/basil.json` for `#basil` or `data/mint.json` for `#mint`. Add new filenames to the herb list in `app.js` so they appear in the directory and search.

## Publish with GitHub Pages

In the repository settings, open **Pages**, choose **Deploy from a branch**, then select the `main` branch and the repository root (`/`). GitHub Pages serves this static site and its `data/` files directly. Push the branch to GitHub to publish changes.

## Team Members and Roles

This project was developed by a team of 3. The team members and their main contributions to the project are listed below:

* **BATUHAN ATA DENIZ (Student 1) - JavaScript & Interaction:** Handled the application's core logic, DOM manipulation, and event listeners (`app.js`).
* **BATIKAN FALAY (Student 2) - Frontend Structure & Design:** Responsible for the project's user interface (`index.html`) and page styling (`style.css`).
* **ATAKAN AYDOGAR (Student 3) - Data Management & Documentation:** Managed the structuring of plant data (JSON files in the `data/` folder), integration of visual assets, and project documentation (README).
