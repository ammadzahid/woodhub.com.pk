export interface GuideSection {
  h: string;
  p: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  keywords: string[];
  readMinutes: number;
  published: string;
  updated: string;
  cover: string;
  intro: string;
  sections: GuideSection[];
  faq: { q: string; a: string }[];
  related: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'how-to-choose-wood',
    title: 'Sheesham, walnut, acacia or mango — which wood should you actually buy?',
    metaTitle: 'Sheesham vs Walnut vs Acacia vs Mango Wood — Which to Buy in Pakistan',
    description:
      'A plain comparison of the four hardwoods used for home decor in Pakistan: how each one looks, what it costs, how it handles humidity, and which room it belongs in.',
    keywords: [
      'sheesham vs walnut wood',
      'best wood for furniture in Pakistan',
      'acacia wood chopping board safe',
      'mango wood durability',
      'which wood for wall shelf',
    ],
    readMinutes: 7,
    published: '2026-02-14',
    updated: '2026-07-12',
    cover: '/products/walnut-chopping-board.jpg',
    intro:
      'Four woods cover almost everything sold as "wooden decor" in Pakistan. They are not interchangeable, and the shop will rarely tell you which one you are holding. Here is how to tell them apart and where each one belongs.',
    sections: [
      {
        h: 'Sheesham — the dense one',
        p: [
          'Sheesham, or Indian rosewood, is the default hardwood of Pakistani furniture for a reason. It is dense, closes tight around a screw, and takes fine carving without the edges crumbling. That density is why a carved mandala or a jali panel is almost always sheesham — softer woods chip out at the fine cuts.',
          'It runs reddish-brown with dark streaks, and it darkens further over the first year. If you want a piece to look older than it is, sheesham gets you there fastest.',
        ],
        list: [
          'Best for: carved wall art, shelves that carry weight, lamp bases, name plates',
          'Watch for: weight — a large sheesham panel needs a proper wall anchor, not a nail',
          'Price: the highest of the four, roughly 30–50% above mango wood for the same size',
        ],
      },
      {
        h: 'Walnut — the dark, fine-grained one',
        p: [
          'Walnut is closer-grained than sheesham and reads much darker once oiled — a deep chocolate brown rather than red. It is the one to pick when the piece sits against a light wall and you want contrast without going black.',
          'It is also kinder to knife edges than sheesham, which is why good chopping boards are walnut more often than not.',
        ],
        list: [
          'Best for: chopping boards, desk accessories, photo frames, clocks',
          'Watch for: real walnut is expensive — very cheap "walnut" is usually stained rubber wood',
          'Price: similar to sheesham, sometimes higher for wide boards',
        ],
      },
      {
        h: 'Acacia — the one that handles water',
        p: [
          'Acacia is hard, naturally water-tolerant and food-safe once oiled. That combination is why it dominates kitchen products: serving boards, platters, trays, spoons. It shrugs off a wash in a way mango wood does not.',
          'The grain is busy and varied, with pale sapwood running against darker heartwood. Some people love that; if you want a calm, even surface, acacia is not it.',
        ],
        list: [
          'Best for: anything that touches food or water',
          'Watch for: needs re-oiling roughly monthly if it is in daily use',
          'Price: mid-range, and the best value of the four for kitchen items',
        ],
      },
      {
        h: 'Mango wood — the light, affordable one',
        p: [
          'Mango wood is a by-product of fruit farming, which keeps it cheap and makes it the most sustainable of the four. It is lighter in both colour and weight, and open-grained enough that whitewash and wax sit visibly in the surface rather than just coating it.',
          'It is softer, so it dents more easily. On a wall that does not matter. On a floor-standing piece that gets knocked, it does.',
        ],
        list: [
          'Best for: wall pieces, hexagon shelves, lamp shades, whitewashed and boho finishes',
          'Watch for: dents from impact, and warping if it stays damp',
          'Price: the most affordable, often half the cost of sheesham',
        ],
      },
      {
        h: 'What humidity does to all four',
        p: [
          'Pakistan swings from dry winters to monsoon humidity, and wood moves with it. Every solid wood piece expands slightly in July and contracts in January. This is normal and is not a defect.',
          'What you can control is where it sits. Keep solid wood off exterior walls that sweat, out of direct afternoon sun, and away from an air conditioner blowing straight at it. A piece that lives in a stable spot will outlast one that does not, regardless of which wood it is.',
        ],
      },
      {
        h: 'Finish matters as much as species',
        p: [
          'An oiled finish lets you feel the grain and can be repaired at home — you re-oil it and the scratch disappears. A thick lacquer hides everything, cannot be spot-repaired, and eventually yellows.',
          'Matte lacquer sits in between: durable, wipe-clean, and honest about the texture underneath. For anything you touch daily, oil. For a wall piece you only dust, matte lacquer is the lower-maintenance choice.',
        ],
      },
    ],
    faq: [
      {
        q: 'Which wood is best for a wall shelf in Pakistan?',
        a: 'Sheesham if the shelf will carry books or heavy decor, because it holds screws tightly and resists sagging. Mango wood is fine for lighter display shelves and costs noticeably less.',
      },
      {
        q: 'Is acacia wood safe for chopping boards?',
        a: 'Yes. Acacia is food-safe once finished with food-grade mineral oil, and it is naturally water-tolerant, which is why it is one of the most common woods for serving and chopping boards worldwide.',
      },
      {
        q: 'How can I tell real sheesham from stained rubber wood?',
        a: 'Look at the end grain and the weight. Sheesham is heavy for its size and shows dark irregular streaks running through the grain. Stained rubber wood is light, evenly coloured, and the colour stops abruptly at the edges.',
      },
      {
        q: 'Does solid wood furniture crack in Pakistani weather?',
        a: 'Properly seasoned wood moves but does not crack. Cracking usually means the wood was not dried before it was cut, or the piece sits in direct sun or against a damp exterior wall.',
      },
    ],
    related: ['how-to-hang-a-wall-shelf', 'caring-for-wooden-boards'],
  },

  {
    slug: 'how-to-hang-a-wall-shelf',
    title: 'How to hang a wooden shelf on a Pakistani wall without it falling off',
    metaTitle: 'How to Hang a Wooden Wall Shelf on Brick or Concrete — Step by Step',
    description:
      'Which anchor to use on brick, concrete block and drywall, what drill bit size to pick, how to find the right height, and the mistakes that make shelves sag or pull out.',
    keywords: [
      'how to hang a wooden shelf',
      'wall anchor for brick wall Pakistan',
      'floating shelf installation guide',
      'what drill bit for wall plug',
    ],
    readMinutes: 6,
    published: '2026-03-08',
    updated: '2026-06-30',
    cover: '/products/floating-wall-shelf-duo.jpg',
    intro:
      'Most shelves that fall did not fail because the shelf was weak. They failed because the anchor was wrong for the wall. Five minutes of checking saves you a hole in the plaster and a broken vase.',
    sections: [
      {
        h: 'First, work out what your wall is made of',
        p: [
          'Tap it. A solid, dull thud with no echo is brick or concrete. A hollow, drum-like sound is drywall or a partition. Older houses in Lahore and Karachi are usually solid brick with a plaster skim; newer apartments increasingly use block or partition walls.',
          'If you drill a test hole, the dust tells you too: red dust is brick, grey is concrete, white and powdery is plaster over drywall.',
        ],
      },
      {
        h: 'Match the anchor to the wall',
        p: [
          'This is the whole game. The right anchor in the wrong wall is still the wrong anchor.',
        ],
        list: [
          'Brick or concrete: plastic wall plug with a masonry bit, or a sleeve anchor for anything over 15 kg',
          'Concrete block (hollow): a toggle or butterfly anchor, never a plain plastic plug — it will pull straight out',
          'Drywall or partition: a self-drilling drywall anchor for light loads, a metal toggle for anything heavier',
          'Never: a plain nail, or a screw driven into plaster with no plug behind it',
        ],
      },
      {
        h: 'Drill bit size, simply',
        p: [
          'Use a bit the same diameter as the plastic plug, not the screw. A 6 mm plug takes a 6 mm bit. If the plug pushes in with light thumb pressure, the hole is right. If you have to hammer it hard, the hole is too small and you will crack the plaster. If it drops in loosely, the hole is too big — move over 5 cm and start again.',
          'Drill on hammer mode for brick and concrete, and switch hammer off for drywall or you will blow a crater in it.',
        ],
      },
      {
        h: 'Getting the height right',
        p: [
          'Above a sofa, the bottom of the shelf sits about 25 to 30 cm above the backrest — close enough to read as one group, far enough that heads do not hit it.',
          'Above a desk, 45 to 55 cm above the desktop keeps the shelf reachable while seated. For a standalone display wall, the middle of the arrangement at eye level, around 150 cm from the floor, is the standard gallery height.',
        ],
      },
      {
        h: 'Mark, level, then drill',
        p: [
          'Hold the shelf against the wall at the height you want and mark the screw positions with a pencil. If your shelf came with a paper template, tape it up and use that instead — it is the difference between one drill hole and three.',
          'Check level before you drill, not after. A phone spirit level app is accurate enough for a shelf. Drill both holes, insert plugs, then hang.',
        ],
      },
      {
        h: 'Load it correctly',
        p: [
          'Weight belongs near the brackets, not floating in the middle of the span. A shelf rated for 12 kg means 12 kg spread across it, not 12 kg sitting dead centre.',
          'Give it a firm downward pull with your hand before you load it. If there is any give at all, take it down and redo the fixing. A shelf that moves under your hand will move under a row of books.',
        ],
      },
    ],
    faq: [
      {
        q: 'What anchor do I need for a brick wall?',
        a: 'A plastic wall plug with a masonry drill bit handles most shelves on solid brick. For anything over roughly 15 kg, use a sleeve or expansion anchor instead.',
      },
      {
        q: 'Can I hang a wooden shelf without drilling?',
        a: 'Only for very light pieces. Heavy-duty adhesive strips top out around 3 to 4 kg and fail on textured or freshly painted walls. Anything holding books needs a drilled fixing.',
      },
      {
        q: 'How high should a shelf go above a sofa?',
        a: 'About 25 to 30 cm above the top of the backrest. Closer and it feels cramped, further and the shelf stops reading as part of the seating arrangement.',
      },
      {
        q: 'Do WoodHub shelves come with the fixings?',
        a: 'Yes. Every shelf ships with the correct anchors and screws, and the multi-piece sets include a full-size paper drilling template.',
      },
    ],
    related: ['how-to-choose-wood', 'caring-for-wooden-boards'],
  },

  {
    slug: 'caring-for-wooden-boards',
    title: 'How to look after a wooden chopping board so it lasts ten years',
    metaTitle: 'How to Oil and Care for a Wooden Chopping Board — Simple Guide',
    description:
      'How often to oil a wooden board, which oil to use, why it must never go in the dishwasher, and how to fix a board that has gone grey, rough or smelly.',
    keywords: [
      'how to oil a wooden chopping board',
      'wooden board care',
      'mineral oil for chopping board Pakistan',
      'how to clean wooden serving tray',
    ],
    readMinutes: 5,
    published: '2026-04-22',
    updated: '2026-07-05',
    cover: '/products/acacia-charcuterie-board.jpg',
    intro:
      'A wooden board that is looked after outlasts every plastic one you will ever buy. A neglected one warps, cracks and starts to smell within a year. The difference is about ten minutes a month.',
    sections: [
      {
        h: 'Wash it right, immediately',
        p: [
          'Hot water, a little dish soap, a sponge, and dry it straight away with a towel. That is the whole method. What matters is the timing — a board left wet in the sink absorbs water unevenly and warps as it dries.',
          'Stand it on edge to finish drying so air reaches both faces. A board dried flat on a counter dries on one side only, and that is the fastest way to make it cup.',
        ],
      },
      {
        h: 'Never the dishwasher, never soaking',
        p: [
          'A dishwasher combines prolonged soaking with high heat, which is precisely the combination that splits a wooden board along its glue lines or its grain. One cycle can ruin a board permanently.',
          'The same applies to leaving it soaking in the sink "to loosen things up". Scrub it instead.',
        ],
      },
      {
        h: 'Oil it monthly',
        p: [
          'Use food-grade mineral oil. It is cheap, available at any pharmacy in Pakistan, and it does not go rancid. Pour a little on, spread it with a cloth or your hand, and leave it for a few hours or overnight. Wipe off whatever has not soaked in.',
          'Do not use cooking oils — olive, sunflower, mustard. They turn rancid inside the wood and the board starts to smell within weeks. That smell cannot be washed out.',
        ],
        list: [
          'New board: oil it once a week for the first month',
          'In daily use: once a month',
          'Occasional use: every two or three months',
          'When it looks pale, dry or chalky: oil it now, regardless of schedule',
        ],
      },
      {
        h: 'Fixing a board that has gone rough or grey',
        p: [
          'Sand it. Start at 120 grit to take the roughness down, then 220, then 320 if you want it smooth. Sand along the grain, not across it. Wipe the dust off with a barely damp cloth, let it dry fully, then oil generously two or three times.',
          'A board sanded this way comes back essentially new. This is the main advantage wood has over plastic, which can only ever get worse.',
        ],
      },
      {
        h: 'Getting smells and stains out',
        p: [
          'Half a lemon and a spoon of coarse salt, scrubbed over the surface, lifts garlic, onion and fish smells better than soap does. Rinse, dry, then re-oil — the salt strips some oil out along with the smell.',
          'For stains, the sanding route is the reliable fix. Bleach damages the fibres and leaves the surface furry.',
        ],
      },
      {
        h: 'Two sides, two jobs',
        p: [
          'If your board has a juice groove, use that face for meat and anything wet, and keep the flat face for bread, fruit and cheese. It keeps the dry side dry and stops flavours travelling.',
          'The same rule works for serving trays: one face for the table, one for the kitchen.',
        ],
      },
    ],
    faq: [
      {
        q: 'Which oil should I use on a wooden chopping board?',
        a: 'Food-grade mineral oil. It is sold in pharmacies across Pakistan as liquid paraffin, it does not go rancid, and it is safe for food contact. Avoid cooking oils entirely.',
      },
      {
        q: 'How often should I oil a wooden board?',
        a: 'Weekly for the first month on a new board, then monthly if you use it daily. If the surface looks pale or feels dry, oil it regardless of the schedule.',
      },
      {
        q: 'Can a wooden chopping board go in the dishwasher?',
        a: 'No. The combination of prolonged water exposure and heat splits wooden boards along the grain or the glue lines, often after a single cycle.',
      },
      {
        q: 'How do I get the smell of garlic out of a wooden board?',
        a: 'Scrub the surface with half a lemon and coarse salt, rinse, dry it standing on edge, then re-oil. The salt lifts the odour and the oil replaces what the scrub stripped out.',
      },
    ],
    related: ['how-to-choose-wood', 'how-to-hang-a-wall-shelf'],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
