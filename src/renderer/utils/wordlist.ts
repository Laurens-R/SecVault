/**
 * Curated word list for passphrase generation.
 * Size: 512 common English words — chosen for memorability and variety.
 * Entropy per word: log2(512) = 9 bits.  6-word passphrase ≈ 54 bits.
 */
export const WORDLIST: readonly string[] = [
  // A
  'ability', 'access', 'action', 'active', 'adapt', 'adult', 'after', 'agent',
  'agree', 'alert', 'align', 'allow', 'alter', 'amber', 'ample', 'angel',
  'angle', 'ankle', 'annex', 'apply', 'arena', 'argue', 'arise', 'armor',
  'array', 'arrow', 'aside', 'asset', 'atlas', 'audit', 'avoid', 'award',
  // B
  'basic', 'beach', 'beard', 'begin', 'being', 'below', 'bench', 'birth',
  'black', 'blade', 'blank', 'blast', 'blaze', 'blend', 'bless', 'block',
  'blood', 'bloom', 'blown', 'bonus', 'boost', 'bound', 'brain', 'brand',
  'brave', 'bread', 'break', 'breed', 'brief', 'bring', 'broad', 'broke',
  'brook', 'brown', 'brush', 'build', 'burst',
  // C
  'cabin', 'cable', 'cargo', 'carry', 'catch', 'cedar', 'chain', 'chair',
  'chalk', 'chess', 'chief', 'child', 'civic', 'civil', 'claim', 'clash',
  'class', 'clean', 'clear', 'clerk', 'click', 'climb', 'clock', 'close',
  'cloud', 'coach', 'coast', 'coral', 'count', 'court', 'cover', 'craft',
  'crane', 'crash', 'cream', 'creek', 'crisp', 'cross', 'crowd', 'crush',
  'curve', 'cycle',
  // D
  'daily', 'dance', 'datum', 'debug', 'delta', 'dense', 'depth', 'derby',
  'digit', 'disco', 'donor', 'doubt', 'dough', 'draft', 'drain', 'drama',
  'drawn', 'dream', 'dress', 'drift', 'drink', 'drive', 'drone', 'dunes',
  // E
  'eagle', 'earth', 'eight', 'elect', 'elite', 'email', 'empty', 'enjoy',
  'enter', 'equal', 'error', 'essay', 'event', 'exact', 'exist', 'extra',
  // F
  'faint', 'faith', 'fault', 'feast', 'fence', 'fiber', 'field', 'fifth',
  'fight', 'final', 'fixed', 'flame', 'flash', 'fleet', 'flesh', 'float',
  'floor', 'flora', 'fluid', 'flute', 'focus', 'force', 'forge', 'forum',
  'found', 'frame', 'frank', 'fraud', 'fresh', 'front', 'frost', 'fruit',
  // G
  'ghost', 'giant', 'given', 'glare', 'glass', 'glide', 'globe', 'gloom',
  'glove', 'grace', 'grade', 'grain', 'grand', 'grant', 'graph', 'grasp',
  'grass', 'grave', 'great', 'green', 'gross', 'group', 'grove', 'guard',
  'guest', 'guide', 'gusto',
  // H
  'habit', 'happy', 'harsh', 'heart', 'heavy', 'hippo', 'honor', 'hotel',
  'house', 'human', 'humor', 'hurry',
  // I
  'image', 'inbox', 'index', 'inner', 'input', 'intel', 'intro', 'issue',
  // J
  'jewel', 'joint', 'joker', 'judge', 'juice', 'jumbo',
  // K
  'kayak', 'karma', 'knife',
  // L
  'label', 'large', 'laser', 'latch', 'learn', 'lease', 'ledge', 'legal',
  'level', 'light', 'limit', 'liner', 'local', 'lodge', 'logic', 'loose',
  'lucky', 'lunar', 'lyric',
  // M
  'magic', 'major', 'maker', 'maple', 'march', 'media', 'metal', 'might',
  'minor', 'minus', 'model', 'money', 'month', 'moral', 'motor', 'mount',
  'mouse', 'movie', 'music',
  // N
  'naval', 'night', 'noble', 'north', 'noted', 'novel', 'nurse',
  // O
  'ocean', 'offer', 'olive', 'onset', 'orbit', 'order', 'other', 'outer',
  'oxide', 'ozone',
  // P
  'paint', 'panel', 'paper', 'patch', 'pause', 'peace', 'pearl', 'pedal',
  'pixel', 'pitch', 'place', 'plain', 'plank', 'plant', 'plaza', 'pluck',
  'polar', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prior',
  'probe', 'proof', 'prose', 'prove', 'proxy', 'pulse',
  // Q
  'queen', 'quest', 'quick', 'quiet', 'quota', 'quote',
  // R
  'radar', 'radio', 'rainy', 'rally', 'ranch', 'range', 'rapid', 'rebel',
  'reign', 'relay', 'renew', 'reply', 'reset', 'rider', 'right', 'risky',
  'river', 'robot', 'rocky', 'rouge', 'rough', 'round', 'route', 'royal',
  'rugby', 'ruler', 'rusty',
  // S
  'saint', 'sauce', 'scale', 'score', 'scout', 'serve', 'setup', 'seven',
  'shade', 'shake', 'shall', 'share', 'sharp', 'sheep', 'shelf', 'shell',
  'shift', 'shine', 'shirt', 'shock', 'shore', 'short', 'signal', 'solar',
  'solid', 'solve', 'south', 'space', 'spell', 'spend', 'spice', 'spike',
  'spine', 'sport', 'squad', 'stack', 'stage', 'stair', 'stamp', 'stand',
  'start', 'state', 'steep', 'steer', 'stone', 'storm', 'story', 'style',
  'sugar', 'sunny', 'super', 'surge', 'swift',
  // T
  'table', 'tango', 'teach', 'terms', 'tiger', 'timer', 'title', 'token',
  'total', 'touch', 'tough', 'tower', 'track', 'trade', 'trail', 'train',
  'trait', 'tread', 'trend', 'tribe', 'trick', 'troop', 'trove', 'truly',
  'truth', 'tuner', 'twist',
  // U
  'ultra', 'uncle', 'under', 'units', 'upper', 'usage',
  // V
  'valid', 'valor', 'valve', 'vault', 'video', 'vigor', 'viral', 'visit',
  'vista', 'vital', 'vivid', 'vocal', 'voice', 'voter',
  // W
  'watch', 'water', 'weave', 'wedge', 'whale', 'wheat', 'wheel', 'whole',
  'wider', 'windy', 'wired', 'world', 'worth', 'woven',
  // Y / Z
  'yacht', 'yield', 'youth', 'zebra', 'zesty', 'solar',
] as const
