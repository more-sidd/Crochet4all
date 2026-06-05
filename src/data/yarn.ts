export interface YarnWeight {
  id: string; number: string; name: string; aka: string; hook: string; thickness: number; goodFor: string; examples: string;
}

export const WEIGHTS: YarnWeight[] = [
  { id: 'lace', number: '0', name: 'Lace', aka: 'Fingering 10-count, thread', hook: '1.5 – 2.25 mm (steel)', thickness: 1, goodFor: 'Doilies, delicate lace, fine shawls', examples: 'Crochet thread, cobweb' },
  { id: 'superfine', number: '1', name: 'Super Fine', aka: 'Sock, Fingering, Baby', hook: '2.25 – 3.5 mm', thickness: 2, goodFor: 'Socks, lightweight shawls, baby items', examples: 'Sock yarn' },
  { id: 'fine', number: '2', name: 'Fine', aka: 'Sport, Baby', hook: '3.5 – 4.5 mm', thickness: 3, goodFor: 'Light garments, soft accessories', examples: 'Sport weight' },
  { id: 'light', number: '3', name: 'Light', aka: 'DK, Light Worsted', hook: '4.5 – 5.5 mm', thickness: 4, goodFor: 'Garments, amigurumi, everyday projects', examples: 'DK weight' },
  { id: 'medium', number: '4', name: 'Medium', aka: 'Worsted, Aran, Afghan', hook: '5.5 – 6.5 mm', thickness: 5, goodFor: 'Blankets, hats, the best place to start', examples: 'Worsted weight — the classic' },
  { id: 'bulky', number: '5', name: 'Bulky', aka: 'Chunky, Craft, Rug', hook: '6.5 – 9 mm', thickness: 6, goodFor: 'Quick scarves, cozy blankets, winter wear', examples: 'Chunky yarn' },
  { id: 'superbulky', number: '6', name: 'Super Bulky', aka: 'Super Chunky, Roving', hook: '9 – 15 mm', thickness: 7, goodFor: 'Fast, squishy throws and big stitches', examples: 'Super chunky' },
  { id: 'jumbo', number: '7', name: 'Jumbo', aka: 'Roving, Giant', hook: '15 mm and up', thickness: 8, goodFor: 'Arm crochet, giant blankets, statement pieces', examples: 'Giant roving' },
];

export interface Fiber { id: string; name: string; feel: string; pros: string; cons: string; bestFor: string; }

export const FIBERS: Fiber[] = [
  { id: 'acrylic', name: 'Acrylic', feel: 'Soft, springy, lightweight', pros: 'Cheap, machine-washable, huge color range, very forgiving', cons: 'Can feel a little squeaky; not very breathable', bestFor: 'Beginners, blankets, amigurumi, kids items' },
  { id: 'cotton', name: 'Cotton', feel: 'Smooth, cool, sturdy with no stretch', pros: 'Strong, holds shape, crisp stitch definition, breathable', cons: 'Less forgiving for beginners; can be hard on the hands', bestFor: 'Amigurumi, dishcloths, bags, summer wear' },
  { id: 'wool', name: 'Wool', feel: 'Warm, stretchy, slightly fuzzy', pros: 'Cozy, elastic and forgiving, blocks beautifully', cons: 'Can itch; may shrink or felt if washed wrong', bestFor: 'Hats, sweaters, winter accessories' },
  { id: 'cottonblend', name: 'Cotton / Bamboo blends', feel: 'Silky, drapey, gentle sheen', pros: 'Soft against skin, lovely drape, breathable', cons: 'Can be splitty; a bit pricier', bestFor: 'Wearables, shawls, baby items' },
  { id: 'woolblend', name: 'Wool blends', feel: 'Warm but lighter than pure wool', pros: 'Warmth of wool with easier care; often less itchy', cons: 'Varies a lot by blend — check the label', bestFor: 'Everyday garments and accessories' },
  { id: 'chenille', name: 'Chenille / Velvet', feel: 'Plush, fuzzy, super soft', pros: 'Irresistibly soft, great for stuffed toys', cons: 'Shows "worming" (twisting) and can be tricky to work', bestFor: 'Plushies, cozy pillows, baby blankets' },
];

export const LABEL_TIPS: { term: string; meaning: string }[] = [
  { term: 'Weight symbol', meaning: 'A little yarn-skein icon with a number 0–7 — that\'s the thickness category above.' },
  { term: 'Recommended hook', meaning: 'A hook icon with a size (e.g. 5.0 mm / H-8). A great starting point, but your own tension may vary.' },
  { term: 'Gauge', meaning: 'How many stitches and rows fit in a 4-inch (10 cm) square. Match it when a pattern needs an exact size.' },
  { term: 'Yardage & weight', meaning: 'How much yarn is in the ball (e.g. 170 g / 364 yds). Use it to estimate how many balls a project needs.' },
  { term: 'Dye lot', meaning: 'A batch number. Buy enough of the same dye lot so colors match across a project.' },
  { term: 'Care symbols', meaning: 'Washing/drying icons. Acrylic is usually machine-safe; wool often needs hand-washing.' },
];