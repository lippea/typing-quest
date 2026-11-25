// A passage is either a string or { text, punchline?, twist? }.
// punchline: revealed on the win screen. twist: appended when you "finish".
// Keep everything plain ASCII (straight quotes only) so every char is typeable.
// wpm: the time limit for a run is the passage length typed at this speed.

const WORLDS = [
  { id: 1, name: 'Warm-up' },
  { id: 2, name: 'Mix It Up' },
  { id: 3, name: 'Symbols' },
  { id: 4, name: 'The Gauntlet' },
];

const BOSS_INFO = {
  fade: 'FADE: after 5 seconds, everything more than a few letters ahead vanishes completely. Memorise it!',
  countdown: 'COUNTDOWN: the clock is much stricter on this level.',
  ghost: 'GHOST RACE: beat the purple ghost cursor to the end.',
  final: 'FINAL BOSS: one line at a time, and the screen wobbles.',
};

const TWIST_LOWER = ' plot twist you thought that was the end';
const TWIST = ' Plot twist: you thought that was the end!';

const LEVELS = [
  {
    id: 1, world: 1, name: 'Baby Steps', wpm: 15,
    passages: [
      'dogs can smell your fear from far away',
      { text: 'pizza is a food group in my house', twist: TWIST_LOWER },
      'my sock has a big hole in the toe',
      'the goalie fell asleep in the net',
      'aliens love cold chips and warm milk',
    ],
  },
  {
    id: 2, world: 1, name: 'Finger Workout', wpm: 17,
    passages: [
      'Never trust a duck wearing sunglasses. It is definitely up to something.',
      { text: 'The dragon ate my homework again, so I need a new excuse.', twist: TWIST },
      'My little brother licked the frozen window. He was so embarrassed!',
      { text: 'A group of crows is called a murder. A group of owls is a parliament!', twist: TWIST },
      'Can a sloth hold its breath longer than a dolphin? Yes, it really can!',
    ],
  },
  {
    id: 3, world: 1, name: 'Fading Fast', boss: 'fade', wpm: 18,
    passages: [
      'Octopuses have 3 hearts and blue blood, which helps them survive in freezing water.',
      'The fastest goal in football history was scored in about 2 seconds. Blink and you miss it!',
      'A day on Venus is longer than a year on Venus, because it spins incredibly slowly.',
      'Bananas are berries, but strawberries are not. Science is weird, isn\'t it?',
      'Your stomach grows a new lining every few days, so it doesn\'t digest itself!',
    ],
  },
  {
    id: 4, world: 2, name: 'Capital Punishment', wpm: 20,
    passages: [
      {
        text: 'Why did the scarecrow win an award? Type this line with 0 mistakes (yes, zero!) and the answer will appear on screen. Ready? 3... 2... 1... go!',
        punchline: 'Because he was outstanding in his field!',
      },
      'Messi was so small at age 11 that doctors prescribed growth hormones. Coaches said he\'d never succeed; today he has 8 Ballon d\'Or awards & a World Cup.',
      'Minecraft was created by 1 programmer in about 6 days (May 2009). Since then, it has sold over 300 million copies - one of the best-selling games ever!',
      'Your brain uses about 20% of your body\'s energy, even though it weighs only 2% of your total weight. Thinking is surprisingly hard work, isn\'t it?',
    ],
  },
  {
    id: 5, world: 2, name: 'Comma Chaos', wpm: 21,
    passages: [
      {
        text: 'What do you call a fish with no eyes? Finish this sentence accurately - commas, "quotes" and all - and the answer is guaranteed to be yours.',
        punchline: 'A fsh!',
      },
      'Astronauts can grow up to 5 cm taller in space, because their spines stretch without gravity. Unfortunately, they shrink back on Earth (sorry!).',
      'The Moon drifts away from Earth by about 3.8 cm every year. Eventually, total solar eclipses will disappear completely. Wave goodbye... slowly.',
      'Lightning can reach 30,000C - about 5 times hotter than the Sun\'s surface! If you hear thunder, go indoors immediately; don\'t shelter under a tree.',
    ],
  },
  {
    id: 6, world: 2, name: 'Beat the Clock', boss: 'countdown', wpm: 25,
    passages: [
      'Sharks existed before trees did! They\'ve survived 5 mass extinctions, replace their teeth constantly (up to 30,000 in a lifetime) & never visit a dentist.',
      {
        text: 'Why can\'t a nose be 12 inches long? You\'ll only discover the answer if you beat the clock, so concentrate, keep a steady rhythm & get typing!',
        punchline: 'Because then it would be a foot!',
      },
      'A teaspoon of neutron star would weigh about 4 billion tonnes - roughly as much as a mountain. Good luck fitting that in your school backpack!',
      'Wombats are the only animals that produce cube-shaped poo. Scientists spent years (seriously!) investigating how their intestines create such peculiar shapes.',
    ],
  },
  {
    id: 7, world: 3, name: 'Number Crunch', wpm: 20,
    passages: [
      'Final score: Lions 3, Tigers 2. The winning goal arrived at 89:57, seconds before the final whistle! Approximately 52,000 spectators celebrated & one enthusiastic supporter accidentally threw his pie (meat, not apple). #lastminute',
      'Shopping list for a gamer: 2x energy drinks ($3.50 each), 1x wireless headset ($49.99), 3x bags of chips ($3.50 each) = $67.49 altogether. Mum said it was unnecessary & definitely too expensive. Final total: $0.00 :(',
      'Level 99 unlocked! You need 1,250 XP to reach level 100. Each zombie = 25 XP, so that\'s exactly 50 zombies. Ready? Set? Go! (Tip: zombies are allergic to broccoli & vocabulary tests.) Good luck, brave adventurer!',
      'Fun fact #7: the Sun is roughly 149,600,000 km from Earth. Light travels at about 300,000 km per second, so it takes 8 min 20 sec to arrive. The sunlight on your face is old news! Mind blown? Same.',
    ],
  },
  {
    id: 8, world: 3, name: 'Symbol Storm', wpm: 21,
    passages: [
      'Password advice: never use \'password123\' or \'qwerty\'. Instead, try something memorable like Blue-Pizza-Rocket-42! Combine UPPER & lower case letters, numbers (0-9) and symbols (!@#$%). Never share it, not even with your best friend.',
      'Weather forecast: Monday 31C & sunny; Tuesday 18C with a 90% chance of rain; Wednesday: hail the size of golf balls?! Thursday: back to a pleasant 25C. Friday: completely unpredictable. Pack an umbrella, sunscreen AND a helmet.',
      'Recipe for slime (ask an adult first!): 1/2 cup of glue + 1/2 cup of warm water + 1 tsp of baking soda + 1 tbsp of contact lens solution. Stir thoroughly for 2-3 mins. Warning: it may eventually end up on the ceiling.',
      'Lunchtime scoreboard: Jake 7, Sam 9, Leo 12 (suspicious?), Max 3. The official rematch is on Wednesday @ 1:15pm, same oval. Loser buys snacks = 4 x $2.50 = $10. Bring cash, not excuses! #rivalry #competition',
    ],
  },
  {
    id: 9, world: 3, name: 'Ghost Race', boss: 'ghost', wpm: 21,
    passages: [
      'Speedrun log: Any% world record = 4:55.913. My personal best = 7:12.004 (ouch). Split 3 is where I keep failing: 1 jump, 2 jumps, 3 jumps... SPLAT. Note to self: press A *before* the lava, not after! Persistence is the secret.',
      'Season statistics: 38 games, 24 wins, 8 draws, 6 losses = 80 points (3 per win, 1 per draw). Goals: 71 scored, 29 conceded (+42). Leading goalscorer? Number 9, with 23 goals & 11 assists. Not bad at all!',
      'Mission log #042: Rocket fuel at 97%. Crew = 4 (plus 1 hamster). Distance to Mars: approximately 225,000,000 km. Supplies: 300 muesli bars, 50 bags of jerky & 1 \'emergency\' cake. Estimated arrival: 7 months. Are we there yet?!',
    ],
  },
  {
    id: 10, world: 4, name: 'Paragraph Pain', wpm: 22,
    passages: [
      'The mantis shrimp is the toughest fighter in the ocean. Its punch travels at about 80 km/h - so fast that the water around its claw briefly boils! It can smash a crab shell like a hammer through glass, and some aquariums keep them in reinforced tanks (they\'ve cracked the glass before). Their eyes have 12-16 types of colour receptors; ours have 3. Never pick a fight with a shrimp!',
      'On 20 July 1969, Neil Armstrong became the first person to walk on the Moon. His footprints are probably still there, because there\'s no wind or rain to wash them away. The computer that guided the landing had about 4 KB of memory - less than a cheap calculator - yet it delivered the crew there & back safely. Around 600 million people watched on TV. Next time your phone feels slow, remember that!',
      'Every footballer dreams of scoring a hat-trick, but very few manage it in under 3 minutes. In 2015, Sadio Mane did exactly that for Southampton in just 2:56 - the fastest in Premier League history! His opponents could barely believe the scoreboard. It probably took them longer to tie their boots than it took him to score 3 goals. Talent matters, but preparation & determination matter just as much.',
    ],
  },
  {
    id: 11, world: 4, name: 'No Mercy', wpm: 23,
    passages: [
      {
        text: 'Why did the gamer bring a ladder to school? Before you find out, you must survive this entire paragraph without a single slip. Every key counts; every comma matters. If you make 1 mistake, you go straight back to the start (and the joke stays a secret). Breathe slowly, keep your eyes on the screen & resist the urge to rush. Being patient isn\'t the same as being slow - it means staying accurate until the very last word.',
        punchline: 'Because he heard it was time to level up!',
      },
      'Tardigrades (also called "water bears") are microscopic animals about 0.5 mm long. They can survive being frozen to -272C, boiled, squashed, dried out & even launched into outer space! In 2007, scientists sent thousands into orbit, and many returned alive. When conditions turn dangerous, they curl up and pause their bodies almost completely. If the world ended tomorrow, these chubby 8-legged micro-beasts would probably keep waddling around.',
      'One of the first video games to become a massive hit was a simple tennis game called Pong, released in 1972. It had 2 paddles, 1 ball & absolutely no story, yet people queued for hours to play it. Within a few decades, gaming had grown into an enormous industry worth over $100 billion a year. Today, the most ambitious games cost more to develop than many Hollywood films. Not bad for a square bouncing between 2 lines!',
    ],
  },
  {
    id: 12, world: 4, name: 'The Final Boss', boss: 'final', wpm: 24,
    passages: [
      'This is it: the final boss. Your fingers have travelled an extraordinary distance since level 1, and now everything is on the line. One wrong key and this entire paragraph disappears, so stay calm & stay sharp. No backspace, no copying, no switching tabs, no excuses! Champions aren\'t the people who never make mistakes; they\'re the ones who keep returning, learning and improving after every failure. Take a deep breath... now finish it!',
      'Deep beneath the ocean (up to 2,000 m down) lives the anglerfish, which carries its own glowing lantern on its head. In the pitch-black water, unsuspecting fish swim towards the light, believing it\'s food, and then CHOMP: dinner is served! The glow comes from millions of bacteria living inside the lantern - a partnership scientists call "symbiosis". In some species, the tiny male fuses with the female for life. Nature is beautiful, mysterious & slightly disgusting.',
      'Imagine a mountain taller than Mount Everest, hidden in plain sight. Measured from its base on the ocean floor, Mauna Kea in Hawaii is over 10,000 m tall, which comfortably beats Everest (8,849 m). However, about 60% of it is underwater, so hardly anybody notices! Its summit is so high & dry that astronomers built 13 enormous telescopes there. It\'s like the quiet kid in class who turns out to be brilliant at absolutely everything.',
    ],
  },
];

const SECRET_LEVEL = {
  id: 'secret', world: 0, name: 'Tongue Twisters', wpm: 22,
  passages: [
    'Six sticky skeletons sat sideways on sixty slippery sleds, sliding slowly southwards.',
    'Red lorry, yellow lorry, red lorry, yellow lorry, red lorry, yellow lorry, red lorry, yellow lorry.',
    'Fred fed Ted bread, and Ted fed Fred bread, but Fred\'s bread was better than Ted\'s bread.',
    'The sixth sick sheik\'s sixth sheep\'s sick, so the sixth sick sheik called a specialist.',
    'Unique New York, unique New York, you know you need unique New York, you know you need it.',
    'Peter Piper picked a peck of pickled peppers. How many pickled peppers did Peter Piper pick?',
  ],
};

function getLevel(id) {
  if (id === 'secret') return SECRET_LEVEL;
  return LEVELS.find(l => l.id === id);
}

function normalizePassage(p) {
  return typeof p === 'string' ? { text: p } : p;
}
