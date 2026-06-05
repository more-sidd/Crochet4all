export interface Stitch {
  id: string;
  name: string;
  abbr: string;
  difficulty: 1 | 2 | 3;
  blurb: string;
  steps: string[];
}

// Beginner-friendly ladder of the core stitches, ordered roughly easiest -> hardest.
export const STITCHES: Stitch[] = [
  {
    id: 'ch',
    name: 'Chain',
    abbr: 'ch',
    difficulty: 1,
    blurb: 'The foundation of almost everything. A row of loops you build on top of.',
    steps: [
      'Make a slip knot on your hook.',
      'Yarn over (wrap the yarn over the hook).',
      'Pull the yarn through the loop on your hook.',
      'Repeat to make as many chains as your pattern calls for.',
    ],
  },
  {
    id: 'sl',
    name: 'Slip Stitch',
    abbr: 'sl st',
    difficulty: 1,
    blurb: 'The flattest stitch. Used to join, move along a row, or finish edges.',
    steps: [
      'Insert your hook into the next stitch.',
      'Yarn over.',
      'Pull the yarn through both the stitch and the loop on your hook in one motion.',
    ],
  },
  {
    id: 'sc',
    name: 'Single Crochet',
    abbr: 'sc',
    difficulty: 1,
    blurb: 'Short, sturdy, and dense. The workhorse stitch for amigurumi and solid fabric.',
    steps: [
      'Insert your hook into the next stitch.',
      'Yarn over and pull up a loop (2 loops on hook).',
      'Yarn over and pull through both loops.',
    ],
  },
  {
    id: 'hdc',
    name: 'Half Double Crochet',
    abbr: 'hdc',
    difficulty: 2,
    blurb: 'A touch taller than single crochet, with a soft, squishy texture.',
    steps: [
      'Yarn over first, then insert your hook into the next stitch.',
      'Yarn over and pull up a loop (3 loops on hook).',
      'Yarn over and pull through all 3 loops at once.',
    ],
  },
  {
    id: 'dc',
    name: 'Double Crochet',
    abbr: 'dc',
    difficulty: 2,
    blurb: 'Tall and quick to work up. Creates a more open, drapey fabric.',
    steps: [
      'Yarn over, then insert your hook into the next stitch.',
      'Yarn over and pull up a loop (3 loops on hook).',
      'Yarn over and pull through the first 2 loops (2 loops left).',
      'Yarn over and pull through the last 2 loops.',
    ],
  },
  {
    id: 'tr',
    name: 'Treble Crochet',
    abbr: 'tr',
    difficulty: 3,
    blurb: 'Extra tall and lacy. Great for dramatic, airy stitch patterns.',
    steps: [
      'Yarn over twice, then insert your hook into the next stitch.',
      'Yarn over and pull up a loop (4 loops on hook).',
      'Yarn over and pull through 2 loops (3 left).',
      'Yarn over and pull through 2 loops (2 left).',
      'Yarn over and pull through the last 2 loops.',
    ],
  },
  {
    id: 'dtr',
    name: 'Double Treble',
    abbr: 'dtr',
    difficulty: 3,
    blurb: 'The tallest of the common stitches. Yarn over three times to begin.',
    steps: [
      'Yarn over three times, then insert your hook into the next stitch.',
      'Yarn over and pull up a loop (5 loops on hook).',
      'Yarn over and pull through 2 loops, four times in a row.',
    ],
  },
  {
    id: 'mr',
    name: 'Magic Ring',
    abbr: 'mr',
    difficulty: 2,
    blurb: 'An adjustable loop you crochet into, then cinch shut. The start of most amigurumi.',
    steps: [
      'Wrap the yarn around two fingers to form a loop, tail behind.',
      'Insert your hook, pull up a loop, and chain 1 to secure.',
      'Work your first round of stitches into the ring.',
      'Pull the tail tight to close the centre hole.',
    ],
  },
  {
    id: 'inc',
    name: 'Increase',
    abbr: 'inc',
    difficulty: 1,
    blurb: 'Two stitches worked into the same stitch — makes your work grow wider.',
    steps: [
      'Work one stitch as usual into the next stitch.',
      'Work a second stitch into the very same stitch.',
      'You now have two stitches where there was one.',
    ],
  },
  {
    id: 'dec',
    name: 'Decrease',
    abbr: 'dec',
    difficulty: 2,
    blurb: 'Two stitches joined into one — makes your work narrower. Often written "sc2tog".',
    steps: [
      'Insert your hook and pull up a loop in the next stitch (2 loops on hook).',
      'Insert your hook and pull up a loop in the following stitch (3 loops on hook).',
      'Yarn over and pull through all 3 loops to join them into one.',
    ],
  },
  {
    id: 'vst',
    name: 'V-Stitch',
    abbr: 'v-st',
    difficulty: 2,
    blurb: 'A double crochet, chain, double crochet worked into one stitch — forms an airy "V".',
    steps: [
      'Work a double crochet into the stitch.',
      'Chain 1.',
      'Work another double crochet into the same stitch.',
    ],
  },
  {
    id: 'pop',
    name: 'Popcorn',
    abbr: 'pc',
    difficulty: 3,
    blurb: 'Several tall stitches in one spot, gathered at the top into a little raised bobble.',
    steps: [
      'Work 5 double crochet into the same stitch.',
      'Slip the loop off your hook.',
      'Insert the hook into the first dc, grab the dropped loop, and pull it through to cinch the bump.',
    ],
  },
];
