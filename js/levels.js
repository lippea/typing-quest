// A passage is either a string or { text, punchline?, twist? }.
// punchline: revealed on the win screen. twist: appended when you "finish".
// Keep everything plain ASCII (straight quotes only) so every char is typeable.

const WORLDS = [
  { id: 1, name: 'Warm-up' },
  { id: 2, name: 'Sentences' },
  { id: 3, name: 'Symbols' },
  { id: 4, name: 'The Gauntlet' },
];

const BOSS_INFO = {
  fade: 'FADE: letters far ahead vanish after 3 seconds. Read ahead!',
  countdown: 'COUNTDOWN: finish before the clock hits zero.',
  ghost: 'GHOST RACE: beat the purple ghost cursor to the end.',
  final: 'FINAL BOSS: one line at a time, and the screen wobbles.',
};

const TWIST = ' plot twist you thought that was the end';

const LEVELS = [
  {
    id: 1, world: 1, name: 'Baby Steps',
    passages: [
      'dogs can smell your fear',
      { text: 'pizza is a food group', twist: TWIST },
      'my sock has a big hole',
      'the goalie fell asleep',
      'aliens love cold chips',
    ],
  },
  {
    id: 2, world: 1, name: 'Finger Workout',
    passages: [
      'never trust a duck wearing sunglasses',
      { text: 'the dragon ate my homework again', twist: TWIST },
      'my little brother licked the window',
      { text: 'a group of crows is called a murder', twist: TWIST },
      'a sloth can hold its breath longer than a dolphin',
    ],
  },
  {
    id: 3, world: 1, name: 'Fading Fast', boss: 'fade',
    passages: [
      'octopuses have three hearts and blue blood in their bodies',
      'the fastest goal ever scored took just two seconds',
      'a day on venus is longer than a whole year on venus',
      'bananas are berries but strawberries are not berries',
      'your stomach makes a brand new lining every few days',
    ],
  },
  {
    id: 4, world: 2, name: 'Capital Punishment',
    passages: [
      {
        text: 'Why did the scarecrow win an award? Type this whole line with no mistakes and you will find out.',
        punchline: 'Because he was outstanding in his field!',
      },
      'Messi was so small as a kid that people said he would never make it. Now he has eight Ballon d\'Or awards.',
      'Minecraft started as a game made by one person in about six days. Now it is one of the best-selling games ever.',
      'Your brain uses about twenty percent of your energy, even though it is only two percent of your body weight.',
    ],
  },
  {
    id: 5, world: 2, name: 'Comma Chaos',
    passages: [
      {
        text: 'What do you call a fish with no eyes? Finish this sentence perfectly, and the answer is all yours.',
        punchline: 'A fsh!',
      },
      'Astronauts grow up to five centimetres taller in space, because their spines stretch out. They shrink back on Earth.',
      'The Moon is drifting away from Earth, about four centimetres every single year. Wave goodbye, slowly.',
      'Lightning is about five times hotter than the surface of the Sun. Maybe don\'t stand under a tree in a storm.',
    ],
  },
  {
    id: 6, world: 2, name: 'Beat the Clock', boss: 'countdown',
    passages: [
      'Sharks were around before trees existed. They have survived five mass extinctions, and they still don\'t need a dentist.',
      {
        text: 'Why can\'t a nose be twelve inches long? You will only learn the answer if you beat the clock, so get typing!',
        punchline: 'Because then it would be a foot!',
      },
      'A teaspoon of a neutron star would weigh about as much as a mountain. Good luck fitting that in your backpack.',
      'Wombats are the only animals that do cube-shaped poo. Scientists actually spent years working out how they do it.',
    ],
  },
  {
    id: 7, world: 3, name: 'Number Crunch',
    passages: [
      'Final score: Lions 3, Tigers 2. The winner came at 89:57, seconds before the whistle! 52,000 fans went wild & one guy threw his pie (meat, not apple). #lastminute',
      'Shopping list for a gamer: 2x energy drinks ($3.50 each), 1x headset ($49.99), 3x bags of chips ($3.50 each) = $67.49 total. Mum said no. Final total: $0.00 :(',
      'Level 99 unlocked! You need 1,250 XP to reach level 100. Each zombie = 25 XP, so that\'s 50 zombies. Ready? Set? Go! (Tip: zombies hate broccoli.) Good luck, hero!',
      'Fun fact #7: the Sun is 149,600,000 km from Earth. Light takes about 8 min 20 sec to get here, so the sunlight on your face is old news! Mind blown? Same.',
    ],
  },
  {
    id: 8, world: 3, name: 'Symbol Storm',
    passages: [
      'Password tips: never use \'password123\' or \'qwerty\'. Try something like Blue-Pizza-Rocket-42! Mix UPPER & lower case, numbers (0-9) and symbols (!@#$). Don\'t share it, not even with your best mate.',
      'Weather report: Monday 31C & sunny; Tuesday 18C with a 90% chance of rain; Wednesday: hail the size of golf balls?! Thursday: back to 25C. Friday: who knows. Pack an umbrella, sunscreen AND a helmet.',
      'Recipe for slime (ask an adult!): 1/2 cup of glue + 1/2 cup of water + 1 tsp of baking soda + 1 tbsp of contact lens solution. Mix for 2-3 mins. Warning: may end up on the ceiling.',
      'Scoreboard @ lunch: Jake 7, Sam 9, Leo 12 (cheated?), Max 3. Rematch on Friday @ 1:15pm, same oval. Loser buys snacks = 4 x $2.50 = $10. Bring cash, not excuses! #rivalry',
    ],
  },
  {
    id: 9, world: 3, name: 'Ghost Race', boss: 'ghost',
    passages: [
      'Speedrun log: Any% world record = 4:55.913. My best = 7:12.004 (ouch). Split 3 is where I keep dying: 1 jump, 2 jumps, 3 jumps... SPLAT. Note to self: press A *before* the lava, not after!',
      'Football stats: 38 games, 24 wins, 8 draws, 6 losses = 80 points (3 per win, 1 per draw). Goals: 71 for, 29 against (+42). Top scorer? Number 9, with 23 goals & 11 assists. Not bad!',
      'Mission log #042: Rocket fuel at 97%. Crew = 4 (plus 1 hamster). Distance to Mars: about 225,000,000 km. Snacks: 300 bars, 50 bags of jerky & 1 \'emergency\' cake. ETA: 7 months. Are we there yet?!',
    ],
  },
  {
    id: 10, world: 4, name: 'Paragraph Pain',
    passages: [
      'The mantis shrimp is the toughest little fighter in the ocean. Its punch is so fast that the water around it boils for a split second, and it can smash a crab shell like a hammer through glass. Some aquariums keep them in special tanks, because they have cracked the glass walls. Never pick a fight with a shrimp.',
      'In 1969, Neil Armstrong became the first person to walk on the Moon. His footprints are still up there today, because there is no wind or rain to wash them away. The computer that guided the landing had less memory than a cheap calculator, yet it got the crew there and back safely. Next time your phone feels slow, remember that.',
      'Every footballer dreams of scoring a hat-trick, but very few score one in under three minutes. In 2015, Sadio Mane did it for Southampton in just 2 minutes and 56 seconds, the fastest in Premier League history. It probably took the other team longer to tie their boots than it took him to score three.',
    ],
  },
  {
    id: 11, world: 4, name: 'No Mercy',
    passages: [
      {
        text: 'Why did the gamer bring a ladder to school? Before you find out, you must survive this entire paragraph without a single slip. Every key counts. Every comma matters. If you mess up now, you go right back to the start, and the joke stays a secret. Breathe slowly, keep your eyes on the screen, and don\'t rush the last few words.',
        punchline: 'Because he heard it was time to level up!',
      },
      'Tardigrades, also called water bears, are tiny animals about half a millimetre long. They can survive being frozen, boiled, squashed, dried out and even blasted into outer space. Scientists once sent them into orbit, and many came home alive. If the world ended tomorrow, these chubby eight-legged micro-beasts would probably still be waddling around.',
      'One of the first video games to become a massive hit was a simple game of tennis called Pong, released in 1972. It had two paddles, one ball and no story at all, yet people queued for ages to play it. Today, the biggest games cost more to make than Hollywood films. Not bad for a square bouncing between two lines.',
    ],
  },
  {
    id: 12, world: 4, name: 'The Final Boss', boss: 'final',
    passages: [
      'This is it: the final boss. Your fingers have come a long way since level 1, and now everything is on the line. One wrong key and this whole paragraph disappears, so stay calm and stay sharp. No backspace, no copying, no switching tabs, no excuses. Champions are not the ones who never slip; they are the ones who keep coming back. Now finish it!',
      'Deep under the ocean lives the anglerfish, which carries its own glowing lantern on its head. In the pitch-black water, small fish swim towards the light, thinking it is food, and then CHOMP: dinner is served. In some species, the tiny male bites onto the female and slowly fuses with her body for life. Nature is beautiful, weird and slightly disgusting.',
      'Imagine a mountain taller than Mount Everest, hidden in plain sight. Mauna Kea in Hawaii is over 10,000 metres tall when you measure it from its base at the bottom of the ocean, which beats Everest at 8,849 metres. Most of it is underwater, so nobody notices. It is a bit like the quiet kid in class who turns out to be brilliant at everything.',
    ],
  },
];

const SECRET_LEVEL = {
  id: 'secret', world: 0, name: 'Tongue Twisters',
  passages: [
    'Six sticky skeletons sat sideways on sixty slippery sleds.',
    'Red lorry, yellow lorry, red lorry, yellow lorry, red lorry, yellow lorry.',
    'Fred fed Ted bread, and Ted fed Fred bread.',
    'The sixth sick sheik\'s sixth sheep\'s sick.',
    'Unique New York, unique New York, you know you need unique New York.',
  ],
};

function getLevel(id) {
  if (id === 'secret') return SECRET_LEVEL;
  return LEVELS.find(l => l.id === id);
}

function normalizePassage(p) {
  return typeof p === 'string' ? { text: p } : p;
}
