// ============================================================================
// StoryForge Procedural Story, Animation Exercise & Cinematography Engine v2
// Built around:
// - Plot Generator (plot-generator.org.uk/story-ideas/) — 6 Lockable Plot Slots
// - r/animation Beginner's Guide & Animator Island (51 Great Animation Exercises)
// - Tuts+ Storyboarding Lingo & Camera Techniques (Shot sizes, Dolly/Truck/Pan/Rack Focus)
// - Film-Grab (Cinematography framing & lighting archetypes)
// - Living Lines Library (livlily.blogspot.com — Line of action, silhouette, breakdown poses)
// - Perchance Emotion Generator (Surface emotion -> internal subtext -> physical acting cue)
// ============================================================================

export const REFERENCE_SOURCES = [
  {
    id: 'plot-gen',
    name: 'Plot Generator',
    tag: 'Plot Slots & Twists',
    url: 'https://www.plot-generator.org.uk/story-ideas/'
  },
  {
    id: 'reddit-guide',
    name: 'r/animation Beginner Guide',
    tag: 'Iterative Pipeline',
    url: 'https://www.reddit.com/r/animation/comments/1bn974s/the_ultimate_reddit_beginners_guide_to_animation/'
  },
  {
    id: '51-exercises',
    name: '51 Animation Exercises',
    tag: 'Skill Drills',
    url: 'https://www.animatorisland.com/51-great-animation-exercises-to-master/'
  },
  {
    id: 'tuts-lingo',
    name: 'Tuts+ Storyboard Lingo',
    tag: 'Camera Grammar',
    url: 'https://design.tutsplus.com/tutorials/storyboarding-part-2-lingo-camera-shots-techniques--cms-31171'
  },
  {
    id: 'film-grab',
    name: 'Film-Grab',
    tag: 'Cinema Framing',
    url: 'https://film-grab.com/'
  },
  {
    id: 'living-lines',
    name: 'Living Lines Library',
    tag: 'Pencil & Line of Action',
    url: 'https://livlily.blogspot.com/'
  },
  {
    id: 'perchance-emotion',
    name: 'Perchance Emotion Arc',
    tag: 'Acting Subtext',
    url: 'https://perchance.org/emotion'
  }
];

export const COMPLEXITY_TIERS = [
  {
    id: 'mundane',
    label: 'Level 1 · Mundane & Tactile',
    badge: '3–4 Shots · Weight & Micro-Acting',
    color: 'emerald',
    description:
      'Everyday tasks (tying shoes, pouring coffee, opening a stuck latch) where small physical friction reveals character without complex world-building.'
  },
  {
    id: 'slice',
    label: 'Level 2 · Slice of Life & Emotion Shift',
    badge: '4–5 Shots · Subtext & Visual Twist',
    color: 'amber',
    description:
      'A routine goal collides with an ironic obstacle, forcing a clear 3-beat emotional shift (anticipation → frustration → unexpected triumph).'
  },
  {
    id: 'kinetic',
    label: 'Level 3 · High-Stakes & Dynamic Camera',
    badge: '5–6 Shots · Pursuit, Vaults & Cutting',
    color: 'rose',
    description:
      'Urgent momentum (police alley pursuit, rooftop escape, closing shutter slide) driven by dynamic Tuts+ camera moves and sharp silhouette staging.'
  }
];

// Curated drills from Animator Island's "51 Great Animation Exercises" + Reddit Beginner Guide
// turned into narrative micro-stories so animators practice mechanics INSIDE a compelling story.
export const ANIMATION_EXERCISES = [
  {
    id: 'ex-shoe-tie',
    num: 14,
    title: 'Tying a Stubborn Shoelace Under Time Pressure',
    tier: 'mundane',
    skillFocus: 'Finger dexterity, tension hold, sudden recoil & weight shift',
    livingLinesNote: 'Curve spine into a tight C-shape over the knee; snap into a stretched S-curve when the lace breaks.',
    defaultSlots: {
      protagonist: 'A groggy commuter running 90 seconds late for the 8:02 express bus',
      activity: 'pulling a frayed cotton shoelace tight on the entryway bench',
      complication: 'the right shoelace snaps in half the exact second the bus air-brakes hiss outside the frosted glass door',
      emotionArc: 'Groggy Routine → Sudden Micro-Panic → Improvised Confidence',
      actingCue: 'Hold 10 frames of dead freeze staring at the snapped lace tip before eyes dart up toward the door.',
      cinemaStyle: 'Film-Grab Golden Hour hallway backlight; Tuts+ ECU insert cut on the snapping fibers',
      payoff: 'they loop the short stub through the bottom eyelet, bite their toast, and burst out the door into warm sunlight'
    }
  },
  {
    id: 'ex-heavy-lift',
    num: 19,
    title: 'Lifting an Deceptively Heavy Box',
    tier: 'mundane',
    skillFocus: 'Center-of-gravity placement, leg compression, anticipation & follow-through',
    livingLinesNote: 'Keep hips directly under the load; show trembling knees and a delayed torso catch at the top of the lift.',
    defaultSlots: {
      protagonist: 'An overconfident mover trying to impress a watching neighbor',
      activity: 'attempting to casually one-hand a small cardboard box labeled "BOOKS & ANVILS"',
      complication: 'the box refuses to budge an inch, jerking their shoulder down and nearly tipping them headfirst over it',
      emotionArc: 'Casual Bravado → Strained Disbelief → Humble Precision',
      actingCue: 'Exaggerate the casual whistle before grip; widen stance and puff cheeks red on the second two-handed pull.',
      cinemaStyle: 'Low-angle wide staging to emphasize vertical weight; Tuts+ pedestal up with the successful lift',
      payoff: 'they plant both boots wide, squat deep with proper leverage, and heave it onto their hip with a strained grin'
    }
  },
  {
    id: 'ex-stuck-door',
    num: 27,
    title: 'Opening a Swollen / Stuck Door',
    tier: 'mundane',
    skillFocus: 'Opposing force, line-of-action pull vs. push, overshoot & balance recovery',
    livingLinesNote: 'Contrast a sharp 45° backward lean during the pull with a sudden forward tumble when the latch gives way.',
    defaultSlots: {
      protagonist: 'A drenched courier carrying a fragile paper bag of hot soup in one hand',
      activity: 'trying to hip-nudge and pull a rain-swollen wooden apartment door open without setting the soup down',
      complication: 'the brass knob slips from their wet fingers twice while thunder rumbles overhead',
      emotionArc: 'Damp Impatience → Stubborn Strain → Weightless Relief',
      actingCue: 'Keep the soup hand level like a gyroscope while the rest of the body twists violently against the door.',
      cinemaStyle: 'Noir rain rim-light outside vs. warm amber crack of light widening from the doorframe',
      payoff: 'the latch pops open unexpectedly, sending them gliding inside where they catch their balance without spilling a drop'
    }
  },
  {
    id: 'ex-emotion-shift',
    num: 33,
    title: 'Character Thinking & Changing Emotion (Vending Machine Duel)',
    tier: 'slice',
    skillFocus: 'Eye darts, brow compression, postural deflation & sudden perk-up',
    livingLinesNote: 'Lead every thought change with the eyes 4 frames ahead of the head turn; let the spine slump before the final spark.',
    defaultSlots: {
      protagonist: 'An overtime studio artist down to their very last shiny quarter at 11:45 PM',
      activity: 'feeding the coin into a buzzing breakroom vending machine for the last caramel bar on row B-4',
      complication: 'the metal spiral rotates 350 degrees and stops dead, leaving the wrapper dangling by two millimeters on a cliffhanger',
      emotionArc: 'Hopeful Anticipation → Petty Outrage → Defeated Surrender → Accidental Jackpot',
      actingCue: 'Western-standoff squint on coin drop; dramatic shoulder slump against the glass before a single lazy index-finger tap.',
      cinemaStyle: 'Film-Grab deadpan Wes Anderson center symmetry in a dark corridor lit only by the machine glow',
      payoff: 'their defeated one-finger tap triggers a delayed vibration that sends three bars cascading into the tray at once'
    }
  },
  {
    id: 'ex-hot-food',
    num: 38,
    title: 'Tasting Something Unexpectedly Pipin’-Hot / Spicy',
    tier: 'slice',
    skillFocus: 'Delayed reaction timing, facial squash-and-stretch, frantic scramble',
    livingLinesNote: 'Use a calm, tiny chew pose first so the sudden rigid vertical stretch reads with maximum contrast.',
    defaultSlots: {
      protagonist: 'A composed food critic trying to maintain dignity at a crowded street-noodle stall',
      activity: 'taking a polite, unbothered first bite of a glowing chili dumpling',
      complication: 'a 1.5-second delayed heat wave hits right as the chef leans in beaming for their verdict',
      emotionArc: 'Polite Composure → Internal Alarm → Frantic Disguised Scramble',
      actingCue: 'Freeze chew mid-bite; eyes widen while smiling tightly; one hand blindly patting the counter for the water pitcher.',
      cinemaStyle: 'Tuts+ slow dolly push-in from MS to tight CU as the background softly rack-focuses out',
      payoff: 'they give a trembling thumbs-up, gulp an entire teapot of ice water in one breath, and bow with watering eyes'
    }
  },
  {
    id: 'ex-sneak-freeze',
    num: 42,
    title: 'Sneaking Past a Creaky Floorboard',
    tier: 'slice',
    skillFocus: 'Slow-in/slow-out spacing, suspended balance on one foot, comic timing holds',
    livingLinesNote: 'Exaggerate high-arched tiptoe silhouettes with arms outstretched like a tightrope walker.',
    defaultSlots: {
      protagonist: 'A midnight snack hunter tiptoeing across a moonlit hardwood hallway',
      activity: 'balancing a tower of leftover pancakes while stepping over a notoriously loud floorboard',
      complication: 'their heel grazes the board edge, letting out a long, rising wooden groan while a bedroom doorknob starts to turn',
      emotionArc: 'Focused Stealth → Frozen Suspense → Graceful Evasion',
      actingCue: 'Hold a one-legged crane pose for 16 frames while only the eyeballs swivel toward the turning brass doorknob.',
      cinemaStyle: 'Dutch-angle moonlightVenetian blind shadows across the floor; Tuts+ low worm’s-eye ECU on the hovering heel',
      payoff: 'they smoothly pivot into a statue pose behind the coat rack until the door clicks shut, then glide into the kitchen'
    }
  },
  {
    id: 'ex-alley-pursuit',
    num: 49,
    title: 'Obstacle Vault & Escape Under Pursuit (Chased by Cops)',
    tier: 'kinetic',
    skillFocus: 'Run cycle momentum, anticipation before takeoff, hang-time arc & landing compression',
    livingLinesNote: 'Drive the line-of-action forward at 55° during the sprint; stretch full body along the parabolic jump arc.',
    defaultSlots: {
      protagonist: 'A nimble rooftop courier cornered in a rain-slicked service alley with sirens closing in',
      activity: 'sprinting full-tilt toward the alley exit while red-and-blue strobe lights ripple off wet brick walls',
      complication: 'a patrol cruiser fishtails broadside across the alley mouth ahead while flashlight beams converge from behind',
      emotionArc: 'High-Speed Focus → Split-Second Calculation → Explosive Vertical Commitment',
      actingCue: 'Skid boots through a puddle to redirect forward momentum upward off a rolling dumpster lid.',
      cinemaStyle: 'Film-Grab cyberpunk rain contrast; Tuts+ low-angle whip pan into a fast vertical crane/arc orbit',
      payoff: 'they kick off the brick wall, vault the dumpster to snag a counterweighted fire escape ladder, and vanish over the roofline'
    }
  },
  {
    id: 'ex-shutter-slide',
    num: 51,
    title: 'Sliding Under a Closing Security Shutter',
    tier: 'kinetic',
    skillFocus: 'High-speed transition from upright sprint to low baseball slide, secondary cloth/prop follow-through',
    livingLinesNote: 'Drop center of gravity in 4 frames; trail the satchel/coat behind the torso and snap it back on the recovery roll.',
    defaultSlots: {
      protagonist: 'A late-night museum restorer locked inside as automated steel security gates begin dropping',
      activity: 'racing down a polished marble corridor toward the last descending exit shutter',
      complication: 'their keycard lanyard snags on a velvet stanchion post and pops loose three meters before the gate',
      emotionArc: 'Urgent Sprint → Desperate Snatch → Razor-Thin Slide Victory',
      actingCue: 'Dive low into a heel-first slide, snatching the skittering keycard off the marble floor mid-glide.',
      cinemaStyle: 'Tuts+ tracking truck shot parallel to the runner, cutting to a ground-level CU as the shutter slams down behind their boots',
      payoff: 'they slide clear under the gap with two inches to spare, rolling onto their feet outside as the heavy gate thuds shut'
    }
  }
];

// Combinable Plot Generator Slot Pools (plot-generator.org.uk + perchance.org/emotion + Tuts+ + Film-Grab)
export const PLOT_SLOT_POOLS = {
  mundane: {
    protagonists: [
      'A groggy commuter running 90 seconds late for the 8:02 express bus',
      'A meticulouswatchmaker working at a sun-drenched wooden bench',
      'A sleep-deprived parent trying to leave the house with two full coffee mugs',
      'An apprentice baker carrying a freshly glazed tray across a freshly mopped floor',
      'A stubborn traveler trying to zip an overstuffed carry-on suitcase'
    ],
    activities: [
      'pulling a frayed cotton shoelace tight on the entryway bench (#14 Shoe Tying Drill)',
      'pouring the very last measured drop from a heavy ceramic pitcher (#11 Weight & Pour Drill)',
      'lifting a deceptively heavy crate off the doorstep (#19 Heavy Lift Drill)',
      'pulling open a rain-swollen wooden front door with one free hand (#27 Stuck Door Drill)',
      'threading a tiny sewing needle while a wall clock ticks loudly (#08 Micro-Precision Drill)'
    ],
    complications: [
      'the crucial lace or handle snaps right as their transport air-brakes hiss outside',
      'a sudden radiator hiss or sneeze causes a chain-reaction wobble at the worst millisecond',
      'the object sticks fast, then releases all at once with double the expected recoil',
      'their sleeve catches on the latch just as the morning alarm chimes from the next room'
    ],
    emotionArcs: [
      'Groggy Routine → Sudden Micro-Panic → Improvised Confidence',
      'Patient Focus → Rising Frustration → Quiet Satisfied Exhale',
      'Casual Overconfidence → Startled Recovery → Humble Precision',
      'Drowsy Indifference → Hyper-Focused Determination → Warm Relief'
    ],
    actingCues: [
      'Hold 10 frames of complete stillness after the snap; lead the recovery with a quick eye dart before the head turns.',
      'Let the shoulders drop 3 inches on a long exhale before the hands execute the clever one-second workaround.',
      'Use a double-take blink (2 frames closed, 4 frames wide open) before shifting weight onto the front foot.',
      'Keep the spine curved in a heavy C-line of action until the final victorious pop into a tall S-curve.'
    ],
    cinemaStyles: [
      'Film-Grab Golden Hour doorway backlight; Tuts+ MS establishing into an 85mm ECU tactile insert cut',
      'Intimate over-the-shoulder staging with shallow depth-of-field and a crisp rack focus to the doorway',
      'Warm analog 35mm table-level framing with a slow dolly push-in on the hands',
      'Living Lines high-contrast silhouette staging against a bright frosted window'
    ],
    payoffs: [
      'they loop the broken stub through the bottom eyelet, bite their toast, and stride out into crisp morning sunlight',
      'a gentle two-finger tap accomplishes effortlessly what ten seconds of pulling could not',
      'they pivot with surprising grace, catching the slipping prop right on beat and stepping out the door',
      'they embrace the imperfect fix, check their watch with a crooked grin, and bound down the steps'
    ]
  },
  slice: {
    protagonists: [
      'An overtime studio designer down to their last quarter at 11:45 PM',
      'A composed street-food patron trying to look sophisticated in front of the chef',
      'A midnight snack hunter tiptoeing across a creaky moonlit hallway',
      'A shy commuter trying to retrieve a runaway paper ticket in a breezy plaza',
      'A proud dog walker holding three tangled leashes and an ice cream cone'
    ],
    activities: [
      'dueling a humming vending machine for a dangling chocolate bar (#33 Emotion Shift Drill)',
      'taking a polite first bite of a deceptively volcanic chili dumpling (#38 Delayed Reaction Drill)',
      'stepping over a loud hardwood floorboard while balancing a stack of pancakes (#42 Sneak & Freeze Drill)',
      'reaching under a low café table for a rolled coin without bumping the table leg (#24 Reach & Balance Drill)',
      'trying to silently open a crinkly snack wrapper during a dead-quiet waiting room pause (#35 Subtext Acting Drill)'
    ],
    complications: [
      'the spiral coil stops two millimeters short, leaving the prize leaning against the glass on a cliffhanger',
      'an unexpected onlooker turns a private fumble into a high-pride silent performance',
      'a 1.5-second delayed physical reaction strikes right as someone asks if everything is okay',
      'each careful correction triggers a louder creak that freezes every muscle in their body'
    ],
    emotionArcs: [
      'Hopeful Anticipation → Petty Outrage → Defeated Surrender → Accidental Jackpot',
      'Polite Composure → Internal Alarm → Frantic Disguised Scramble → Relieved Bow',
      'Laser Stealth → Frozen Suspense → Improvised Statue Pose → Smooth Escape',
      'Quiet Pride → Escalating Embarrassment → Deadpan Ownership'
    ],
    actingCues: [
      'Lead every thought change with an eye dart 4 frames ahead of the head turn; slump spine against the glass before the final tap.',
      'Hold a one-legged crane balance pose for 14 frames while only the eyebrows and pupils move.',
      'Contrast a heavy, full-body slam that does nothing with a tiny, defeated index-finger tap.',
      'Freeze the polite smile on the mouth while the eyes widen and one hand searches blindly out of frame.'
    ],
    cinemaStyles: [
      'Film-Grab Wes Anderson deadpan center symmetry; Tuts+ static WS cut to a tight 85mm ECU on the coil',
      'Low-key fluorescent breakroom chiaroscuro with a slow tension dolly push-in and sudden dutch tilt',
      'Tuts+ two-shot OTS framing with a rack focus from foreground prop to background reaction',
      'Venetian-blind shadow stripes with a low worm’s-eye close-up on the hovering foot'
    ],
    payoffs: [
      'a defeated one-finger tap triggers a delayed shudder that drops three snacks into the tray at once',
      'they execute a deadpan recovery bow that convinces everyone the entire spectacle was intentional',
      'they freeze into an absurd coat-rack silhouette until the coast clears, then glide off with the prize',
      'an unlikely truce is sealed with a single shared nod before they stroll out of frame'
    ]
  },
  kinetic: {
    protagonists: [
      'A nimble rooftop courier cornered in a rain-slicked service alley with sirens closing in',
      'A late-night restorer racing down a marble corridor as automated security shutters drop',
      'A skateboard messenger weaving through a neon night-market blockade',
      'A runaway hover-bike mechanic pursued by spotlight patrol drones across a container yard',
      'A train-top courier sprinting to catch a departing express car before the tunnel entrance'
    ],
    activities: [
      'sprinting toward a blocked alley exit and vaulting a dumpster to a fire escape (#49 Parkour Vault Drill)',
      'diving into a low heel-first slide under a rapidly descending steel shutter (#51 High-Speed Slide Drill)',
      'wall-running off a wet brick pillar to dodge a sweeping spotlight beam (#47 Evasion & Pivot Drill)',
      'leaping a rain-flooded gap between two shipping containers with a heavy satchel (#45 Long Jump Arc Drill)',
      'kick-turning off a barricade hood to reverse direction mid-pursuit (#50 Momentum Reversal Drill)'
    ],
    complications: [
      'a patrol cruiser fishtails broadside across the exit ahead while flashlight beams converge from behind',
      'their footing slips on wet asphalt three meters before the takeoff mark as the gap narrows',
      'a dropped keycard or satchel strap snags on a rail, forcing a split-second mid-slide snatch',
      'twin searchlights lock onto the primary ladder, forcing an improvised counterweight vault'
    ],
    emotionArcs: [
      'High-Speed Focus → Split-Second Calculation → Explosive Vertical Commitment → Cool Disappearance',
      'Adrenaline Urgency → Sudden Near-Miss Shock → Razor-Thin Slide Victory',
      'Cornered Tension → Audacious Improvisation → Weightless Hang-Time Triumph',
      'Relentless Momentum → Mid-Air Adaptation → Calm Rooftop Exhale'
    ],
    actingCues: [
      'Drive line-of-action forward at 55° during the sprint; hold 4 extra frames of hang-time at the apex of the vault.',
      'Compress knees deep for 5 frames before takeoff and trail the satchel/coat behind the torso for clear follow-through.',
      'Snap head toward the new vertical exit 6 frames before the boots skid and redirect momentum.',
      'Contrast frantic rapid-cut footwork in shots 1–4 with a slow, calm silhouette roll on the final wide shot.'
    ],
    cinemaStyles: [
      'Film-Grab cyberpunk neon rain reflection; Tuts+ worm’s-eye 24mm puddle splash → whip pan → crane up',
      'Anamorphic high-contrast headlight silhouette with handheld OTS follow and 35mm arc orbit around the vault',
      'Tuts+ lateral tracking truck shot parallel to the sprint, cutting to a ground-plane CU as the barrier slams shut',
      'High bird’s-eye crane pull-back revealing the empty neon alley below as the runner vanishes into shadow'
    ],
    payoffs: [
      'they kick off the brick wall, vault the dumpster to snag the counterweighted ladder, and vanish over the roofline',
      'they snatch the skittering item mid-slide and clear the descending steel shutter with two inches to spare',
      'the counterweight drops the ladder just long enough to launch them onto the parapet as cruisers screech below',
      'they roll onto their feet on the far platform, tip a two-finger salute into the rain, and disappear into the neon fog'
    ]
  }
};

export const STARTER_PRESETS = [
  {
    id: 'preset-shoes',
    title: 'The Morning Knot (Tying Shoes & Starting the Day)',
    tier: 'mundane',
    exerciseId: 'ex-shoe-tie',
    logline:
      'A groggy commuter fights a frayed shoelace that snaps right as the 8:02 bus pulls up outside, forcing an improvised one-loop hack and a sprint into the morning sun.',
    theme: 'Everyday resilience & tactile morning rhythm (#14 Shoe Tying Drill)',
    hook: '85mm macro tension on a frayed cotton shoelace pulled taut like a bomb-defusal wire while a wall clock ticks at 07:59.',
    conflict: 'The right lace snaps in half the exact millisecond the 8:02 express bus air-brakes hiss outside the frosted glass door.',
    resolution:
      'After a 10-frame disbelief freeze, they thread the short stub through the bottom eyelet, clamp their toast in their teeth, and burst out the door into golden sunlight.',
    plotSlots: { ...ANIMATION_EXERCISES[0].defaultSlots },
    characters: [
      {
        id: 'char-1',
        name: 'Leo',
        archetype: 'Sleep-Deprived Commuter',
        shape: 'circle',
        bodyType: 'tall',
        silhouette: 'Circle shape (Friendly · Soft · Organic) · Tall build (2.05m)',
        motivation: 'Catch the 8:02 bus without spilling coffee',
        quirk: 'Taps left foot impatiently when concentrating; eyes dart 4f before head turns',
        colorHex: '#F59E0B',
        scale: [0.82, 0.82, 2.05]
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
        action: 'Leo sits hunched in a heavy C-curve on the entryway bench, yawning as one sneaker dangles from his fingertips.',
        dialogue: '(Yawn) "Five minutes... plenty of time."',
        soundCue: 'Muffled city traffic + rhythmic wall clock tick',
        subjectPos: [0, 0, 0],
        camStart: [0, -3.8, 1.4],
        camEnd: [0, -2.9, 1.35],
        compositionType: 'rule-of-thirds',
        notes: 'Living Lines: Heavy C-curve spine; Tuts+ slow dolly push-in establishes sleepy rhythm.'
      },
      {
        id: 'shot-2',
        number: 2,
        title: 'Tactile Insert: The Frayed Lace Snap',
        shotType: 'ECU',
        shotTypeName: 'Extreme Close-Up',
        cameraAngle: 'High Angle',
        cameraMove: 'Static Locked',
        focalLength: 85,
        duration: 2.0,
        action: 'Tuts+ Insert Cut: Fingers pull the frayed shoelace tight—cotton fibers stretch in macro detail until SNAP!',
        dialogue: '"Come on, hold together—"',
        soundCue: 'High-tension creak → sharp guitar-string SNAP!',
        subjectPos: [0, 0, 0],
        camStart: [0.4, -1.5, 1.1],
        camEnd: [0.4, -1.5, 1.1],
        compositionType: 'center-macro',
        notes: 'Hold 12 frames on taut lace tension before a 2-frame recoil overshoot.'
      },
      {
        id: 'shot-3',
        number: 3,
        title: 'Bus Air-Brakes & Eye-Dart Reaction',
        shotType: 'CU',
        shotTypeName: 'Close-Up',
        cameraAngle: 'Low Angle',
        cameraMove: 'Whip Pan',
        focalLength: 28,
        duration: 1.8,
        action: 'Perchance Subtext (Routine → Panic): Leo freezes staring at the stub as orange bus headlights sweep across the frosted door glass.',
        dialogue: '"No no no—that\'s the 8:02!"',
        soundCue: 'Pneumatic bus air-brake hiss + double horn tap',
        subjectPos: [0, 0, 0],
        camStart: [-1.2, -2.2, 0.7],
        camEnd: [0.8, -2.0, 0.9],
        compositionType: 'diagonal-tension',
        notes: 'Lead with eyes darting toward door 4 frames before the head and torso snap around.'
      },
      {
        id: 'shot-4',
        number: 4,
        title: 'Improvised Knot & Golden Door Burst',
        shotType: 'WS',
        shotTypeName: 'Wide Shot',
        cameraAngle: 'Dutch Tilt',
        cameraMove: 'Tracking Dolly',
        focalLength: 24,
        duration: 3.0,
        action: 'Leo loops the stub into the lowest eyelet, snatches his mug, and flings the door open into a bright shaft of morning sun.',
        dialogue: '"Wait for me!"',
        soundCue: 'Door latch click + upbeat acoustic strum kicks in',
        subjectPos: [0, 1.2, 0],
        camStart: [-2.5, -4.5, 1.6],
        camEnd: [0.5, -2.5, 1.8],
        compositionType: 'doorway-frame',
        notes: 'Film-Grab silhouette contrast against bright doorway backlight; strong S-curve exit stride.'
      }
    ]
  },
  {
    id: 'preset-cops',
    title: 'Neon Alley Pursuit (Chased by Cops & Trying to Get Away)',
    tier: 'kinetic',
    exerciseId: 'ex-alley-pursuit',
    logline:
      'Cornered in a rain-slicked service alley with sirens closing in from both ends, a nimble courier uses a rolling dumpster and a counterweighted fire escape to vanish vertical.',
    theme: 'Improvisation & momentum under high-pressure pursuit (#49 Obstacle Vault Drill)',
    hook: 'Red-and-blue strobe lights rippling in an asphalt puddle right before a boot splashes straight through the 24mm low-angle lens.',
    conflict: 'A patrol cruiser fishtails broadside across the alley mouth ahead while flashlight beams and footsteps converge from behind.',
    resolution:
      'The courier kicks off the wet brick wall, vaults the dumpster lid to snag the counterweighted fire escape ladder, and rolls over the neon roofline as cruisers screech below.',
    plotSlots: { ...ANIMATION_EXERCISES[6].defaultSlots },
    characters: [
      {
        id: 'char-1',
        name: 'Jax',
        archetype: 'Rooftop Courier on the Run',
        shape: 'triangle',
        bodyType: 'thin',
        silhouette: 'Triangle shape (Agile · Sharp · Dynamic) · Thin build (1.85m)',
        motivation: 'Break line-of-sight before the alley perimeter locks down',
        quirk: 'Checks wrist timer mid-sprint; leads direction changes with sharp head snaps',
        colorHex: '#38BDF8',
        scale: [0.54, 0.54, 1.85]
      },
      {
        id: 'char-2',
        name: 'Interceptor Unit 04',
        archetype: 'Pursuing Patrol Officer / Cruiser',
        shape: 'square',
        bodyType: 'wide',
        silhouette: 'Square shape (Sturdy · Grounded · Stubborn) · Wide build (1.65m)',
        motivation: 'Box the runner into the dead-end service alley',
        quirk: 'Sweeping spotlight beam cuts across wet brick walls',
        colorHex: '#F43F5E',
        scale: [1.55, 1.15, 1.65]
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
        title: 'Worm’s-Eye Puddle Siren Splash',
        shotType: 'CU',
        shotTypeName: 'Close-Up',
        cameraAngle: "Low Worm's-Eye",
        cameraMove: 'Static Locked',
        focalLength: 24,
        duration: 1.5,
        action: 'Red and blue siren strobes ripple in a dark puddle. Jax’s boot slams through the water in a 3-frame impact burst.',
        dialogue: '(Sharp ragged inhale)',
        soundCue: 'Wailing siren Doppler + sharp water splash',
        subjectPos: [0, -1.5, 0],
        camStart: [0.6, -3.0, 0.35],
        camEnd: [0.6, -3.0, 0.35],
        compositionType: 'low-impact',
        notes: 'Tuts+ Worm’s-Eye 24mm lens near ground plane for maximum perspective distortion.'
      },
      {
        id: 'shot-2',
        number: 2,
        title: 'OTS Handheld Alley Sprint',
        shotType: 'OTS',
        shotTypeName: 'Over-the-Shoulder',
        cameraAngle: 'Dutch Tilt',
        cameraMove: 'Handheld Follow',
        focalLength: 28,
        duration: 2.2,
        action: 'Camera tracks tightly behind Jax’s trailing satchel as flashlight beams sweep across wet brick walls.',
        dialogue: 'DISPATCH (V.O.): "Suspect heading north down Mercer Alley—box him in!"',
        soundCue: 'Rapid wet footsteps + police radio squelch',
        subjectPos: [0, 0, 0],
        camStart: [-1.1, -3.5, 1.5],
        camEnd: [-0.4, -1.2, 1.4],
        compositionType: 'leading-lines',
        notes: 'Living Lines: 55° forward sprint lean; satchel trails 3 frames behind torso.'
      },
      {
        id: 'shot-3',
        number: 3,
        title: 'Cruiser Barricade Blocks the Exit',
        shotType: 'WS',
        shotTypeName: 'Wide Shot',
        cameraAngle: 'Low Angle',
        cameraMove: 'Fast Crane Up',
        focalLength: 35,
        duration: 2.0,
        action: 'At the alley mouth, a patrol cruiser fishtails broadside across the exit, high-beams silhouetting Jax as he skids to a halt.',
        dialogue: 'JAX: "Dead end... alright, we go up."',
        soundCue: 'Tire screech on wet asphalt + high-beam hum',
        subjectPos: [0, 2.0, 0],
        camStart: [0, -4.5, 0.8],
        camEnd: [0, -3.2, 2.2],
        compositionType: 'silhouette-block',
        notes: 'Film-Grab noir silhouette against cruiser headlights; 6-frame knee compression on skid stop.'
      },
      {
        id: 'shot-4',
        number: 4,
        title: 'Dumpster Vault to Fire Escape Ladder',
        shotType: 'MS',
        shotTypeName: 'Medium Shot',
        cameraAngle: 'Low Angle',
        cameraMove: 'Arc Orbit',
        focalLength: 35,
        duration: 2.4,
        action: 'Jax kicks off the brick wall, vaults off the rolling dumpster lid, and stretches along a parabolic arc to snag the iron ladder.',
        dialogue: 'OFFICER: "Hold it right there!"',
        soundCue: 'Hollow metallic dumpster clang + screeching counterweight chain',
        subjectPos: [1.2, 1.5, 1.2],
        camStart: [-2.2, -1.5, 1.0],
        camEnd: [2.4, -1.0, 2.6],
        compositionType: 'vertical-arc',
        notes: 'Exercise #49 Vault: Hold 4 frames of hang-time at apex before hands snap onto the rung.'
      },
      {
        id: 'shot-5',
        number: 5,
        title: 'High Bird’s-Eye Rooftop Disappearance',
        shotType: 'EWS',
        shotTypeName: 'Extreme Wide Shot',
        cameraAngle: "High Bird's-Eye",
        cameraMove: 'Slow Pull-Back',
        focalLength: 50,
        duration: 2.8,
        action: 'From high above the neon parapet, Jax rolls into rooftop shadow while flashlight beams crisscross the empty puddle-strewn alley below.',
        dialogue: 'JAX (exhaling): "Better luck next shift."',
        soundCue: 'High rooftop wind overtakes distant sirens',
        subjectPos: [0, 2.5, 3.2],
        camStart: [0.5, -1.0, 5.2],
        camEnd: [1.5, -4.5, 6.8],
        compositionType: 'high-isolation',
        notes: 'Tuts+ high-angle dolly pull-back contrasts the earlier claustrophobic cuts.'
      }
    ]
  },
  {
    id: 'preset-vending',
    title: 'Coin vs. Vending Machine (Slice-of-Life Escalation)',
    tier: 'slice',
    exerciseId: 'ex-emotion-shift',
    logline:
      'An overtime designer’s last quarter gets stuck in a humming breakroom vending machine, sparking an escalating silent duel with a dangling caramel bar.',
    theme: 'Stubbornness & emotional subtext over small rewards (#33 Emotion Shift Drill)',
    hook: 'A single shiny quarter spinning on glass before dropping into the slot—followed by a hollow clunk and zero snack movement.',
    conflict: 'The metal spiral coil rotates 350 degrees and stops 2 millimeters short, leaving the snack suspended at a 45° angle.',
    resolution:
      'After a dramatic full-body hip-check does nothing, a defeated one-finger tap triggers a delayed cascade of three bars at once.',
    plotSlots: { ...ANIMATION_EXERCISES[3].defaultSlots },
    characters: [
      {
        id: 'char-1',
        name: 'Maya',
        archetype: 'Overtime Studio Designer',
        shape: 'circle',
        bodyType: 'round',
        silhouette: 'Circle shape (Friendly · Soft · Organic) · Round build (1.45m)',
        motivation: 'Claim the last caramel bar on row B-4 at 11:45 PM',
        quirk: 'Squints like a cowboy in a western standoff before pressing buttons',
        colorHex: '#A855F7',
        scale: [1.42, 1.42, 1.45]
      }
    ],
    environment: {
      name: 'Fluorescent Breakroom Corridor',
      settingType: 'Interior · Late Night Office',
      timeOfDay: '11:45 PM Buzzing Fluorescent',
      props: ['Glowing Vending Machine', 'Plastic Breakroom Chair', 'Potted Fern', 'Recycling Bin'],
      groundColor: '#1E293B',
      horizonColor: '#0F172A'
    },
    moodKey: 'dark',
    shots: [
      {
        id: 'shot-1',
        number: 1,
        title: 'Symmetrical Standoff in the Glow',
        shotType: 'WS',
        shotTypeName: 'Wide Shot',
        cameraAngle: 'Eye-Level',
        cameraMove: 'Static Locked',
        focalLength: 35,
        duration: 2.2,
        action: 'Maya stands centered in a dark corridor, bathed only in the humming rectangular glow of the vending machine.',
        dialogue: '"B-4. Do not betray me tonight."',
        soundCue: '60Hz fluorescent hum + coin slot clink',
        subjectPos: [0, 0, 0],
        camStart: [0, -4.2, 1.5],
        camEnd: [0, -4.2, 1.5],
        compositionType: 'center-symmetry',
        notes: 'Film-Grab Wes Anderson deadpan symmetry; hold stillness before the coin drop.'
      },
      {
        id: 'shot-2',
        number: 2,
        title: 'Macro Insert: The Coil Betrayal',
        shotType: 'ECU',
        shotTypeName: 'Extreme Close-Up',
        cameraAngle: 'Eye-Level',
        cameraMove: 'Slow Push-In',
        focalLength: 85,
        duration: 2.4,
        action: 'Behind the glass, the metal coil turns... nudges the wrapper edge... and stops dead with the bar leaning precariously.',
        dialogue: '"Are you kidding me?!"',
        soundCue: 'Mechanical servo whine stops abruptly',
        subjectPos: [0, 1.1, 1.3],
        camStart: [0, -1.2, 1.35],
        camEnd: [0, -0.8, 1.35],
        compositionType: 'center-macro',
        notes: 'Give the dangling bar a tiny 3-frame secondary wobble so it feels tauntingly alive.'
      },
      {
        id: 'shot-3',
        number: 3,
        title: 'Western Squint & Escalating Glare',
        shotType: 'CU',
        shotTypeName: 'Close-Up',
        cameraAngle: 'Low Angle',
        cameraMove: 'Slow Push-In',
        focalLength: 50,
        duration: 1.9,
        action: 'Perchance Emotion Shift (Hope → Petty Outrage): Maya’s glasses reflect the coil as her brows compress into a determined squint.',
        dialogue: '"Oh, so that’s how we’re playing it."',
        soundCue: 'Low western timpani rumble + glasses bridge tap',
        subjectPos: [0, 0.2, 0],
        camStart: [-0.4, -1.7, 1.25],
        camEnd: [-0.2, -1.4, 1.3],
        compositionType: 'rule-of-thirds',
        notes: 'Exercise #33: Lead emotion change with eye narrowing 4f before the head tilts forward.'
      },
      {
        id: 'shot-4',
        number: 4,
        title: 'The Heavy Hip-Check vs. One-Finger Jackpot',
        shotType: 'MS',
        shotTypeName: 'Medium Shot',
        cameraAngle: 'Low Angle',
        cameraMove: 'Whip Pan',
        focalLength: 28,
        duration: 3.1,
        action: 'Maya hip-checks the machine—nothing. Defeated, she slumps her forehead against the glass and taps once with her index finger. Three bars cascade down.',
        dialogue: '"...I’ll take it."',
        soundCue: 'Heavy thud → 1.2s silence → tiny glass tap → jackpot cascade!',
        subjectPos: [0, 0.5, 0],
        camStart: [-1.6, -2.6, 0.9],
        camEnd: [-1.1, -2.3, 1.1],
        compositionType: 'rule-of-thirds',
        notes: 'Hold a full 28-frame comedic beat between the heavy slam and the tiny finger tap.'
      }
    ]
  }
];

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
    blenderBgColor: [0.03, 0.05, 0.1],
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
    blenderBgColor: [0.65, 0.72, 0.8],
    keyEnergy: 5.5,
    fillEnergy: 3.5
  }
};

export const CAMERA_SHOT_TYPES = [
  { code: 'EWS', name: 'Extreme Wide Shot (Establishing)', defaultFocal: 20, dist: 6.0, zOffset: 2.8 },
  { code: 'WS', name: 'Wide Shot (Full Body Staging)', defaultFocal: 24, dist: 4.4, zOffset: 1.6 },
  { code: 'MS', name: 'Medium Shot (Waist-Up Acting)', defaultFocal: 35, dist: 2.8, zOffset: 1.35 },
  { code: 'CU', name: 'Close-Up (Emotion / Subtext)', defaultFocal: 50, dist: 1.7, zOffset: 1.45 },
  { code: 'ECU', name: 'Extreme Close-Up (Tactile Insert)', defaultFocal: 85, dist: 1.15, zOffset: 1.1 },
  { code: 'OTS', name: 'Over-the-Shoulder (Spatial Link)', defaultFocal: 28, dist: 2.4, zOffset: 1.5 }
];

export const CAMERA_ANGLES = [
  'Eye-Level',
  'Low Angle',
  "Low Worm's-Eye",
  'High Angle',
  "High Bird's-Eye",
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
    synthPreset: { style: 'lofi', rootFreq: 220, scale: [0, 4, 7, 11, 14], tempo: 92, warmth: 0.8 }
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
    synthPreset: { style: 'chase', rootFreq: 110, scale: [0, 3, 5, 7, 10], tempo: 138, warmth: 0.2 }
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
    synthPreset: { style: 'quirky', rootFreq: 146.83, scale: [0, 2, 3, 7, 8], tempo: 108, warmth: 0.5 }
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
    synthPreset: { style: 'airy', rootFreq: 261.63, scale: [0, 2, 4, 7, 9], tempo: 116, warmth: 0.9 }
  }
];

const pickRandom = (arr, avoid) => {
  if (!arr || !arr.length) return '';
  if (arr.length === 1) return arr[0];
  const candidates = avoid ? arr.filter((x) => x !== avoid) : arr;
  return candidates[Math.floor(Math.random() * candidates.length)] || arr[0];
};

// Roll or reroll individual plot slots while respecting locked slots!
export function rollPlotSlots(tier = 'mundane', currentSlots = {}, lockedSlots = {}) {
  const pool = PLOT_SLOT_POOLS[tier] || PLOT_SLOT_POOLS.mundane;
  return {
    protagonist: lockedSlots.protagonist && currentSlots.protagonist
      ? currentSlots.protagonist
      : pickRandom(pool.protagonists, currentSlots.protagonist),
    activity: lockedSlots.activity && currentSlots.activity
      ? currentSlots.activity
      : pickRandom(pool.activities, currentSlots.activity),
    complication: lockedSlots.complication && currentSlots.complication
      ? currentSlots.complication
      : pickRandom(pool.complications, currentSlots.complication),
    emotionArc: lockedSlots.emotionArc && currentSlots.emotionArc
      ? currentSlots.emotionArc
      : pickRandom(pool.emotionArcs, currentSlots.emotionArc),
    actingCue: lockedSlots.actingCue && currentSlots.actingCue
      ? currentSlots.actingCue
      : pickRandom(pool.actingCues, currentSlots.actingCues),
    cinemaStyle: lockedSlots.cinemaStyle && currentSlots.cinemaStyle
      ? currentSlots.cinemaStyle
      : pickRandom(pool.cinemaStyles, currentSlots.cinemaStyle),
    payoff: lockedSlots.payoff && currentSlots.payoff
      ? currentSlots.payoff
      : pickRandom(pool.payoffs, currentSlots.payoff)
  };
}

// Synthesize a complete story project + Tuts+ camera breakdown from Plot Slots or an Exercise Drill
export function buildStoryFromSlots(tier = 'mundane', slots, customTitle = '') {
  const s = slots || rollPlotSlots(tier);
  const cleanAct = s.activity.replace(/\(#\d+[^)]*\)/g, '').trim();
  const drillTag = (s.activity.match(/\(#\d+[^)]*\)/) || [''])[0];
  const emotionStages = (s.emotionArc || 'Focus → Friction → Triumph').split('→').map((x) => x.trim());

  const autoTitle =
    customTitle.trim() ||
    cleanAct
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .filter((w) => w.length > 2 && !/^(the|and|for|with|from|into|over|under|while)$/i.test(w))
      .slice(0, 4)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ') ||
    'Untitled Animation Study';

  const moodKey = tier === 'kinetic' ? 'cold' : tier === 'slice' ? 'dark' : 'warm';
  const now = Date.now();

  const shots = [
    {
      id: `shot-${now}-1`,
      number: 1,
      title: `Establishing Staging (${emotionStages[0] || 'Setup'})`,
      shotType: tier === 'kinetic' ? 'OTS' : 'MS',
      shotTypeName: tier === 'kinetic' ? 'Over-the-Shoulder' : 'Medium Shot',
      cameraAngle: tier === 'kinetic' ? 'Dutch Tilt' : 'Eye-Level',
      cameraMove: tier === 'kinetic' ? 'Handheld Follow' : 'Slow Push-In',
      focalLength: tier === 'kinetic' ? 28 : 35,
      duration: 2.3,
      action: `${s.protagonist} begins ${cleanAct}. Clear silhouette establishes posture and center of gravity.`,
      dialogue:
        tier === 'kinetic'
          ? '(Breathless) "Stay on pace—almost clear!"'
          : '"Alright... one clean motion."',
      soundCue:
        tier === 'kinetic'
          ? 'Rhythmic sprint footsteps + distant siren swell'
          : 'Tactile room tone + cloth & prop contact',
      subjectPos: [0, 0, 0],
      camStart: [-1.3, -3.9, 1.45],
      camEnd: [-0.7, -2.9, 1.38],
      compositionType: 'rule-of-thirds',
      notes: `Living Lines: Establish clear line-of-action. ${s.cinemaStyle}`
    },
    {
      id: `shot-${now}-2`,
      number: 2,
      title: 'Tuts+ Insert Cut: The Point of Friction',
      shotType: 'ECU',
      shotTypeName: 'Extreme Close-Up',
      cameraAngle: tier === 'kinetic' ? "Low Worm's-Eye" : 'High Angle',
      cameraMove: 'Static Locked',
      focalLength: 85,
      duration: 1.9,
      action: `85mm Macro Insert on the exact contact point right as ${s.complication}.`,
      dialogue: '"Wait—hold on—!"',
      soundCue: 'Sharp mechanical snap / skid impact',
      subjectPos: [0, 0.3, 0],
      camStart: [0.45, -1.45, tier === 'kinetic' ? 0.45 : 1.15],
      camEnd: [0.45, -1.45, tier === 'kinetic' ? 0.45 : 1.15],
      compositionType: 'center-macro',
      notes: 'Hold 10 frames of anticipation tension before the 3-frame impact recoil.'
    },
    {
      id: `shot-${now}-3`,
      number: 3,
      title: `Subtext Reaction (${emotionStages[1] || 'Shift'})`,
      shotType: 'CU',
      shotTypeName: 'Close-Up',
      cameraAngle: 'Low Angle',
      cameraMove: tier === 'kinetic' ? 'Whip Pan' : 'Slow Push-In',
      focalLength: 50,
      duration: 2.0,
      action: `Perchance Emotion Shift (${s.emotionArc}): ${s.actingCue}`,
      dialogue:
        tier === 'kinetic'
          ? '"Exit’s blocked—we go vertical!"'
          : '"...Okay. Plan B."',
      soundCue: 'Sudden 12-frame silence beat → rising pulse',
      subjectPos: [0, 0.5, 0],
      camStart: [-1.0, -2.0, 0.9],
      camEnd: [0.7, -1.8, 1.05],
      compositionType: 'diagonal-tension',
      notes: `Acting Subtext: ${s.actingCue}`
    },
    {
      id: `shot-${now}-4`,
      number: 4,
      title: `The Payoff Beat (${emotionStages[emotionStages.length - 1] || 'Release'})`,
      shotType: 'WS',
      shotTypeName: 'Wide Shot',
      cameraAngle: tier === 'kinetic' ? 'Low Angle' : 'Eye-Level',
      cameraMove: tier === 'kinetic' ? 'Arc Orbit' : 'Tracking Dolly',
      focalLength: 24,
      duration: 2.7,
      action: `In one decisive motion, ${s.payoff}.`,
      dialogue:
        tier === 'kinetic'
          ? '(Exhaling) "Catch you next shift."'
          : '"Nailed it."',
      soundCue: 'Crisp physical release + upbeat music hit',
      subjectPos: [0, 1.3, tier === 'kinetic' ? 1.1 : 0],
      camStart: [-2.1, -4.0, 1.3],
      camEnd: [0.8, -2.4, 1.75],
      compositionType: 'doorway-frame',
      notes: 'Living Lines: Exaggerate overshoot by 4 frames before settling into the final exit silhouette.'
    }
  ];

  // For kinetic tier, add a 5th high bird's-eye release shot
  if (tier === 'kinetic') {
    shots.push({
      id: `shot-${now}-5`,
      number: 5,
      title: 'High-Angle Aftermath & Escape Silhouette',
      shotType: 'EWS',
      shotTypeName: 'Extreme Wide Shot',
      cameraAngle: "High Bird's-Eye",
      cameraMove: 'Slow Pull-Back',
      focalLength: 50,
      duration: 2.5,
      action: 'Camera pulls back high above the set as the protagonist slips into shadow, leaving the obstacle behind in the wide frame.',
      dialogue: '',
      soundCue: 'Wind gust overtakes distant echo',
      subjectPos: [0, 2.4, 2.8],
      camStart: [0.5, -1.2, 4.8],
      camEnd: [1.4, -4.4, 6.4],
      compositionType: 'high-isolation',
      notes: 'Tuts+ high bird’s-eye dolly pull-back gives breathing room after rapid action cuts.'
    });
  }

  return {
    id: `story-${now}`,
    title: autoTitle,
    tier,
    logline: `${s.protagonist} is ${cleanAct}, when ${s.complication}—until ${s.payoff}.`,
    theme: `${s.emotionArc} ${drillTag}`.trim(),
    hook: `Open on the tactile mechanics of ${cleanAct} (${s.cinemaStyle}).`,
    conflict: `Mid-motion, ${s.complication}. Acting cue: ${s.actingCue}`,
    resolution: `Shifting through ${s.emotionArc}, ${s.payoff}.`,
    plotSlots: s,
    characters: [
      {
        id: 'char-1',
        name: tier === 'kinetic' ? 'Jax' : tier === 'slice' ? 'Maya' : 'Leo',
        archetype: s.protagonist.slice(0, 64),
        silhouette:
          tier === 'kinetic'
            ? 'Lean athletic capsule, windbreaker & trailing satchel for follow-through'
            : 'Expressive rounded torso with distinct collar & clear head-tilt silhouette',
        motivation: `Complete ${cleanAct} despite the sudden setback`,
        quirk: s.actingCue,
        colorHex: tier === 'kinetic' ? '#38BDF8' : tier === 'slice' ? '#A855F7' : '#F59E0B',
        scale: [0.85, 0.85, 1.75]
      }
    ],
    environment: {
      name:
        tier === 'kinetic'
          ? 'Rain-Slicked Urban Service Corridor'
          : tier === 'slice'
          ? 'Late-Night Fluorescent Hallway'
          : 'Sunlit Apartment Threshold',
      settingType: tier === 'kinetic' ? 'Exterior · Night Alley' : 'Interior · Character Staging Set',
      timeOfDay:
        tier === 'kinetic'
          ? '01:15 AM Neon & Strobe Contrast'
          : tier === 'slice'
          ? '11:45 PM Low-Key Glow'
          : '08:00 AM Golden Backlight',
      props:
        tier === 'kinetic'
          ? ['Rolling Metal Dumpster', 'Counterweight Fire Escape', 'Barricade Vehicle', 'Puddle Reflector']
          : ['Primary Hero Prop', 'Entryway Bench / Table', 'Doorway Frame', 'Ticking Clock / Indicator'],
      groundColor: tier === 'kinetic' ? '#0F172A' : '#3B2F2F',
      horizonColor: tier === 'kinetic' ? '#1E1B4B' : '#FDE68A'
    },
    moodKey,
    shots
  };
}

export function generateProceduralStory(tier = 'mundane', customSeed = '', currentSlots = null, lockedSlots = {}) {
  const slots = rollPlotSlots(tier, currentSlots || {}, lockedSlots);
  if (customSeed && customSeed.trim()) {
    slots.activity = customSeed.trim();
  }
  return buildStoryFromSlots(tier, slots);
}

// Resolve a mood key against built-in presets AND moods generated from the
// user's own references (stored on project.customMoods).
export function resolveMood(project, key) {
  const k = key || project?.moodKey || 'warm';
  return project?.customMoods?.[k] || MOOD_VARIATIONS[k] || MOOD_VARIATIONS.warm;
}
