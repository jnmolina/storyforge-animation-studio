// Rich procedural & curated storytelling engine for StoryForge Animation Studio
// Supports simple mundane moments ("tying your shoes and starting the day")
// up to complex action narratives ("being chased by cops and trying to get away").

export const COMPLEXITY_TIERS = [
  {
    id: 'mundane',
    label: 'Level 1 · Mundane & Intimate',
    badge: '1–3 Shots · Character Acting',
    color: 'emerald',
    description: 'Everyday micro-stories focused on weight, tactile rhythm, and subtle emotional shifts. Zero world-building overhead.'
  },
  {
    id: 'slice',
    label: 'Level 2 · Slice of Life Twist',
    badge: '3–5 Shots · Visual Comedy / Beat Shift',
    color: 'amber',
    description: 'A routine expectation collides with a small obstacle, escalation, or ironic discovery.'
  },
  {
    id: 'kinetic',
    label: 'Level 3 · High-Stakes / Action',
    badge: '5–8 Shots · Dynamic Camera & Staging',
    color: 'rose',
    description: 'Urgent pursuit, suspense, or visceral momentum with dramatic camera angles and rapid cutting.'
  }
];

export const STARTER_PRESETS = [
  {
    id: 'preset-shoes',
    title: 'The Morning Knot (Tying Shoes & Starting the Day)',
    tier: 'mundane',
    logline: 'A groggy commuter fights a frayed shoelace that snaps right as the bus pulls up outside, forcing an unexpected hop-and-sprint.',
    theme: 'Everyday resilience & tactile morning rhythm',
    hook: 'Close-up tension on a taut cotton lace treated like a bomb defusal wire.',
    conflict: 'The right lace snaps in half just as the radiator hisses and the 8:02 bus air-brakes outside.',
    resolution: 'They double-knot the stub around the lowest eyelet, grab their cold toast in their teeth, and burst through the front door into crisp morning sunlight.',
    characters: [
      {
        id: 'char-1',
        name: 'Leo',
        archetype: 'Sleep-Deprived Commuter',
        silhouette: 'Capsule torso, oversized hoodie, lanky legs, messy bedhead',
        motivation: 'Catch the 8:02 bus without spilling coffee',
        quirk: 'Taps left foot impatiently when concentrating',
        colorHex: '#F59E0B',
        scale: [0.85, 0.85, 1.75]
      }
    ],
    environment: {
      name: 'Cramped Entryway Hall',
      settingType: 'Interior · Morning Apartment',
      timeOfDay: '07:59 AM Golden Low Sun',
      props: ['Wooden Coat Bench', 'Pair of Worn Sneakers', 'Front Door with Frosted Glass', 'Steaming Coffee Mug'],
      groundColor: '#3B2F2F',
      horizonColor: '#FDE68A'
    },
    moodKey: 'warm',
    shots: [
      {
        id: 'shot-1',
        number: 1,
        title: 'Establishing the Morning Slump',
        shotType: 'MS',
        shotTypeName: 'Medium Shot',
        cameraAngle: 'Eye-Level',
        cameraMove: 'Slow Push-In',
        focalLength: 35,
        duration: 2.5,
        action: 'Leo sits hunched on the entryway bench, yawning as one sneaker dangles from his fingertips.',
        dialogue: '(Yawn) "Five minutes... plenty of time."',
        soundCue: 'Muffled city traffic + ticking wall clock',
        subjectPos: [0, 0, 0],
        camStart: [0, -3.8, 1.4],
        camEnd: [0, -2.9, 1.35],
        compositionType: 'rule-of-thirds',
        notes: 'Keep shoulders heavy; emphasize weight shift onto bench.'
      },
      {
        id: 'shot-2',
        number: 2,
        title: 'The Frayed Lace Tension',
        shotType: 'ECU',
        shotTypeName: 'Extreme Close-Up',
        cameraAngle: 'High Angle',
        cameraMove: 'Static Locked',
        focalLength: 85,
        duration: 2.0,
        action: 'Fingers pull the frayed shoelace tight—fibers stretch in macro detail until SNAP!',
        dialogue: '"Come on, hold together—"',
        soundCue: 'Sharp guitar-string SNAP!',
        subjectPos: [0, 0, 0],
        camStart: [0.4, -1.5, 1.1],
        camEnd: [0.4, -1.5, 1.1],
        compositionType: 'center-macro',
        notes: 'Hold 12 frames on the taut lace before the sudden recoil.'
      },
      {
        id: 'shot-3',
        number: 3,
        title: 'Bus Air-Brakes Outside',
        shotType: 'CU',
        shotTypeName: 'Close-Up',
        cameraAngle: 'Low Angle',
        cameraMove: 'Whip Pan',
        focalLength: 28,
        duration: 1.8,
        action: 'Leo freezes, staring at the broken lace in his hand as orange bus headlights sweep across the frosted door glass.',
        dialogue: '"No no no—that\'s the 8:02!"',
        soundCue: 'Pneumatic bus hiss + double horn tap',
        subjectPos: [0, 0, 0],
        camStart: [-1.2, -2.2, 0.7],
        camEnd: [0.8, -2.0, 0.9],
        compositionType: 'diagonal-tension',
        notes: 'Snap head turn toward door first, torso follows 4 frames later.'
      },
      {
        id: 'shot-4',
        number: 4,
        title: 'Improvised Knot & Door Burst',
        shotType: 'WS',
        shotTypeName: 'Wide Shot',
        cameraAngle: 'Dutch Tilt',
        cameraMove: 'Tracking Dolly',
        focalLength: 24,
        duration: 3.0,
        action: 'Leo jams the broken lace into his shoe, snatches his mug, and flings the front door open into a bright shaft of morning light.',
        dialogue: '"Wait for me!"',
        soundCue: 'Door latch click + upbeat acoustic strum kicks in',
        subjectPos: [0, 1.2, 0],
        camStart: [-2.5, -4.5, 1.6],
        camEnd: [0.5, -2.5, 1.8],
        compositionType: 'doorway-frame',
        notes: 'Strong silhouette contrast against the bright doorway backlight.'
      }
    ]
  },
  {
    id: 'preset-cops',
    title: 'Neon Alley Pursuit (Chased by Cops & Trying to Get Away)',
    tier: 'kinetic',
    logline: 'Cornered in a rain-slicked cyber-alley with sirens closing in from both ends, a nimble courier uses a rolling dumpster and a fire escape counterweight to vanish vertical.',
    theme: 'Improvisation under high-pressure pursuit',
    hook: 'Red-and-blue strobe lights reflecting in a puddle right before a boot splashes straight through frame.',
    conflict: 'A patrol cruiser blocks the alley mouth ahead while footsteps and flashlight beams converge from behind.',
    resolution: 'The runner kicks the dumpster chock loose, rides the momentum into the fire escape ladder, and vaults onto the rooftop as cruisers screech to a halt below.',
    characters: [
      {
        id: 'char-1',
        name: 'Jax',
        archetype: 'Rooftop Courier on the Run',
        silhouette: 'Lean athletic build, reflective windbreaker, messenger satchel',
        motivation: 'Break line-of-sight before the perimeter locks down',
        quirk: 'Checks watch timer mid-sprint',
        colorHex: '#38BDF8',
        scale: [0.8, 0.8, 1.8]
      },
      {
        id: 'char-2',
        name: 'Interceptor Unit 04',
        archetype: 'Pursuing Patrol Officer / Cruiser',
        silhouette: 'Broad tactical silhouette + low-slung pursuit cruiser with lightbar',
        motivation: 'Corner the suspect in the dead-end service alley',
        quirk: 'Sweeping spotlight arc cuts across brick walls',
        colorHex: '#F43F5E',
        scale: [1.1, 1.1, 1.85]
      }
    ],
    environment: {
      name: 'Rain-Slicked Brick Service Alley',
      settingType: 'Exterior · Night Urban Alleyway',
      timeOfDay: '01:15 AM Neon & Siren Strobe',
      props: ['Heavy Metal Dumpster', 'Rusty Fire Escape Ladder', 'Cardboard Stack', 'Police Cruiser Barricade'],
      groundColor: '#0F172A',
      horizonColor: '#1E1B4B'
    },
    moodKey: 'cold',
    shots: [
      {
        id: 'shot-1',
        number: 1,
        title: 'Puddle Siren Splash',
        shotType: 'CU',
        shotTypeName: 'Close-Up',
        cameraAngle: 'Low Worm\'s-Eye',
        cameraMove: 'Static Locked',
        focalLength: 24,
        duration: 1.5,
        action: 'Red and blue siren strobes ripple in a dark puddle. Jax\'s boot slams through the water in slow-then-fast impact.',
        dialogue: '(Heavy breathing)',
        soundCue: 'Wailing siren doppler + sharp water splash',
        subjectPos: [0, -1.5, 0],
        camStart: [0.6, -3.0, 0.35],
        camEnd: [0.6, -3.0, 0.35],
        compositionType: 'low-impact',
        notes: 'Use 24mm wide lens near ground plane for dramatic perspective.'
      },
      {
        id: 'shot-2',
        number: 2,
        title: 'Over-the-Shoulder Alley Sprint',
        shotType: 'OTS',
        shotTypeName: 'Over-the-Shoulder',
        cameraAngle: 'Dutch Tilt',
        cameraMove: 'Handheld Follow',
        focalLength: 28,
        duration: 2.2,
        action: 'Camera tracks tightly behind Jax\'s shoulder as flashlight beams bounce off wet brick walls behind him.',
        dialogue: 'DISPATCH (V.O.): "Suspect heading north down Mercer Alley—cut him off!"',
        soundCue: 'Rapid footsteps + police radio squelch',
        subjectPos: [0, 0, 0],
        camStart: [-1.1, -3.5, 1.5],
        camEnd: [-0.4, -1.2, 1.4],
        compositionType: 'leading-lines',
        notes: 'Add subtle roll keyframes (+/- 4 deg) for kinetic urgency.'
      },
      {
        id: 'shot-3',
        number: 3,
        title: 'Cruiser Blocks the Exit',
        shotType: 'WS',
        shotTypeName: 'Wide Shot',
        cameraAngle: 'Low Angle',
        cameraMove: 'Fast Crane Up',
        focalLength: 35,
        duration: 2.0,
        action: 'At the end of the alley, a police cruiser fishtails broadside across the exit, headlights blinding the camera as Jax skids to a halt.',
        dialogue: 'JAX: "Dead end... alright, we go up."',
        soundCue: 'Tire screech on wet asphalt + high-beam hum',
        subjectPos: [0, 2.0, 0],
        camStart: [0, -4.5, 0.8],
        camEnd: [0, -3.2, 2.2],
        compositionType: 'silhouette-block',
        notes: 'Hold Jax in foreground silhouette against the cruiser headlights.'
      },
      {
        id: 'shot-4',
        number: 4,
        title: 'Dumpster Vault to Fire Escape',
        shotType: 'MS',
        shotTypeName: 'Medium Shot',
        cameraAngle: 'Low Hero Angle',
        cameraMove: 'Arc Orbit',
        focalLength: 35,
        duration: 2.4,
        action: 'Jax kicks off the brick wall, vaults onto the rolling dumpster lid, and leaps upward to snag the counterweighted fire escape ladder.',
        dialogue: 'OFFICER: "Hold it right there!"',
        soundCue: 'Hollow metallic dumpster clang + screeching iron chain',
        subjectPos: [1.2, 1.5, 1.2],
        camStart: [-2.2, -1.5, 1.0],
        camEnd: [2.4, -1.0, 2.6],
        compositionType: 'vertical-arc',
        notes: 'Exaggerate hang-time at apex of jump by 4 frames.'
      },
      {
        id: 'shot-5',
        number: 5,
        title: 'Rooftop Disappearance',
        shotType: 'EWS',
        shotTypeName: 'Extreme Wide Shot',
        cameraAngle: 'High Bird\'s-Eye',
        cameraMove: 'Slow Pull-Back',
        focalLength: 50,
        duration: 2.8,
        action: 'From high above the neon roofline, Jax rolls over the parapet into shadow while flashlight beams crisscross the empty alley below.',
        dialogue: 'JAX (whispering): "Better luck next shift."',
        soundCue: 'Wind gust overtakes distant sirens',
        subjectPos: [0, 2.5, 3.2],
        camStart: [0.5, -1.0, 5.2],
        camEnd: [1.5, -4.5, 6.8],
        compositionType: 'high-isolation',
        notes: 'End on calm wide framing to contrast earlier claustrophobic cuts.'
      }
    ]
  },
  {
    id: 'preset-vending',
    title: 'Coin vs. Vending Machine (Slice-of-Life Escalation)',
    tier: 'slice',
    logline: 'A late-night office worker\'s last quarter gets stuck in a humming vending machine, sparking an escalating silent duel with a dangling chocolate bar.',
    theme: 'Stubbornness over small rewards',
    hook: 'A single shiny coin spinning on glass before dropping with a hollow thud—and zero snack movement.',
    conflict: 'The spiral coil stops 2 millimeters short, leaving the snack suspended on a cliffhanger.',
    resolution: 'After a dramatic hip-check fails, a gentle defeated finger-tap causes every snack on the row to cascade down at once.',
    characters: [
      {
        id: 'char-1',
        name: 'Maya',
        archetype: 'Overtime Designer',
        silhouette: 'Rounded cardigan silhouette, big glasses, tote bag',
        motivation: 'Get the stuck caramel bar at 11:45 PM',
        quirk: 'Squints like a cowboy in a western standoff',
        colorHex: '#A855F7',
        scale: [0.85, 0.85, 1.68]
      }
    ],
    environment: {
      name: 'Fluorescent Breakroom Corridor',
      settingType: 'Interior · Late Night Office',
      timeOfDay: '11:45 PM Buzzing Fluorescent',
      props: ['Glowing Vending Machine', 'Plastic Breakroom Chair', 'Potted Fern', 'Trash Bin'],
      groundColor: '#1E293B',
      horizonColor: '#0F172A'
    },
    moodKey: 'dark',
    shots: [
      {
        id: 'shot-1',
        number: 1,
        title: 'The Standoff in the Glow',
        shotType: 'WS',
        shotTypeName: 'Wide Shot',
        cameraAngle: 'Eye-Level',
        cameraMove: 'Static Symmetry',
        focalLength: 35,
        duration: 2.2,
        action: 'Maya stands alone in a dark hallway, bathed only in the humming rectangular glow of the vending machine.',
        dialogue: '"B-4. Do not betray me tonight."',
        soundCue: '60Hz fluorescent hum + coin slot clink',
        subjectPos: [0, 0, 0],
        camStart: [0, -4.2, 1.5],
        camEnd: [0, -4.2, 1.5],
        compositionType: 'center-symmetry',
        notes: 'Wes Anderson style deadpan symmetry.'
      },
      {
        id: 'shot-2',
        number: 2,
        title: 'The Coil Betrayal',
        shotType: 'ECU',
        shotTypeName: 'Extreme Close-Up',
        cameraAngle: 'Eye-Level',
        cameraMove: 'Slow Push-In',
        focalLength: 85,
        duration: 2.4,
        action: 'Inside the glass, the metal coil rotates... pushes the wrapper edge... and stops dead with the bar leaning at 45 degrees.',
        dialogue: '"Are you kidding me?!"',
        soundCue: 'Mechanical servo whine stops abruptly',
        subjectPos: [0, 1.1, 1.3],
        camStart: [0, -1.2, 1.35],
        camEnd: [0, -0.8, 1.35],
        compositionType: 'center-macro',
        notes: 'Give the snack bar a tiny wobble so it feels alive.'
      },
      {
        id: 'shot-3',
        number: 3,
        title: 'The Dramatic Hip-Check & Tap Jackpot',
        shotType: 'MS',
        shotTypeName: 'Medium Shot',
        cameraAngle: 'Low Angle',
        cameraMove: 'Dutch Shake to Static',
        focalLength: 28,
        duration: 3.0,
        action: 'Maya body-checks the machine—nothing. Defeated, she taps the glass once with her index finger. Three bars tumble into the tray.',
        dialogue: '"...I\'ll take it."',
        soundCue: 'Heavy thud, silence, tiny tap, then jackpot cascade!',
        subjectPos: [0, 0.5, 0],
        camStart: [-1.6, -2.6, 0.9],
        camEnd: [-1.2, -2.4, 1.1],
        compositionType: 'rule-of-thirds',
        notes: 'Hold a 1.2s pause between the heavy slam and the tiny finger tap.'
      }
    ]
  }
];

// Procedural building blocks for remixing / generating fresh ideas at any complexity level
export const IDEA_POOLS = {
  mundane: {
    activities: [
      'tying a stubborn shoelace before heading out the door',
      'pouring the last drop of milk into a morning coffee cup',
      'trying to thread a needle while a cat watches intently',
      'folding an impossibly large fitted bedsheet alone',
      'waiting for a crosswalk light that refuses to change',
      'scraping burnt toast at 7:00 AM while half-asleep',
      'Digging through an overstuffed backpack for house keys in the rain'
    ],
    complications: [
      'the crucial piece snaps or slips at the worst possible second',
      'a tiny wind gust or household noise turns it into a precision operation',
      'every correction makes the tangle twice as dramatic',
      'their transport or alarm goes off outside mid-motion',
      'gravity seems to personally conspire against their hands'
    ],
    payoffs: [
      'an improvised one-second hack works better than the proper way',
      'they embrace the imperfection and stride out with sudden confidence',
      'a tiny victorious pause before stepping into the warm morning sun',
      'the obstacle resolves itself the exact moment they stop forcing it'
    ]
  },
  slice: {
    activities: [
      'carrying a precarious tower of takeout boxes up three flights of stairs',
      'trying to silently sneak a midnight snack past a creaky floorboard',
      'chasing a runaway paper airplane across a quiet library',
      'attempting to parallel park a tiny scooter between two massive trucks',
      'defending a park bench sandwich from an overly bold pigeon'
    ],
    complications: [
      'an unexpected onlooker turns a private fumble into a high-pride performance',
      'each save sets off a Rube Goldberg chain reaction of near-misses',
      'the object of focus lands in the one spot just out of arm\'s reach'
    ],
    payoffs: [
      'a deadpan recovery makes it look completely intentional',
      'an unlikely truce is forged with a shared crumb or nod',
      'the hardest part succeeds effortlessly after the tiny part fails'
    ]
  },
  kinetic: {
    activities: [
      'being chased by cops through a neon-lit service alley and trying to get away',
      'sprinting across moving commuter train roofs to recover a dropped briefcase',
      'escaping a spotlight drone patrol across a rain-slicked container yard',
      'sliding down a glass atrium roof while security shutters slam shut below',
      'weaving a getaway bicycle through a crowded night market under pursuit'
    ],
    complications: [
      'the primary escape exit is suddenly blocked by an incoming cruiser barricade',
      'a narrow gap forces a split-second vertical vault using environmental props',
      'floodlights lock on just as the footing gives way beneath them'
    ],
    payoffs: [
      'using the pursuer\'s own momentum or a counterweight prop to vanish out of sight',
      'a daring leap into shadow leaves the sirens echoing down the wrong street',
      'sliding under the final barrier with half a second to spare'
    ]
  }
};

export const MOOD_VARIATIONS = {
  warm: {
    id: 'warm',
    name: 'Warm Golden Hour',
    subtitle: 'Nostalgic, tactile, inviting morning/sunset glow',
    palette: ['#FFFBEB', '#FDE68A', '#F59E0B', '#B45309', '#451A03'],
    bgGradient: 'linear-gradient(135deg, #451A03 0%, #92400E 45%, #F59E0B 100%)',
    svgFilter: 'sepia(0.28) saturate(1.35) brightness(1.04) hue-rotate(-8deg)',
    lightingNotes: 'Key light at 3200K warm amber (elevation 22°), soft peach bounce fill, subtle dust motes in backlight.',
    blenderKeyColor: [1.0, 0.78, 0.48],
    blenderFillColor: [0.95, 0.55, 0.35],
    blenderBgColor: [0.14, 0.08, 0.04],
    keyEnergy: 4.5,
    fillEnergy: 1.8
  },
  cold: {
    id: 'cold',
    name: 'Cold Cyber / Rain Blue',
    subtitle: 'Crisp, isolated, high-tension steel & cyan tones',
    palette: ['#ECFEFF', '#67E8F9', '#0284C7', '#1E3A8A', '#090D16'],
    bgGradient: 'linear-gradient(135deg, #090D16 0%, #1E3A8A 50%, #06B6D4 100%)',
    svgFilter: 'saturate(1.2) hue-rotate(15deg) brightness(0.96) contrast(1.12)',
    lightingNotes: 'Cool 6800K steel-cyan key light, wet specular ground reflections, crimson rim accent for contrast.',
    blenderKeyColor: [0.45, 0.78, 1.0],
    blenderFillColor: [0.18, 0.32, 0.65],
    blenderBgColor: [0.03, 0.05, 0.10],
    keyEnergy: 4.2,
    fillEnergy: 1.4
  },
  dark: {
    id: 'dark',
    name: 'Dark Noir Chiaroscuro',
    subtitle: 'High-contrast silhouette, rim-lit mystery & shadow pools',
    palette: ['#E2E8F0', '#94A3B8', '#475569', '#1E293B', '#020617'],
    bgGradient: 'linear-gradient(135deg, #020617 0%, #0F172A 60%, #334155 100%)',
    svgFilter: 'contrast(1.38) brightness(0.78) saturate(0.75)',
    lightingNotes: 'Hard overhead or backlit edge source (8:1 contrast ratio), deep negative fill, sharp floor shadow cut.',
    blenderKeyColor: [0.85, 0.88, 1.0],
    blenderFillColor: [0.15, 0.12, 0.25],
    blenderBgColor: [0.01, 0.01, 0.03],
    keyEnergy: 6.0,
    fillEnergy: 0.4
  },
  light: {
    id: 'light',
    name: 'Light Airy Pastel',
    subtitle: 'High-key, optimistic, storybook overcast diffusion',
    palette: ['#FFFFFF', '#F0FDF4', '#BAE6FD', '#FBCFE8', '#334155'],
    bgGradient: 'linear-gradient(135deg, #E0F2FE 0%, #FEF3C7 50%, #FCE7F3 100%)',
    svgFilter: 'brightness(1.16) contrast(0.92) saturate(1.08)',
    lightingNotes: 'Large diffused dome skylight, low shadow hardness, pastel bounce cards from floor plane.',
    blenderKeyColor: [1.0, 0.98, 0.94],
    blenderFillColor: [0.78, 0.88, 1.0],
    blenderBgColor: [0.65, 0.72, 0.80],
    keyEnergy: 5.5,
    fillEnergy: 3.5
  }
};

export const CAMERA_SHOT_TYPES = [
  { code: 'EWS', name: 'Extreme Wide Shot', defaultFocal: 20, dist: 6.0, zOffset: 2.8 },
  { code: 'WS', name: 'Wide Shot', defaultFocal: 24, dist: 4.4, zOffset: 1.6 },
  { code: 'MS', name: 'Medium Shot', defaultFocal: 35, dist: 2.8, zOffset: 1.35 },
  { code: 'CU', name: 'Close-Up', defaultFocal: 50, dist: 1.7, zOffset: 1.45 },
  { code: 'ECU', name: 'Extreme Close-Up', defaultFocal: 85, dist: 1.15, zOffset: 1.1 },
  { code: 'OTS', name: 'Over-the-Shoulder', defaultFocal: 28, dist: 2.4, zOffset: 1.5 }
];

export const CAMERA_ANGLES = [
  'Eye-Level',
  'Low Angle',
  'Low Worm\'s-Eye',
  'High Angle',
  'High Bird\'s-Eye',
  'Dutch Tilt'
];

export const CAMERA_MOVES = [
  'Static Locked',
  'Slow Push-In',
  'Slow Pull-Back',
  'Tracking Dolly',
  'Whip Pan',
  'Handheld Follow',
  'Arc Orbit',
  'Fast Crane Up'
];

export const ROYALTY_FREE_TRACKS = [
  {
    id: 'track-morning-acoustic',
    title: 'Coffee & Shoelaces (Lo-Fi Acoustic Beat)',
    artist: 'StoryForge Studio Synth · CC0',
    mood: 'warm',
    bpm: 92,
    duration: 24,
    genre: 'Lo-Fi / Mundane Morning',
    sourceSite: 'Pixabay Music / Free Music Archive',
    externalUrl: 'https://pixabay.com/music/search/lofi%20morning/',
    synthPreset: {
      style: 'lofi',
      rootFreq: 220,
      scale: [0, 4, 7, 11, 14],
      tempo: 92,
      warmth: 0.8
    }
  },
  {
    id: 'track-siren-chase',
    title: 'Neon Pursuit (Dark Synthwave Pulse)',
    artist: 'StoryForge Studio Synth · CC0',
    mood: 'cold',
    bpm: 138,
    duration: 24,
    genre: 'Action / Police Chase',
    sourceSite: 'Incompetech / FreePD',
    externalUrl: 'https://pixabay.com/music/search/chase%20cyberpunk/',
    synthPreset: {
      style: 'chase',
      rootFreq: 110,
      scale: [0, 3, 5, 7, 10],
      tempo: 138,
      warmth: 0.2
    }
  },
  {
    id: 'track-noir-mystery',
    title: 'Fluorescent Standoff (Quirky Pizzicato & Bass)',
    artist: 'StoryForge Studio Synth · CC0',
    mood: 'dark',
    bpm: 108,
    duration: 24,
    genre: 'Comedic Suspense / Slice of Life',
    sourceSite: 'Free Music Archive (CC-BY / CC0)',
    externalUrl: 'https://freemusicarchive.org/genre/Instrumental/',
    synthPreset: {
      style: 'quirky',
      rootFreq: 146.83,
      scale: [0, 2, 3, 7, 8],
      tempo: 108,
      warmth: 0.5
    }
  },
  {
    id: 'track-pastel-breeze',
    title: 'Paper Airplane Sidewalk (Upbeat Marimba & Piano)',
    artist: 'StoryForge Studio Synth · CC0',
    mood: 'light',
    bpm: 116,
    duration: 24,
    genre: 'Whimsical / Daylight',
    sourceSite: 'ccMixter / Musopen',
    externalUrl: 'https://pixabay.com/music/search/upbeat%20acoustic/',
    synthPreset: {
      style: 'airy',
      rootFreq: 261.63,
      scale: [0, 2, 4, 7, 9],
      tempo: 116,
      warmth: 0.9
    }
  }
];

// Generate a procedural idea + matching starter shots based on tier & custom seed prompt
export function generateProceduralStory(tier = 'mundane', customSeed = '') {
  const pool = IDEA_POOLS[tier] || IDEA_POOLS.mundane;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const activity = customSeed.trim() ? customSeed.trim() : pick(pool.activities);
  const complication = pick(pool.complications);
  const payoff = pick(pool.payoffs);

  const isChase = /cop|chase|run|pursuit|escape|get away/i.test(activity);
  const isShoe = /shoe|lace|morning|tie|tying/i.test(activity);

  if (isShoe && !customSeed.includes('remix')) {
    return JSON.parse(JSON.stringify(STARTER_PRESETS[0]));
  }
  if (isChase && !customSeed.includes('remix')) {
    return JSON.parse(JSON.stringify(STARTER_PRESETS[1]));
  }

  const titleWords = activity
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 4)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ');

  const moodKey = tier === 'kinetic' ? 'cold' : tier === 'slice' ? 'dark' : 'warm';

  const generatedShots = [
    {
      id: `shot-${Date.now()}-1`,
      number: 1,
      title: 'Establishing the Goal',
      shotType: 'WS',
      shotTypeName: 'Wide Shot',
      cameraAngle: tier === 'kinetic' ? 'Dutch Tilt' : 'Eye-Level',
      cameraMove: 'Slow Push-In',
      focalLength: 28,
      duration: 2.2,
      action: `Protagonist begins ${activity}, establishing body posture and spatial stakes.`,
      dialogue: tier === 'kinetic' ? '(Breathless) "Got to keep moving!"' : '"Okay... simple enough."',
      soundCue: tier === 'kinetic' ? 'Distant sirens & rapid footsteps' : 'Room tone & tactile cloth rustle',
      subjectPos: [0, 0, 0],
      camStart: [-1.5, -4.2, 1.5],
      camEnd: [-0.8, -3.2, 1.4],
      compositionType: 'rule-of-thirds',
      notes: 'Establish clear silhouette before introducing the complication.'
    },
    {
      id: `shot-${Date.now()}-2`,
      number: 2,
      title: 'The Complication Strikes',
      shotType: 'ECU',
      shotTypeName: 'Extreme Close-Up',
      cameraAngle: 'High Angle',
      cameraMove: 'Static Locked',
      focalLength: 85,
      duration: 1.9,
      action: `Close macro focus on the point of contact right as ${complication}.`,
      dialogue: '"Wait—no!"',
      soundCue: 'Sharp tactile snap / sudden mechanical halt',
      subjectPos: [0, 0.3, 0],
      camStart: [0.4, -1.4, 1.2],
      camEnd: [0.4, -1.4, 1.2],
      compositionType: 'center-macro',
      notes: 'Hold stillness for 8 frames before the impact beat.'
    },
    {
      id: `shot-${Date.now()}-3`,
      number: 3,
      title: 'Escalation & Pivot',
      shotType: 'CU',
      shotTypeName: 'Close-Up',
      cameraAngle: 'Low Angle',
      cameraMove: 'Whip Pan',
      focalLength: 35,
      duration: 2.0,
      action: 'Eyes dart toward the ticking clock / closing obstacle as a split-second idea forms.',
      dialogue: '"Only one way out of this."',
      soundCue: 'Rising rhythmic pulse',
      subjectPos: [0, 0.5, 0],
      camStart: [-1.1, -2.1, 0.85],
      camEnd: [0.9, -1.9, 1.05],
      compositionType: 'diagonal-tension',
      notes: 'Exaggerate brow compression and quick eye dart.'
    },
    {
      id: `shot-${Date.now()}-4`,
      number: 4,
      title: 'The Payoff Beat',
      shotType: 'MS',
      shotTypeName: 'Medium Shot',
      cameraAngle: 'Low Hero Angle',
      cameraMove: 'Tracking Dolly',
      focalLength: 24,
      duration: 2.6,
      action: `In one decisive motion, ${payoff}.`,
      dialogue: '"Nailed it."',
      soundCue: 'Crisp release chord + ambient transition',
      subjectPos: [0, 1.4, 0],
      camStart: [-2.0, -3.8, 1.2],
      camEnd: [0.6, -2.2, 1.7],
      compositionType: 'doorway-frame',
      notes: 'Follow through with a strong exit pose on the final frame.'
    }
  ];

  return {
    id: `story-${Date.now()}`,
    title: titleWords || 'Untitled Story Beat',
    tier,
    logline: `While ${activity}, ${complication}—until ${payoff}.`,
    theme: tier === 'kinetic' ? 'Momentum under pressure' : 'Finding magic in everyday friction',
    hook: `Start directly on the tactile detail of ${activity}.`,
    conflict: `Just when rhythm is established, ${complication}.`,
    resolution: `Rather than freezing up, ${payoff}.`,
    characters: [
      {
        id: 'char-1',
        name: tier === 'kinetic' ? 'Kai' : 'Sam',
        archetype: tier === 'kinetic' ? 'Quick-Thinking Runner' : 'Everyday Hero',
        silhouette: 'Expressive capsule silhouette with contrasting jacket collar',
        motivation: `Finish ${activity} before time runs out`,
        quirk: 'Expressive head tilt before taking action',
        colorHex: tier === 'kinetic' ? '#38BDF8' : '#F59E0B',
        scale: [0.85, 0.85, 1.75]
      }
    ],
    environment: {
      name: tier === 'kinetic' ? 'Urban Service Corridor' : 'Sunlit Apartment Threshold',
      settingType: tier === 'kinetic' ? 'Exterior · Night Street' : 'Interior · Everyday Room',
      timeOfDay: tier === 'kinetic' ? '01:00 AM High-Contrast Night' : '08:00 AM Crisp Morning',
      props: tier === 'kinetic'
        ? ['Dumpster Prop', 'Fire Escape Ladder', 'Barricade Cruiser', 'Streetlamp']
        : ['Entryway Bench', 'Everyday Prop Focus', 'Doorway Frame', 'Side Table'],
      groundColor: tier === 'kinetic' ? '#0F172A' : '#3B2F2F',
      horizonColor: tier === 'kinetic' ? '#1E1B4B' : '#FDE68A'
    },
    moodKey,
    shots: generatedShots
  };
}

// Resolve a mood key against built-in presets AND moods generated from the
// user's own references (stored on project.customMoods).
export function resolveMood(project, key) {
  const k = key || project?.moodKey || 'warm';
  return project?.customMoods?.[k] || MOOD_VARIATIONS[k] || MOOD_VARIATIONS.warm;
}
