// ONE PLACE TO EDIT shared copy: user needs, weights, evidence tags, product list.
// Product-specific numbers and assumptions live at the top of each js/chapters/*.js file.

export const NEEDS = [
  // id, short name, weight from our pairwise comparison (share of 100)
  { id: 'A', name: 'Buying-path fit',          w: 19.4 },
  { id: 'B', name: 'Reliable performance',     w: 22.2 },
  { id: 'C', name: 'Cost-in-use value',        w: 13.9 },
  { id: 'D', name: 'Convenient supply',        w: 11.1 },
  { id: 'E', name: 'Training & staff support', w: 5.6  },
  { id: 'F', name: 'Distributor rep support',  w: 8.3  },
  { id: 'G', name: 'Right offer per segment',  w: 16.7 },
  { id: 'H', name: 'Visible value to buyer',   w: 2.8  },
];

// Evidence tags shown as pills. Keep every claim honest: tag it.
export const TAGS = {
  stated:  { label: 'STATED ALOUD',   hint: 'Said by a host or operator during our visits. One source, not verified.' },
  public:  { label: 'PUBLIC SOURCE',  hint: 'From a public, linkable source.' },
  assume:  { label: 'ASSUMPTION',     hint: 'Our placeholder. Edit it in Customize. Replace with real data.' },
  illus:   { label: 'ILLUSTRATION',   hint: 'A picture of the idea. Not a test result.' },
  open:    { label: 'OPEN QUESTION',  hint: 'We do not know yet. Needs P&G data or a customer call.' },
};

// Draft scorecard ratings 1-5 per need (A..H) + feasibility. MY DRAFT. TEAM TO SET.
export const PRODUCTS = [
  { slug: 'evo',                  name: 'Evo for the small laundry',  line: 'A detergent tile for operators with no dosing pump.',               r: [3,3,2,5,5,2,4,2], f: 2, filter: ['New to PRO'] },
  { slug: 'stain-at-source',      name: 'Stain at the source',         line: 'Treat the stain at the bed, not after it has set in the wash.',    r: [3,4,4,3,3,2,4,5], f: 4, filter: ['Lean', 'Builds on existing'] },
  { slug: 'power-wash-station',   name: 'Power Wash station',          line: 'A retail pre-treat reborn as a kitchen workflow.',                 r: [4,4,3,4,5,3,4,4], f: 5, filter: ['Lean', 'Builds on existing'] },
  { slug: 'towel-autopsy',        name: 'Towel autopsy',               line: 'Find the soils towels carry that no detergent was built for.',    r: [2,4,3,2,2,2,5,3], f: 2, filter: ['New to PRO'] },
  { slug: 'chemistry-at-install', name: 'Chemistry at the install',    line: 'Be in the room when the machine arrives.',                         r: [5,3,3,4,2,3,3,3], f: 3, filter: ['Builds on existing'] },
];
export const WEIGHT_FEAS = 20; // % of total score given to feasibility (needs share the other 80%)
