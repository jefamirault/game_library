/**
 * Game Library — reference metadata for known ROMs.
 *
 * Keyed by ROM Drive file id (same key as the sheet and the cover art).
 * fillGameInfo() in Setup.gs copies these into the Games sheet, filling blank
 * cells only — once a value is in the sheet, the sheet wins and you can edit it
 * freely there.
 *
 * Facts come from each game's Wikipedia infobox. Release dates are the first
 * release in the ROM's region (North America for USA dumps), as YYYY-MM-DD,
 * YYYY-MM or YYYY. Credits are one "Role: Names" per line; for ports and
 * remakes they name the team behind the version in the ROM where known.
 */
var GAME_INFO = {

  // 6-Pak (USA)
  '1nHNv0w-gAGokOJpfJcD80UkGoK078mMm': {
    developer: 'Sega',
    publisher: 'Sega',
    released: '1995',
    genre: 'Compilation',
    players: '1–2',
    credits: [],
    description: 'A six-in-one Genesis cartridge collecting some of Sega\'s biggest 16-bit hits: Sonic the Hedgehog, The Revenge of Shinobi, Streets of Rage, Golden Axe, Columns and Super Hang-On. Each game is the complete original, chosen from a title menu, sold on its own and bundled with the console — an easy way to own a cross-section of the Genesis library — platforming, ninja action, brawling, hack-and-slash fantasy, puzzle and motorcycle racing.'
  },

  // Classic NES Series - Super Mario Bros. (USA, Europe)
  '1G8OMT6yvzM5RKaTtrzt2VAxQqT1O2ftX': {
    developer: 'Nintendo',
    publisher: 'Nintendo',
    released: '2004-06-02',
    genre: 'Platform',
    players: '1–2 (alternating)',
    credits: [
      'Director: Shigeru Miyamoto',
      'Designers: Shigeru Miyamoto, Takashi Tezuka',
      'Composer: Koji Kondo'
    ],
    description: 'A straight Game Boy Advance re-release of the 1985 NES original, part of the Classic NES Series released for the Famicom\'s 20th anniversary. Mario runs and jumps through eight worlds of the Mushroom Kingdom, stomping Goombas and Koopa Troopas, to rescue Princess Toadstool from Bowser. The defining side-scroller of its era — secret warp zones, power-ups, hidden blocks and all — preserved as it was, scaled to the handheld\'s screen.'
  },

  // Kirby & The Amazing Mirror (USA)
  '1XwetAe68cYH_cAhKR-NSr6l4mFJ1g6UP': {
    developer: 'HAL Laboratory, Flagship, Dimps',
    publisher: 'Nintendo',
    released: '2004-10-18',
    genre: 'Platform, Metroidvania',
    players: '1–4',
    credits: [
      'Director: Tomoaki Fukui',
      'Producers: Yasushi Adachi, Masayoshi Tanimura, Shigeru Miyamoto, Kenji Miki',
      'Composers: Hironobu Inagaki, Atsuyoshi Isemura'
    ],
    description: 'Dark Meta Knight shatters the Mirror World and splits Kirby into four, and the four Kirbys must explore a sprawling, interconnected maze to piece the mirror back together. Unlike the level-by-level Kirby games, this one is an open, Metroid-style map full of hidden rooms and shortcuts. A cell phone lets you call the other Kirbys — computer-controlled, or friends over the link cable — for help at any time.'
  },

  // Kirby - Nightmare in Dream Land (USA)
  '1TMCUeMic_Vthe9L_mHiXvCTuX9QkXNS8': {
    developer: 'HAL Laboratory',
    publisher: 'Nintendo',
    released: '2002-12-02',
    genre: 'Platform',
    players: '1–4',
    credits: [
      'Director: Shinichi Shimomura',
      'Producers: Hiroaki Suga, Masayoshi Tanimura',
      'Original director: Masahiro Sakurai',
      'Original composer: Hirokazu Ando'
    ],
    description: 'A Game Boy Advance remake of Kirby\'s Adventure, the 1993 NES game that introduced Kirby\'s copy ability. King Dedede has broken the Star Rod, which gives the people of Dream Land their dreams, and Kirby sets out to recover its pieces — swallowing enemies to take on their powers, from fire breath to a sword to a parasol. The remake redraws everything in rich 2D, adds multiplayer minigames, and unlocks Meta Knight as a playable character after you finish.'
  },

  // Kirby Super Star (USA)
  '1TzJ98HmJxrlQUZh5fBQx8x_nvmmMcYNi': {
    developer: 'HAL Laboratory',
    publisher: 'Nintendo',
    released: '1996-09-20',
    genre: 'Platform',
    players: '1–2',
    credits: [
      'Director: Masahiro Sakurai',
      'Producers: Satoru Iwata, Shigeru Miyamoto',
      'Composer: Jun Ishikawa'
    ],
    description: 'Several Kirby games in one cartridge: Spring Breeze (a retelling of the first game), Dyna Blade, a race against King Dedede, the Great Cave Offensive treasure hunt, Revenge of Meta Knight and Milky Way Wishes, plus minigames. Kirby\'s copy abilities gain full move sets, and he can turn a power into a helper — a second character a friend can control for drop-in co-op. Often cited as the high point of Kirby on the SNES.'
  },

  // The Legend of Zelda (USA)
  '1e7ZF7vc5T6vMyPrWrGU1TfQlMmC1KgSI': {
    developer: 'Nintendo R&D4',
    publisher: 'Nintendo',
    released: '1987-08-22',
    genre: 'Action-adventure',
    players: '1',
    credits: [
      'Directors: Shigeru Miyamoto, Takashi Tezuka',
      'Producer: Shigeru Miyamoto',
      'Writers: Takashi Tezuka, Keiji Terui',
      'Composer: Koji Kondo'
    ],
    description: 'The game that started the series. Link is dropped into the open overworld of Hyrule with almost no direction and must find the eight fragments of the Triforce of Wisdom, hidden in underground labyrinths, before facing Ganon to rescue Princess Zelda. Its freedom to explore, secrets behind bombable walls and burnable bushes, and a battery save on the cartridge made it unlike anything else on the NES. Beating it unlocks a harder Second Quest.'
  },

  // The Legend of Zelda - A Link to the Past & Four Swords (USA)
  '1HsbpnU1BIUi3FJyoE-4L3YetaTxPH7LY': {
    developer: 'Nintendo R&D2, Flagship',
    publisher: 'Nintendo',
    released: '2002-12-02',
    genre: 'Action-adventure',
    players: '1–4',
    credits: [
      'Directors: Yoichi Yamada, Hidemaro Fujibayashi',
      'Producers: Takashi Tezuka, Noritaka Funamizu, Katsuhiro Sudo',
      'Writer: Kensuke Tanabe',
      'Composer: Yuko Takehara'
    ],
    description: 'Two games on one cartridge. The first is a Game Boy Advance port of the SNES classic A Link to the Past, with voice samples and a new bonus dungeon. The second is Four Swords, a new multiplayer Zelda for two to four players over link cables: each player is a Link, working together through randomly arranged stages to defeat the wind sorcerer Vaati while competing for the most rupees.'
  },

  // The Legend of Zelda - Link's Awakening (USA, Europe) (Rev 2)
  '1EJuLBSprIRjkmIhFpBU1ZV89yK96qKul': {
    developer: 'Nintendo EAD',
    publisher: 'Nintendo',
    released: '1993-08-06',
    genre: 'Action-adventure',
    players: '1',
    credits: [
      'Director: Takashi Tezuka',
      'Producer: Shigeru Miyamoto',
      'Writers: Yoshiaki Koizumi, Kensuke Tanabe',
      'Composers: Kazumi Totaka, Minako Hamano, Kozue Ishikawa'
    ],
    description: 'The first handheld Zelda. Shipwrecked on Koholint Island, Link learns he can only leave by waking the Wind Fish that sleeps in an egg on the mountaintop, which means collecting eight magical instruments from the island\'s dungeons. Away from Hyrule, the game is stranger and more personal than its predecessors, full of odd characters and cameo appearances, with a quietly melancholy story about what happens to the island when the dreamer wakes.'
  },

  // The Legend of Zelda - Oracle of Ages (USA, Australia)
  '1jqSweUumVqDVsHFrPMSZjZZ2eRMEthvn': {
    developer: 'Flagship',
    publisher: 'Nintendo',
    released: '2001-05-14',
    genre: 'Action-adventure',
    players: '1',
    credits: [
      'Director: Hidemaro Fujibayashi',
      'Producer: Noritaka Funamizu',
      'Writer: Hidemaro Fujibayashi',
      'Composers: Minako Adachi, Kiyohiro Sada'
    ],
    description: 'One of a pair of Game Boy Color Zeldas made by Capcom\'s Flagship studio. In the land of Labrynna, the sorceress Veran possesses Nayru, the Oracle of Ages, and twists history. Link uses the Harp of Ages to move between past and present, changing one era to open paths in the other. Ages leans toward puzzles; finish it, or its companion Oracle of Seasons, and a password carries your game into the other for a linked story and true ending.'
  },

  // The Legend of Zelda - Oracle of Seasons (USA, Australia)
  '1vYiCIMhGahFJRLRNbafuIkBH-DaLcRXg': {
    developer: 'Flagship',
    publisher: 'Nintendo',
    released: '2001-05-14',
    genre: 'Action-adventure',
    players: '1',
    credits: [
      'Director: Hidemaro Fujibayashi',
      'Producer: Noritaka Funamizu',
      'Writer: Hidemaro Fujibayashi',
      'Composers: Minako Adachi, Kiyohiro Sada'
    ],
    description: 'The action-focused half of the Oracle pair. The General of Darkness, Onox, kidnaps Din, the Oracle of Seasons, throwing the land of Holodrum\'s seasons into chaos. Link uses the Rod of Seasons to switch between spring, summer, autumn and winter — freezing lakes, raising flowers to climb, clearing snowdrifts — to reach eight dungeons. A password links it to Oracle of Ages for a continued story and true ending.'
  },

  // The Legend of Zelda - The Minish Cap (USA)
  '1JqfT5nGk2OEjL2VWp33bg5drX4idzwjE': {
    developer: 'Capcom, Flagship',
    publisher: 'Nintendo',
    released: '2005-01-10',
    genre: 'Action-adventure',
    players: '1',
    credits: [
      'Director: Hidemaro Fujibayashi',
      'Producer: Keiji Inafune',
      'Composer: Mitsuhiko Takano'
    ],
    description: 'The sorcerer Vaati turns Princess Zelda to stone, and Link teams up with Ezlo, a talking cap who can shrink him to the size of the tiny Minish people. Switching between normal and Minish size reveals a second world hidden in Hyrule\'s grass, puddles and mouse holes. Collecting and fusing Kinstone halves with townsfolk opens new secrets. One of the best-looking games on the Game Boy Advance.'
  },

  // LEGO Island 2 - The Brickster's Revenge (USA) (En,Fr)
  '1M--rktfIR_6K05UyeGvlNCJJ8kDAB4AX': {
    developer: 'Crawfish Interactive',
    publisher: 'Lego Software',
    released: '2001-10-02',
    genre: 'Action-adventure',
    players: '1',
    credits: [],
    description: 'The Brickster has broken out of jail and stolen the bricks from LEGO Island\'s Constructopedia, the book that holds the island together. Playing as Pepper Roni the pizza delivery boy, you travel the island and beyond, completing tasks for its residents to recover the lost pages and put the Brickster back behind bars. This is the Game Boy Advance version of the 2001 sequel to LEGO Island.'
  },

  // Pokemon - Crystal Version (USA, Europe) (Rev 1)
  '1FL_4Wx2SDyW2K99-Ag2EXWeUaKIRqlAA': {
    developer: 'Game Freak',
    publisher: 'Nintendo',
    released: '2001-07-30',
    genre: 'Role-playing',
    players: '1–2',
    credits: [
      'Directors: Satoshi Tajiri, Junichi Masuda',
      'Producers: Satoru Iwata, Satoshi Yamamoto, Shigeru Miyamoto, Tsunekazu Ishihara',
      'Composers: Go Ichinose, Junichi Masuda, Morikazu Aoki'
    ],
    description: 'An enhanced version of Pokémon Gold and Silver, made for the Game Boy Color only. You journey through the Johto region, and later Kanto, collecting gym badges on the way to the Pokémon League. Crystal was the first in the series to let you play as a girl, the first with animated Pokémon sprites, and it adds a new story thread around the legendary Suicune, plus the Battle Tower.'
  },

  // Pokemon - FireRed Version (USA)
  '1rZP909IV4hv9UQns4oIsM50M2tLM6_Ya': {
    developer: 'Game Freak',
    publisher: 'Nintendo',
    released: '2004-09-07',
    genre: 'Role-playing',
    players: '1–2',
    credits: [
      'Director: Junichi Masuda',
      'Producers: Hiroyuki Jinnai, Takehiro Izushi, Hiroaki Tsuru',
      'Writers: Hitomi Sato, Satoshi Tajiri',
      'Composers: Go Ichinose, Junichi Masuda, Morikazu Aoki'
    ],
    description: 'A Game Boy Advance remake of Pokémon Red. You start out from Pallet Town on the original journey across Kanto, but with the Ruby and Sapphire engine: abilities, natures, double battles and redrawn graphics. After the Elite Four, the new Sevii Islands open up. Some Pokémon are only found in its counterpart, LeafGreen, so you trade to complete the Pokédex.'
  },

  // Pokemon - LeafGreen Version (USA, Europe) (Rev 1)
  '1rioR4QlzpDpAiNjZTqCNdwxH08W-NgMC': {
    developer: 'Game Freak',
    publisher: 'Nintendo',
    released: '2004-09-07',
    genre: 'Role-playing',
    players: '1–2',
    credits: [
      'Director: Junichi Masuda',
      'Producers: Hiroyuki Jinnai, Takehiro Izushi, Hiroaki Tsuru',
      'Writers: Hitomi Sato, Satoshi Tajiri',
      'Composers: Go Ichinose, Junichi Masuda, Morikazu Aoki'
    ],
    description: 'The companion to FireRed: a Game Boy Advance remake of the original Kanto adventure (Pokémon Green in Japan, Blue elsewhere), rebuilt on the Ruby and Sapphire engine with the post-game Sevii Islands added. Its Pokémon list differs a little from FireRed\'s, so trading between the two is the way to fill in the Pokédex.'
  },

  // Pokemon - Red Version (USA, Europe) (SGB Enhanced)
  '1nuQhmu0kULzRJ4jKH_f84LjJfNZCKJxB': {
    developer: 'Game Freak',
    publisher: 'Nintendo',
    released: '1998-09-28',
    genre: 'Role-playing',
    players: '1–2',
    credits: [
      'Director: Satoshi Tajiri',
      'Producers: Shigeru Miyamoto, Takashi Kawaguchi, Tsunekazu Ishihara',
      'Writers: Satoshi Tajiri, Ryosuke Taniguchi, Fumihiro Nonomura, Hiroyuki Jinnai',
      'Composer: Junichi Masuda'
    ],
    description: 'The game that launched Pokémon outside Japan. A young trainer leaves Pallet Town with a single Pokémon, sets out across Kanto to catch and train more, beats eight gym leaders, and challenges the Elite Four, while foiling Team Rocket and keeping one step ahead of a rival. The 151 species are split between Red and Blue, so completing the Pokédex means trading with a friend over the link cable.'
  },

  // Pokemon - Ruby Version (USA, Europe) (Rev 1)
  '1BBcW0cy19Tc_Ey0teF5VTxqyzQG-G0rT': {
    developer: 'Game Freak',
    publisher: 'Nintendo',
    released: '2003-03-19',
    genre: 'Role-playing',
    players: '1–4',
    credits: [
      'Director: Junichi Masuda',
      'Producers: Hiroyuki Jinnai, Takehiro Izushi, Hiroaki Tsuru',
      'Writers: Toshinobu Matsumiya, Akihito Tomisawa',
      'Composers: Go Ichinose, Junichi Masuda, Morikazu Aoki'
    ],
    description: 'The first Pokémon on Game Boy Advance moves the series to the tropical Hoenn region, with 135 new Pokémon. It adds double battles, abilities, natures and Pokémon Contests. In Ruby, the villainous Team Magma plots to expand the land by awakening the legendary Groudon. Some Pokémon only appear in its counterpart, Sapphire.'
  },

  // Pokemon - Sapphire Version (USA, Europe) (Rev 1)
  '1TsYV4OKqxLbEkVs8NwCb8zjW_IxBDWj-': {
    developer: 'Game Freak',
    publisher: 'Nintendo',
    released: '2003-03-19',
    genre: 'Role-playing',
    players: '1–4',
    credits: [
      'Director: Junichi Masuda',
      'Producers: Hiroyuki Jinnai, Takehiro Izushi, Hiroaki Tsuru',
      'Writers: Toshinobu Matsumiya, Akihito Tomisawa',
      'Composers: Go Ichinose, Junichi Masuda, Morikazu Aoki'
    ],
    description: 'The companion to Ruby, set in the same Hoenn region with the same double battles, abilities and Contests. Here the villains are Team Aqua, who want to expand the seas by awakening the legendary Kyogre. Its Pokémon list differs a little from Ruby\'s, so trading between the two is needed to complete the Pokédex.'
  },

  // Pokemon - Yellow Version - Special Pikachu Edition (USA, Europe) (CGB+SGB Enhanced)
  '17HYuDorBYrqRTTAizUC8Nk_EBzMfJj4D': {
    developer: 'Game Freak',
    publisher: 'Nintendo',
    released: '1999-10-18',
    genre: 'Role-playing',
    players: '1–2',
    credits: [
      'Director: Satoshi Tajiri',
      'Producers: Shigeru Miyamoto, Takashi Kawaguchi, Tsunekazu Ishihara',
      'Composer: Junichi Masuda'
    ],
    description: 'A retelling of Red and Blue that follows the anime more closely. Your starter is a Pikachu, which refuses to go into its Poké Ball, follows you around the overworld and reacts to how you treat it. Jessie, James and Meowth of Team Rocket turn up, and all three Kanto starters can be obtained in one game. It is colorized on the Game Boy Color and adds a Pikachu surfing minigame.'
  },

  // Pokemon - Gold Version (USA, Europe) (SGB Enhanced) (GB Compatible)
  '1xywSwLApRVOKK-aSHEhHYTAn-57OUzUH': {
    developer: 'Game Freak',
    publisher: 'Nintendo',
    released: '2000-10-15',
    genre: 'Role-playing',
    players: '1–2',
    credits: [
      'Director: Satoshi Tajiri',
      'Producers: Takehiro Izushi, Takashi Kawaguchi, Tsunekazu Ishihara',
      'Writers: Toshinobu Matsumiya, Kenji Matsushima',
      'Composers: Go Ichinose, Junichi Masuda, Morikazu Aoki'
    ],
    description: 'The second generation of Pokémon, set in the Johto region three years after Red and Blue. It adds 100 new Pokémon, two new types (Dark and Steel), held items, breeding, and a real-time clock with day and night. After the Pokémon League, the whole of Kanto from the first game opens up to explore again. The legendary Ho-Oh appears in Gold.'
  },

  // Pokemon Pinball (USA, Australia) (Rumble Version) (SGB Enhanced) (GB Compatible)
  '1runZOLAryd_33QQqZHZeShGwcbhlNZLJ': {
    developer: 'Jupiter, HAL Laboratory',
    publisher: 'Nintendo',
    released: '1999-06-28',
    genre: 'Pinball',
    players: '1',
    credits: [
      'Producer: Tsunekazu Ishihara',
      'Designers: Masaru Kuribayashi, Hiroyuki Goto, Norichika Meguro',
      'Composer: Go Ichinose'
    ],
    description: 'Pinball with a Pokédex. Two tables, Red and Blue, take you across Kanto; hitting the right targets brings out wild Pokémon to catch with the ball and lets you evolve the ones you have, with the aim of catching all 151. Bonus stages pit you against Pokémon like Diglett and Gengar. The cartridge has a built-in rumble motor, powered by its own AAA battery.'
  },

  // Pokemon Pinball - Ruby & Sapphire (USA)
  '1TCwohl83-We7DW7KYhibF55ornVxBn5O': {
    developer: 'Jupiter',
    publisher: 'Nintendo',
    released: '2003-08-25',
    genre: 'Pinball',
    players: '1',
    credits: [],
    description: 'A Game Boy Advance follow-up to Pokémon Pinball, built around the Hoenn Pokémon of Ruby and Sapphire. The Ruby and Sapphire tables let you catch, hatch and evolve Pokémon to fill a Pokédex of over 200, travel between habitats, and stop by a Pokémart to buy upgrades. Bonus stages against Pokémon like Kecleon, Groudon and Kyogre fill out the set.'
  },

  // Pokemon - Silver Version (USA, Europe) (SGB Enhanced) (GB Compatible)
  '1y5cRNUfNtBPWj1I0KGQcHfdc43bt4iL0': {
    developer: 'Game Freak',
    publisher: 'Nintendo',
    released: '2000-10-15',
    genre: 'Role-playing',
    players: '1–2',
    credits: [
      'Director: Satoshi Tajiri',
      'Producers: Takehiro Izushi, Takashi Kawaguchi, Tsunekazu Ishihara',
      'Writers: Toshinobu Matsumiya, Kenji Matsushima',
      'Composers: Go Ichinose, Junichi Masuda, Morikazu Aoki'
    ],
    description: 'The companion to Gold, set in the Johto region with the same 100 new Pokémon, day-night clock, breeding and post-game return to Kanto. The legendary Lugia appears in Silver, and the two versions\' differing Pokémon lists encourage trading between them.'
  },

  // Sonic & Knuckles (World)
  '1PDbfaRHQ6LsZRyHcIH2VEIQlLRkpSfeQ': {
    developer: 'Sega Technical Institute',
    publisher: 'Sega',
    released: '1994-10-18',
    genre: 'Platform',
    players: '1',
    credits: [
      'Director: Hirokazu Yasuhara',
      'Producer: Yuji Naka',
      'Designers: Hirokazu Yasuhara, Hisayoshi Yoshida, Takashi Iizuka',
      'Composers: Howard Drossin, Masanori Hikichi, Sachio Ogawa, Tatsuyuki Maeda, Jun Senoue'
    ],
    description: 'The second half of the story begun in Sonic the Hedgehog 3, released separately. Sonic chases Dr. Robotnik\'s crippled Death Egg across Angel Island, while Knuckles — playable for the first time, with his gliding and wall climbing — learns he\'s been tricked. The cartridge has a slot on top: plug in Sonic 3 to play both halves as one game, Sonic 3 & Knuckles, or plug in Sonic 2 to play it as Knuckles.'
  },

  // Sonic Advance (USA) (En,Ja)
  '1gJCKn5pGEMkNhA7foF6HyZ89QV4fHdQX': {
    developer: 'Dimps, Sonic Team',
    publisher: 'THQ',
    released: '2002-02-03',
    genre: 'Platform',
    players: '1–4',
    credits: [
      'Director: Akinori Nishiyama',
      'Producers: Yuji Naka, Hiroshi Matsumoto',
      'Designers: Yukihiro Higashi, Masaaki Yamagiwa',
      'Composers: Tatsuyuki Maeda, Yutaka Minobe'
    ],
    description: 'The first Sonic game on a Nintendo system, a return to classic 2D after Sega left the hardware business. Sonic, Tails, Knuckles and Amy each play differently through stages built in the style of the Genesis games, out to stop Dr. Eggman. A Tiny Chao Garden lets you raise Chao and trade them with Sonic Adventure 2 Battle on the GameCube.'
  },

  // Sonic Advance 2 (USA) (En,Ja,Fr,De,Es,It)
  '1O6uWDQ4IRCa8-bYBaiLlxpiz3HDwfVdE': {
    developer: 'Dimps, Sonic Team',
    publisher: 'THQ',
    released: '2003-03-10',
    genre: 'Platform',
    players: '1–4',
    credits: [
      'Director: Akinori Nishiyama',
      'Producers: Yuji Naka, Hiroshi Matsumoto',
      'Designers: Yukihiro Higashi, Masaaki Yamagiwa',
      'Composers: Tatsuyuki Maeda, Yutaka Minobe, Teruhiko Nakagawa'
    ],
    description: 'A faster, more momentum-driven sequel. Dr. Eggman has kidnapped Sonic\'s friends, and Sonic must rescue them one by one — each rescue unlocks that character as playable, with Cream the Rabbit and her Chao, Cheese, debuting here. Stages are built for speed, with a boost that kicks in when you keep running, plus tricks performed in midair.'
  },

  // Sonic Advance 3 (USA) (En,Ja,Fr,De,Es,It)
  '1Xo2qNtZLEaZZ2nAbXT6J_f2n3akuUtBk': {
    developer: 'Sonic Team, Dimps',
    publisher: 'THQ',
    released: '2004-06-07',
    genre: 'Platform',
    players: '1–4',
    credits: [
      'Director: Akinori Nishiyama',
      'Producers: Yuji Naka, Kouichi Sakita',
      'Designers: Yukihiro Higashi, Masaaki Yamagiwa',
      'Composers: Tatsuyuki Maeda, Kenichi Tokoi, Hideaki Kobayashi, Masaru Setsumaru, Fumie Kumatani'
    ],
    description: 'Dr. Eggman uses Chaos Control to split the world into seven pieces. You play as a team of two characters, chosen from Sonic, Tails, Knuckles, Amy and Cream, and each pairing combines into different special moves. The levels are reached from hub worlds, and the series\' Chao collecting returns.'
  },

  // Sonic Battle (USA) (En,Ja,Fr,De,Es,It)
  '1CBl3-Mcs5wE1ci7NbzYaQotiKQdWo1Tn': {
    developer: 'Sonic Team',
    publisher: 'THQ',
    released: '2004-01-07',
    genre: 'Fighting',
    players: '1–4',
    credits: [
      'Director: Tomoyuki Hayashi',
      'Producer: Yuji Naka',
      'Designers: Tomoyuki Hayashi, Asahiko Kikuchi',
      'Writer: Asahiko Kikuchi',
      'Composers: Tatsuyuki Maeda, Kenichi Tokoi, Hideaki Kobayashi'
    ],
    description: 'A 3D arena brawler. Sonic finds Emerl, an ancient robot that copies the moves of anyone it fights, and the story follows each character\'s view of the robot over the course of the battles. Moves won from opponents can be mixed to build a custom fighting style for Emerl. Up to four players can fight over the link cable.'
  },

  // Sonic The Hedgehog 2 (USA)
  '1hboKAXAIpllsv0K-X5WrbyLPC0cb-2tK': {
    developer: 'Sega Technical Institute',
    publisher: 'Sega',
    released: '1992-11-24',
    genre: 'Platform',
    players: '1–2',
    credits: [
      'Director: Masaharu Yoshii',
      'Producer: Shinobu Toyoda',
      'Designers: Hirokazu Yasuhara, Yutaka Sugano',
      'Composer: Masato Nakamura'
    ],
    description: 'A bigger, faster sequel that introduces Tails, who follows Sonic around (and can be controlled by a second player), and the spin dash for a standing start. Dr. Robotnik is building the Death Egg space station, and Sonic races through zones from Emerald Hill to Chemical Plant and Casino Night to stop him. Collecting the Chaos Emeralds in the half-pipe special stages unlocks Super Sonic. There\'s also a split-screen versus mode.'
  },

  // Sonic The Hedgehog 3 (USA)
  '1hxTIPSGbihf1LowP_LTWxPxccMbujAHm': {
    developer: 'Sega Technical Institute',
    publisher: 'Sega',
    released: '1994-02-02',
    genre: 'Platform',
    players: '1–2',
    credits: [
      'Director: Hirokazu Yasuhara',
      'Producer: Yuji Naka',
      'Designers: Hirokazu Yasuhara, Hisayoshi Yoshida, Takashi Iizuka',
      'Composers: Brad Buxer and the Sega Sound Team'
    ],
    description: 'The Death Egg has crash-landed on Angel Island, and Sonic and Tails arrive to stop Dr. Robotnik from repairing it, only to be ambushed by Knuckles, the island\'s guardian, who has been tricked into believing Sonic is the villain. Larger zones, elemental shields and a save system were firsts for the series. It\'s the first half of a story that continues in Sonic & Knuckles.'
  },

  // Sonic The Hedgehog - Genesis (USA)
  '14M3LXl0QKc55FSbIXZwsY3ovjUGo0PJQ': {
    developer: 'Sega',
    publisher: 'Sega',
    released: '2006-11-14',
    genre: 'Platform',
    players: '1',
    credits: [
      'Original programmer: Yuji Naka',
      'Original designer: Hirokazu Yasuhara',
      'Original artist: Naoto Ohshima',
      'Original composer: Masato Nakamura'
    ],
    description: 'A 15th-anniversary Game Boy Advance port of the 1991 Genesis original. Sonic runs through Green Hill and five more zones to free the animals Dr. Robotnik has turned into robots, collecting the Chaos Emeralds along the way. This port adds a save feature, the spin dash and an Anniversary mode, but is known for its choppy frame rate and weaker music compared with the original.'
  },

  // Space Invaders (USA, Europe)
  '1C0oJOitnQwrybkyZt0ja5bi8CVl7sLYj': {
    developer: 'Torus Games',
    publisher: 'Activision',
    released: '2002-03-19',
    genre: 'Fixed shooter',
    players: '1–2',
    credits: [
      'Original designer: Tomohiro Nishikado'
    ],
    description: 'A Game Boy Advance version of Activision\'s 1999 Space Invaders update. The core is Tomohiro Nishikado\'s 1978 arcade original — a laser cannon slides back and forth under descending ranks of aliens — reworked with worlds themed on the planets of the solar system, new alien types, power-ups and bosses. Two players can play over a link cable.'
  },

  // Super Mario Bros. Deluxe (USA, Europe) (Rev 1)
  '1oSEG1IyZV_t7ulxPHgQSZCh4Kn9Acv2e': {
    developer: 'Nintendo R&D2',
    publisher: 'Nintendo',
    released: '1999-05-10',
    genre: 'Platform',
    players: '1–2',
    credits: [
      'Director: Toshiaki Suzuki',
      'Producers: Masayuki Uemura, Kazuhiko Taniguchi',
      'Original designers: Shigeru Miyamoto, Takashi Tezuka',
      'Composers: Yuichi Ozaki, Masami Yone'
    ],
    description: 'Super Mario Bros. on the Game Boy Color, with extras. The original eight worlds are joined by Super Mario Bros.: The Lost Levels, unlockable once you\'ve scored enough points. There are also a Challenge mode with hidden red coins and Yoshi eggs to find, a two-player race via link cable, a photo album, and printouts for the Game Boy Printer.'
  },

  // Super Mario Bros. + Duck Hunt (USA)
  '1efhknBSChIJ1lZn4Q5SJ12AsasPwP0ce': {
    developer: 'Nintendo R&D4, Nintendo R&D1',
    publisher: 'Nintendo',
    released: '1988',
    genre: 'Platform, Light gun shooter',
    players: '1–2',
    credits: [
      'Super Mario Bros. director: Shigeru Miyamoto',
      'Super Mario Bros. composer: Koji Kondo',
      'Duck Hunt director: Shigeru Miyamoto',
      'Duck Hunt composer: Hirokazu Tanaka'
    ],
    description: 'The two-in-one cartridge bundled with the NES Action Set, which made it one of the most widely owned games of its time. Super Mario Bros. is the 1985 platformer: eight worlds, Goombas and Koopas, and Bowser holding the princess. Duck Hunt uses the NES Zapper light gun to shoot ducks and clay pigeons — while the hunting dog laughs at every miss.'
  },

  // Super Mario Land (World) (Rev 1)
  '1bO5qh2A9s7GxI9rNWf6xj6CV_-BjzoRW': {
    developer: 'Nintendo R&D1',
    publisher: 'Nintendo',
    released: '1989-07-31',
    genre: 'Platform',
    players: '1',
    credits: [
      'Director: Satoru Okada',
      'Producer: Gunpei Yokoi',
      'Designer: Hirofumi Matsuoka',
      'Composer: Hirokazu Tanaka'
    ],
    description: 'Mario\'s first handheld game, made for the Game Boy\'s launch by its own hardware team rather than Mario\'s usual creators — which shows in its oddities. Mario travels to the land of Sarasaland to rescue Princess Daisy from the alien Tatanga, with exploding Koopa shells, Easter Island-style heads and two shooting stages flown in a submarine and an airplane.'
  },

  // Super Mario Land 2 - 6 Golden Coins (USA, Europe) (Rev 2)
  '157Uk7Ocqlz4bofwbVLivZzBQv-qnhPem': {
    developer: 'Nintendo R&D1',
    publisher: 'Nintendo',
    released: '1992-11-02',
    genre: 'Platform',
    players: '1',
    credits: [
      'Directors: Hiroji Kiyotake, Takehiko Hosokawa',
      'Producer: Gunpei Yokoi',
      'Composer: Kazumi Totaka'
    ],
    description: 'While Mario was away, Wario took over his castle and locked the door behind him. To get back in, Mario must collect six golden coins from the six zones of Mario Land, chosen in any order from a world map — a giant mechanical Mario, a space zone, a haunted pumpkin. Larger, more detailed sprites than the first game, a save feature, and the first appearance of Wario.'
  },

  // The Legend of Zelda - A Link to the Past (USA)
  '1PRL9NjD7EQ23l5UdT3ZyIJRfydY7Z4zK': {
    developer: 'Nintendo EAD',
    publisher: 'Nintendo',
    released: '1992-04-13',
    genre: 'Action-adventure',
    players: '1',
    credits: [
      'Director: Takashi Tezuka',
      'Producer: Shigeru Miyamoto',
      'Writer: Kensuke Tanabe',
      'Composer: Koji Kondo'
    ],
    description: 'The wizard Agahnim is sealing away the descendants of Hyrule\'s seven sages to open a passage to the Dark World and free Ganon. Link must collect three pendants to claim the Master Sword, then cross into the Dark World — a twisted mirror of Hyrule — to rescue the maidens. Switching between the two worlds to solve puzzles is at its heart, and it set the structure later Zelda games followed.'
  },

  // Tony Hawk's Pro Skater 2 (USA, Europe)
  '1rsxyLyEKkBxN-D_WhD4kd-Nu3X_Znh5u': {
    developer: 'Vicarious Visions',
    publisher: 'Activision',
    released: '2001-06-11',
    genre: 'Sports',
    players: '1',
    credits: [
      'Composer: Manfred Linzner'
    ],
    description: 'A Game Boy Advance version of the celebrated skateboarding game, rebuilt from scratch in an isometric 3D view so it plays much like the console original. Pick a pro skater and work through the levels, completing goals — high scores, collecting S-K-A-T-E, finding gaps — against a two-minute clock, earning cash to unlock more.'
  },

  // Tony Hawk's Pro Skater 3 (USA, Europe)
  '1xXpTMJVr0kZ2RSrgVVZn-WWQmJi3cLZN': {
    developer: 'Vicarious Visions',
    publisher: 'Activision',
    released: '2002-03-15',
    genre: 'Sports',
    players: '',
    credits: [],
    description: 'Vicarious Visions\' Game Boy Advance adaptation of Tony Hawk\'s Pro Skater 3. It keeps the isometric 3D engine of the THPS2 port, with levels adapted from the console game: skate timed runs to complete each level\'s goals, and place in competitions to move on.'
  },

  // Tony Hawk's Pro Skater 4 (USA, Europe)
  '1BlgLyGYZ7FV1wwo-juhaS0uBOrxBPW9E': {
    developer: 'Vicarious Visions',
    publisher: 'Activision',
    released: '2002-10-23',
    genre: 'Sports',
    players: '',
    credits: [],
    description: 'The Game Boy Advance version of Tony Hawk\'s Pro Skater 4, by Vicarious Visions. It uses the isometric 3D engine refined over the earlier GBA ports, with levels adapted from the console game and the series\' goal-based career mode.'
  },

  // Wario Land 3 (World) (En,Ja)
  '1xTF6VhbC_6vaRTPUbwq1TY8ujg_rTjLC': {
    developer: 'Nintendo R&D1',
    publisher: 'Nintendo',
    released: '2000-05-30',
    genre: 'Platform',
    players: '1',
    credits: [
      'Director: Takehiko Hosokawa',
      'Producer: Takehiro Izushi',
      'Composer: Kozue Ishikawa'
    ],
    description: 'Wario crash-lands in a forest and finds a music box that pulls him into the world inside it, where a mysterious being promises to send him home if he frees it from a curse. Wario can\'t be killed, so enemies instead transform him — on fire, flattened, frozen, bouncy — and these forms are the key to solving the game\'s puzzles. Items found in each level unlock new paths across a map that changes with the time of day.'
  },

  // Wario Land 4 (USA, Europe)
  '1pnPFYZ-8rNmiZeONofwjrf_M3N_J1BvN': {
    developer: 'Nintendo R&D1',
    publisher: 'Nintendo',
    released: '2001-11-19',
    genre: 'Platform',
    players: '1',
    credits: [
      'Director: Hirofumi Matsuoka',
      'Producer: Takehiro Izushi',
      'Designers: Hiroji Kiyotake, Tomoyoshi Yamane, Takehiko Hosokawa and others',
      'Composer: Ryoji Yoshitomi'
    ],
    description: 'Wario reads about a golden pyramid deep in the jungle and heads in after its treasure. Every level ends with a frantic escape: hit the switch at the far end, and a countdown starts as you dash back to the exit before the timer runs out. Wario now has a health meter, along with his usual transformations. Four themed passages lead to the pyramid\'s ruler, the Golden Diva.'
  },

  // Wario Land II (USA, Europe) (SGB Enhanced) (GB Compatible)
  '1vInoDA20ivn3ctAIewrGspWl3pJJ5oZb': {
    developer: 'Nintendo R&D1',
    publisher: 'Nintendo',
    released: '1999-02-10',
    genre: 'Platform',
    players: '1',
    credits: [
      'Director: Takehiko Hosokawa',
      'Producer: Takehiro Izushi',
      'Designer: Masani Ueda',
      'Composer: Kozue Ishikawa'
    ],
    description: 'Captain Syrup and the Black Sugar Gang steal Wario\'s treasure and flood his castle. Wario can no longer die: getting hit only knocks coins loose, and certain enemies transform him — set on fire, squashed flat, turned into a zombie — in ways that open new paths. The story branches, with hidden exits leading to different chapters and endings. This is the Game Boy Color version, which also runs on the original Game Boy.'
  },

  // WarioWare, Inc. - Mega Microgame$! (USA)
  '1tyo_168FfYeEe1AgSYeXQMVBZObB78Hl': {
    developer: 'Nintendo R&D1',
    publisher: 'Nintendo',
    released: '2003-05-26',
    genre: 'Action',
    players: '1–2',
    credits: [
      'Director: Hirofumi Matsuoka',
      'Producer: Takehiro Izushi',
      'Designers: Ko Takeuchi, Goro Abe, Ryutaro Takahashi',
      'Composers: Ryoji Yoshitomi, Kyoko Miyamoto'
    ],
    description: 'Wario starts a game company to get rich quick, and gets his friends to make the games. The result is over 200 microgames, each lasting about five seconds and given a one-word instruction like "Dodge!" or "Pick!". They fire off one after another, getting faster as you go, until you run out of lives. The games range from pick-the-nose gags to tiny tributes to classic Nintendo games.'
  },

  // Yu-Gi-Oh! - Day of the Duelist - World Championship Tournament 2005 (Europe)
  '1L4YjBAbSzCQCVo8NCbRhU88l5n5AYoRy': {
    developer: 'Konami',
    publisher: 'Konami',
    released: '2005-02-18',
    genre: 'Digital card game',
    players: '1–2',
    credits: [],
    description: 'A Game Boy Advance adaptation of the Yu-Gi-Oh! trading card game, using the official rules of its day. You build decks from a large card pool and duel characters from the anime, earning card packs as you win. This is the European release; in North America it was titled 7 Trials to Glory: World Championship Tournament 2005.'
  },

  // Yu-Gi-Oh! - Worldwide Edition - Stairway to the Destined Duel (USA)
  '1z2EKAUPy2I3kMAyBe5v1KzNwjfNu2fr1': {
    developer: 'Konami',
    publisher: 'Konami',
    released: '2003-04-15',
    genre: 'Digital card game',
    players: '1–2',
    credits: [],
    description: 'A Game Boy Advance adaptation of the Yu-Gi-Oh! trading card game, played under the real card game\'s rules. You build a deck and duel through characters from the anime, earning new cards along the way, and can trade or duel with friends over the link cable. It\'s an updated international version of the Japanese Duel Monsters 6: Expert 2.'
  }
};

// Duplicate ROM files of the same game share its entry.
GAME_INFO['1K5X30Av51gBBo-cFxi8EXvHSfjVbZglD'] = GAME_INFO['1JqfT5nGk2OEjL2VWp33bg5drX4idzwjE']; // The Minish Cap
GAME_INFO['15oFcPIr2GrI4bRXvcGQH8olmW1-YMd23'] = GAME_INFO['1oSEG1IyZV_t7ulxPHgQSZCh4Kn9Acv2e']; // Super Mario Bros. Deluxe
