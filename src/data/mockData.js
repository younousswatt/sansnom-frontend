export const THEMES = [
  { id: 'all', label: 'Tout' },
  { id: 'stress', label: 'Stress scolaire' },
  { id: 'solitude', label: 'Solitude' },
  { id: 'famille', label: 'Famille' },
  { id: 'relations', label: 'Relations' },
  { id: 'autre', label: 'Autre' },
];

export const POSTS = [
  {
    id: 1,
    anon: 'Anonyme#2847',
    theme: 'stress',
    themeLabel: 'Stress scolaire',
    text: "Les examens approchent et je n'arrive plus à dormir. J'ai l'impression que tout le monde s'en sort mieux que moi. Est-ce que quelqu'un ressent ça aussi ?",
    likes: 12,
    replies: 5,
    time: '14h32',
    comments: [
      { id: 1, anon: 'Anonyme#0312', text: "Oui totalement. Tu n'es pas seul·e là-dedans.", time: '14h40' },
      { id: 2, anon: 'Anonyme#7741', text: "Je traverse exactement la même chose. Ce qui m'aide c'est de couper les réseaux sociaux pendant les révisions.", time: '14h55' },
    ]
  },
  {
    id: 2,
    anon: 'Anonyme#5531',
    theme: 'solitude',
    themeLabel: 'Solitude',
    text: "Je suis en première année à Dakar, loin de ma famille. Certains jours le vide est difficile à porter. Je ne sais même pas pourquoi je poste ça, j'ai juste besoin que quelqu'un lise.",
    likes: 34,
    replies: 18,
    time: '13h15',
    comments: [
      { id: 1, anon: 'Anonyme#4490', text: "Je t'ai lu. Et je comprends ce sentiment.", time: '13h20' },
    ]
  },
  {
    id: 3,
    anon: 'Anonyme#1092',
    theme: 'famille',
    themeLabel: 'Famille',
    text: "Mes parents ont des attentes énormes et je n'ose pas leur dire que je me sens perdu. Comment vous gérez la pression familiale ?",
    likes: 21,
    replies: 9,
    time: '11h08',
    comments: []
  },
  {
    id: 4,
    anon: 'Anonyme#3318',
    theme: 'relations',
    themeLabel: 'Relations',
    text: "J'ai rompu avec quelqu'un que j'aimais vraiment. Je pensais aller mieux avec le temps mais c'est de pire en pire. Je n'arrive plus à me concentrer.",
    likes: 28,
    replies: 12,
    time: '09h47',
    comments: []
  },
  {
    id: 5,
    anon: 'Anonyme#6623',
    theme: 'stress',
    themeLabel: 'Stress scolaire',
    text: "Je suis en master et je commence à remettre en question tout mon parcours. Ai-je fait les bons choix ? Est-ce que quelqu'un a changé de voie et ne le regrette pas ?",
    likes: 45,
    replies: 22,
    time: '08h30',
    comments: []
  },
];

export const PEERS = [
  { id: 1, name: 'Volontaire#44', role: 'Étudiant · UCAD', status: 'online' },
  { id: 2, name: 'Volontaire#71', role: 'Étudiante · ESP', status: 'online' },
  { id: 3, name: 'Volontaire#18', role: 'Étudiant · ENSA', status: 'busy' },
  { id: 4, name: 'Volontaire#93', role: 'Étudiante · UCAD', status: 'busy' },
  { id: 5, name: 'Volontaire#52', role: 'Étudiant · UGB', status: 'offline' },
];

export const RESOURCES = [
  {
    id: 1,
    category: 'Article',
    title: 'Gérer l\'anxiété liée aux examens',
    desc: 'Techniques concrètes pour retrouver calme et concentration avant les épreuves.',
    readTime: '4 min',
  },
  {
    id: 2,
    category: 'Guide',
    title: 'Parler à sa famille de sa santé mentale',
    desc: 'Comment aborder le sujet avec ses proches quand les mots manquent.',
    readTime: '6 min',
  },
  {
    id: 3,
    category: 'Article',
    title: 'La solitude à l\'université, c\'est normal',
    desc: 'Comprendre pourquoi la première année est souvent la plus difficile.',
    readTime: '3 min',
  },
  {
    id: 4,
    category: 'Urgence',
    title: 'Ligne d\'écoute — SOS Amitié Sénégal',
    desc: 'Disponible 24h/24. Confidentiel. Gratuit.',
    phone: '+221 33 889 15 15',
  },
];

export const CHAT_INIT = [
  {
    id: 1,
    from: 'peer',
    text: "Bonjour, je suis là pour t'écouter. Tu peux me parler de ce que tu traverses, en toute confidentialité.",
    time: '14h02',
  },
  {
    id: 2,
    from: 'me',
    text: "Merci. Je sais pas trop par où commencer. J'ai l'impression d'être complètement dépassé.",
    time: '14h03',
  },
  {
    id: 3,
    from: 'peer',
    text: "Je comprends. Commencer c'est déjà courageux. Qu'est-ce qui te pèse le plus en ce moment ?",
    time: '14h04',
  },
];
