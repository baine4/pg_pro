P&G PRO CAPSTONE CONCEPTS - interactive site
=============================================
Five concept pages + a scorecard. Plain files, no build step. Desktop only.
Label on every page: "Capstone concept, not a P&G product". No P&G logo, no tour photos, no names.

WHAT'S IN IT
  index.html                    hub (scroll through the five ideas)
  evo/                          Evo for the small laundry
  stain-at-source/              The 11 a.m. checkout
  power-wash-station/           The Power Wash station
  towel-autopsy/                Towel autopsy
  chemistry-at-install/         Chemistry at the install
  scorecard/                    live scoring of all five against the 8 user needs

PUT IT ON GITHUB
  1. New private repo. Upload the CONTENTS of this folder (index.html at the top level, plus .nojekyll).
     If the web uploader skips .nojekyll, it is optional for this site.
  2. Settings > Pages > Deploy from branch > main / root.
     NOTE: Pages from a PRIVATE repo needs a paid GitHub plan (Pro/Team). Without one, use the local option.
  3. Each idea is then at yoursite/evo/, yoursite/towel-autopsy/, etc.

RUN LOCALLY (works offline, best for presenting)
  In this folder:  python3 -m http.server 8000     then open http://localhost:8000
  (Double-clicking index.html will NOT work: browsers block modules from file://.)

HOW TO CUSTOMIZE
  On any page: click Customize (or press C). Sliders change the numbers and the 3D live.
  "Toggle text edit" lets you click and rewrite headlines. Saved in YOUR browser only.
  To change defaults for everyone, edit the files:
    js/data.js                  user needs + weights, evidence tags, scorecard draft ratings
    js/chapters/<idea>.js       top of file: controls (defaults), scenes (copy), logic page
  Keys: Space/arrows = next scene, C = customize, Home = restart.

HONESTY RULES BUILT IN
  Pills on every claim: STATED ALOUD / PUBLIC SOURCE / ASSUMPTION / ILLUSTRATION / OPEN QUESTION.
  Dollar figures other than evo's ~48c/load (public) are placeholders. Replace them with real quotes.
  Demos are illustrations, not test results. Scorecard ratings are a first draft for the team to set.
