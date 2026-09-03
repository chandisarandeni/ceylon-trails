import { Attraction, Hub, OptionalActivity, ScoreKey } from '../../types/tourism';

function s(partial: Partial<Record<ScoreKey, number>>): Record<ScoreKey, number> {
  return {
    nature: partial.nature ?? 0,
    wildlife: partial.wildlife ?? 0,
    culture: partial.culture ?? 0,
    adventure: partial.adventure ?? 0,
    beach: partial.beach ?? 0,
    food: partial.food ?? 0,
    shopping: partial.shopping ?? 0,
    history: partial.history ?? 0,
    religious: partial.religious ?? 0
  };
}

export const HUBS: Hub[] = [
  { id: 'hub-cmb', name: 'Bandaranaike Intl (CMB / Katunayake)', city: 'Colombo', lat: 7.1808, lng: 79.8841 },
  { id: 'hub-kdy', name: 'Kandy Railway & Transport Hub', city: 'Kandy', lat: 7.2906, lng: 80.6337 },
  { id: 'hub-gle', name: 'Galle Highway & Southern Gateway', city: 'Galle', lat: 6.0535, lng: 80.221 },
  { id: 'hub-sig', name: 'Sigiriya / Dambulla Cultural Gateway', city: 'Dambulla', lat: 7.8742, lng: 80.6511 }
];

export const ATTRACTIONS: Attraction[] = [
  {
    id: 'sigiriya',
    name: 'Sigiriya Rock Fortress',
    city: 'Sigiriya',
    province: 'Central',
    lat: 7.957,
    lng: 80.7603,
    scores: s({ nature: 4, culture: 5, adventure: 4, history: 5 }),
    activityCost: 11000,
    visitDuration: 4,
    popularity: 98,
    recommendedSeason: 'Year round',
    description: 'A 5th-century citadel on a 200m granite peak featuring lion paw gates, water gardens and ancient frescoes.'
  },
  {
    id: 'temple-tooth',
    name: 'Temple of the Sacred Tooth Relic',
    city: 'Kandy',
    province: 'Central',
    lat: 7.2936,
    lng: 80.6413,
    scores: s({ culture: 5, religious: 5, history: 5, nature: 2 }),
    activityCost: 2000,
    visitDuration: 2.5,
    popularity: 95,
    recommendedSeason: 'Year round',
    description: 'Royal palace complex housing the sacred tooth relic of the Buddha inside a golden canopy shrine.'
  },
  {
    id: 'dambulla-cave',
    name: 'Dambulla Royal Cave Temple',
    city: 'Dambulla',
    province: 'Central',
    lat: 7.8567,
    lng: 80.6492,
    scores: s({ nature: 3, wildlife: 2, culture: 5, adventure: 2, history: 5, religious: 5 }),
    activityCost: 2000,
    visitDuration: 3,
    popularity: 92,
    recommendedSeason: 'Year round',
    description: 'Five cavernous rock temples with 153 Buddha statues.'
  },
  {
    id: 'ella-rock',
    name: 'Ella Rock & Nine Arch Bridge',
    city: 'Ella',
    province: 'Uva',
    lat: 6.8721,
    lng: 81.0461,
    scores: s({ nature: 5, adventure: 4, culture: 2 }),
    activityCost: 2000,
    visitDuration: 4.5,
    popularity: 94,
    recommendedSeason: 'Year round',
    description: 'Iconic stone railway viaduct surrounded by tea country trails and cliff viewpoints.'
  },
  {
    id: 'galle-fort',
    name: 'Galle Dutch Fort',
    city: 'Galle',
    province: 'Southern',
    lat: 6.0262,
    lng: 80.2169,
    scores: s({ culture: 5, history: 5, beach: 4, food: 5, shopping: 5 }),
    activityCost: 1500,
    visitDuration: 3.5,
    popularity: 94,
    recommendedSeason: 'Nov - Apr',
    description: 'UNESCO World Heritage 17th-century rampart fort with cobblestone alleys and bastions.'
  },
  {
    id: 'yala',
    name: 'Yala National Park',
    city: 'Tissamaharama',
    province: 'Southern',
    lat: 6.3728,
    lng: 81.5196,
    scores: s({ wildlife: 5, nature: 5, adventure: 4 }),
    activityCost: 15000,
    visitDuration: 6,
    popularity: 96,
    recommendedSeason: 'Feb - Jul',
    description: 'Coastal thorn-scrub wilderness holding the highest wild leopard density worldwide.'
  },
  {
    id: 'mirissa-whales',
    name: 'Mirissa Whale Watching & Coconut Hill',
    city: 'Mirissa',
    province: 'Southern',
    lat: 5.9449,
    lng: 80.4594,
    scores: s({ wildlife: 5, beach: 5, nature: 4, food: 4 }),
    activityCost: 9000,
    visitDuration: 5,
    popularity: 92,
    recommendedSeason: 'Nov - Apr',
    description: 'Deep sea catamaran boat tours watching blue whales, sperm whales and dolphins.'
  },
  {
    "id": "nuwara_eliya_town",
    "name": "Nuwara Eliya Hill Station",
    "city": "Nuwara Eliya",
    "province": "Central",
    "lat": 6.9497,
    "lng": 80.7891,
    scores: s({ nature: 5, wildlife: 2, culture: 3, adventure: 3, beach: 1, food: 4, shopping: 3, history: 4, religious: 1 }),
    "activityCost": 3500,
    "visitDuration": 4,
    "popularity": 91,
    "recommendedSeason": "Mar - May",
    "description": "Colonial hill station known as Little England surrounded by tea slopes."
  },
  {
    "id": "horton_plains",
    "name": "Horton Plains & World's End",
    "city": "Nuwara Eliya",
    "province": "Central",
    "lat": 6.8096,
    "lng": 80.8004,
    scores: s({ nature: 5, wildlife: 4, culture: 1, adventure: 5, beach: 1, food: 1, shopping: 1, history: 1, religious: 1 }),
    "activityCost": 12000,
    "visitDuration": 5,
    "popularity": 89,
    "recommendedSeason": "Jan - Mar",
    "description": "High montane plateau loop trail leading to World's End escarpment."
  },
  {
    "id": "peradeniya_gardens",
    "name": "Royal Botanical Gardens Peradeniya",
    "city": "Kandy",
    "province": "Central",
    "lat": 7.2683,
    "lng": 80.5964,
    scores: s({ nature: 5, wildlife: 3, culture: 3, adventure: 2, beach: 1, food: 2, shopping: 2, history: 4, religious: 1 }),
    "activityCost": 3000,
    "visitDuration": 3.5,
    "popularity": 88,
    "recommendedSeason": "Year round",
    "description": "147-acre botanical park renowned for orchids and giant bamboo."
  },
  {
    "id": "knuckles_range",
    "name": "Knuckles Mountain Range",
    "city": "Matale",
    "province": "Central",
    "lat": 7.4667,
    "lng": 80.7833,
    scores: s({ nature: 5, wildlife: 4, culture: 2, adventure: 5, beach: 1, food: 1, shopping: 1, history: 1, religious: 1 }),
    "activityCost": 6000,
    "visitDuration": 7,
    "popularity": 82,
    "recommendedSeason": "Jun - Sep",
    "description": "UNESCO cloud forest mountain biosphere for trekking and waterfalls."
  },
  {
    "id": "anuradhapura_ruwanwelisaya",
    "name": "Ruwanwelisaya & Sacred City",
    "city": "Anuradhapura",
    "province": "North Central",
    "lat": 8.35,
    "lng": 80.3833,
    scores: s({ nature: 3, wildlife: 2, culture: 5, adventure: 2, beach: 1, food: 1, shopping: 2, history: 5, religious: 5 }),
    "activityCost": 8000,
    "visitDuration": 5,
    "popularity": 95,
    "recommendedSeason": "Year round",
    "description": "Great white stupa built by King Dutugemunu in 140 BC."
  },
  {
    "id": "polonnaruwa_gal_vihara",
    "name": "Gal Vihara Rock Sculptures",
    "city": "Polonnaruwa",
    "province": "North Central",
    "lat": 7.9403,
    "lng": 81.0188,
    scores: s({ nature: 3, wildlife: 3, culture: 5, adventure: 3, beach: 1, food: 1, shopping: 2, history: 5, religious: 4 }),
    "activityCost": 8000,
    "visitDuration": 4.5,
    "popularity": 93,
    "recommendedSeason": "Year round",
    "description": "Masterpiece rock-carved seated, standing and reclining Buddhas."
  },
  {
    "id": "minneriya_elephants",
    "name": "Minneriya National Park",
    "city": "Habarana",
    "province": "North Central",
    "lat": 8.0333,
    "lng": 80.8833,
    scores: s({ nature: 5, wildlife: 5, culture: 1, adventure: 3, beach: 1, food: 1, shopping: 1, history: 1, religious: 1 }),
    "activityCost": 12000,
    "visitDuration": 4,
    "popularity": 94,
    "recommendedSeason": "Jun - Sep",
    "description": "Site of the world-renowned seasonal Asian elephant gathering."
  },
  {
    "id": "nilaveli_beach",
    "name": "Nilaveli Beach & Pigeon Island",
    "city": "Trincomalee",
    "province": "Eastern",
    "lat": 8.7167,
    "lng": 81.2,
    scores: s({ nature: 5, wildlife: 4, culture: 1, adventure: 4, beach: 5, food: 3, shopping: 1, history: 1, religious: 1 }),
    "activityCost": 5000,
    "visitDuration": 4.5,
    "popularity": 91,
    "recommendedSeason": "May - Sep",
    "description": "White sand beach with reef shark snorkeling."
  },
  {
    "id": "koneswaram",
    "name": "Koneswaram Temple (Swami Rock)",
    "city": "Trincomalee",
    "province": "Eastern",
    "lat": 8.5772,
    "lng": 81.2433,
    scores: s({ nature: 4, wildlife: 2, culture: 5, adventure: 2, beach: 3, food: 2, shopping: 2, history: 5, religious: 5 }),
    "activityCost": 1000,
    "visitDuration": 2.5,
    "popularity": 89,
    "recommendedSeason": "May - Sep",
    "description": "Clifftop Shiva Kovil overlooking Trincomalee harbor."
  },
  {
    "id": "arugam_surf",
    "name": "Arugam Bay Surf Point",
    "city": "Ampara",
    "province": "Eastern",
    "lat": 6.8419,
    "lng": 81.8328,
    scores: s({ nature: 4, wildlife: 3, culture: 1, adventure: 5, beach: 5, food: 4, shopping: 2, history: 1, religious: 1 }),
    "activityCost": 4000,
    "visitDuration": 5,
    "popularity": 93,
    "recommendedSeason": "May - Sep",
    "description": "World-renowned right-point surf destination."
  },
  {
    "id": "jaffna_dutch_fort",
    "name": "Jaffna Fort",
    "city": "Jaffna",
    "province": "Northern",
    "lat": 9.6608,
    "lng": 80.0092,
    scores: s({ nature: 2, wildlife: 1, culture: 4, adventure: 2, beach: 2, food: 2, shopping: 2, history: 5, religious: 1 }),
    "activityCost": 1000,
    "visitDuration": 2.5,
    "popularity": 86,
    "recommendedSeason": "May - Sep",
    "description": "Star-shaped Portuguese and Dutch colonial fort."
  },
  {
    "id": "nallur_kandaswamy",
    "name": "Nallur Kandaswamy Kovil",
    "city": "Jaffna",
    "province": "Northern",
    "lat": 9.6744,
    "lng": 80.0294,
    scores: s({ nature: 1, wildlife: 1, culture: 5, adventure: 1, beach: 1, food: 2, shopping: 2, history: 5, religious: 5 }),
    "activityCost": 500,
    "visitDuration": 2,
    "popularity": 90,
    "recommendedSeason": "May - Sep",
    "description": "Golden gopuram Hindu temple complex."
  },
  {
    "id": "gangaramaya",
    "name": "Gangaramaya Temple",
    "city": "Colombo",
    "province": "Western",
    "lat": 6.9169,
    "lng": 79.8564,
    scores: s({ nature: 1, wildlife: 1, culture: 5, adventure: 1, beach: 1, food: 2, shopping: 3, history: 4, religious: 5 }),
    "activityCost": 2000,
    "visitDuration": 2,
    "popularity": 89,
    "recommendedSeason": "Year round",
    "description": "Urban temple complex with museum artifacts on Beira Lake."
  },
  {
    "id": "lotus_tower_colombo",
    "name": "Colombo Lotus Tower",
    "city": "Colombo",
    "province": "Western",
    "lat": 6.9272,
    "lng": 79.8578,
    scores: s({ nature: 1, wildlife: 1, culture: 3, adventure: 2, beach: 1, food: 4, shopping: 3, history: 1, religious: 1 }),
    "activityCost": 6000,
    "visitDuration": 2,
    "popularity": 91,
    "recommendedSeason": "Year round",
    "description": "350m tower featuring a revolving restaurant and observation deck."
  },
  {
    "id": "wilpattu_nw",
    "name": "Wilpattu National Park (Puttalam Gate)",
    "city": "Puttalam",
    "province": "North Western",
    "lat": 8.4461,
    "lng": 80.0505,
    scores: s({ nature: 5, wildlife: 5, culture: 1, adventure: 4, beach: 2, food: 1, shopping: 1, history: 2, religious: 1 }),
    "activityCost": 14000,
    "visitDuration": 6,
    "popularity": 88,
    "recommendedSeason": "Feb - Oct",
    "description": "Main entrance to Sri Lanka's largest safari park."
  },
  {
    "id": "kalpitiya_peninsula",
    "name": "Kalpitiya Peninsula & Kite Surfing",
    "city": "Kalpitiya",
    "province": "North Western",
    "lat": 8.2333,
    "lng": 79.7667,
    scores: s({ nature: 4, wildlife: 4, culture: 1, adventure: 5, beach: 5, food: 3, shopping: 1, history: 1, religious: 1 }),
    "activityCost": 8000,
    "visitDuration": 4.5,
    "popularity": 85,
    "recommendedSeason": "Nov - Apr",
    "description": "Kite-surfing capital and dolphin watching peninsula."
  },
  {
    "id": "yapahuwa_staircase",
    "name": "Yapahuwa Rock Fortress",
    "city": "Kurunegala",
    "province": "North Western",
    "lat": 7.8286,
    "lng": 80.3164,
    scores: s({ nature: 4, wildlife: 1, culture: 5, adventure: 4, beach: 1, food: 1, shopping: 1, history: 5, religious: 2 }),
    "activityCost": 2000,
    "visitDuration": 2.5,
    "popularity": 83,
    "recommendedSeason": "Year round",
    "description": "13th-century rock citadel with ornamental lion staircase."
  },
  {
    "id": "udawalawe_park",
    "name": "Udawalawe National Park",
    "city": "Udawalawe",
    "province": "Sabaragamuwa",
    "lat": 6.4753,
    "lng": 80.8889,
    scores: s({ nature: 5, wildlife: 5, culture: 1, adventure: 3, beach: 1, food: 1, shopping: 1, history: 1, religious: 1 }),
    "activityCost": 13000,
    "visitDuration": 5,
    "popularity": 92,
    "recommendedSeason": "Year round",
    "description": "Open reservoir safari park famous for elephant herds."
  },
  {
    "id": "adams_peak_sripada",
    "name": "Adam's Peak (Sri Pada)",
    "city": "Nallathanniya",
    "province": "Sabaragamuwa",
    "lat": 6.8096,
    "lng": 80.4994,
    scores: s({ nature: 5, wildlife: 2, culture: 4, adventure: 5, beach: 1, food: 1, shopping: 1, history: 4, religious: 5 }),
    "activityCost": 2500,
    "visitDuration": 8,
    "popularity": 90,
    "recommendedSeason": "Dec - May",
    "description": "Sacred mountain pilgrimage climb of 5,500 stone steps."
  },
  {
    "id": "pinnawala_orphanage",
    "name": "Pinnawala Elephant Orphanage",
    "city": "Kegalle",
    "province": "Sabaragamuwa",
    "lat": 7.3009,
    "lng": 80.3885,
    scores: s({ nature: 3, wildlife: 5, culture: 2, adventure: 1, beach: 1, food: 2, shopping: 3, history: 1, religious: 1 }),
    "activityCost": 3000,
    "visitDuration": 3,
    "popularity": 87,
    "recommendedSeason": "Year round",
    "description": "Herd of rescued elephants with daily river bathing procession."
  },
  {
    "id": "kitulgala_rafting_center",
    "name": "Kitulgala White Water Rafting",
    "city": "Kitulgala",
    "province": "Sabaragamuwa",
    "lat": 6.9903,
    "lng": 80.4136,
    scores: s({ nature: 5, wildlife: 2, culture: 1, adventure: 5, beach: 1, food: 2, shopping: 1, history: 2, religious: 1 }),
    "activityCost": 5000,
    "visitDuration": 4.5,
    "popularity": 88,
    "recommendedSeason": "Year round",
    "description": "Grade 3 white-water rafting and canyoning on Kelani river."
  },
  {
    "id": "sinharaja_rainforest_gate",
    "name": "Sinharaja Virgin Rain Forest",
    "city": "Deniyaya",
    "province": "Sabaragamuwa",
    "lat": 6.4,
    "lng": 80.4667,
    scores: s({ nature: 5, wildlife: 5, culture: 1, adventure: 4, beach: 1, food: 1, shopping: 1, history: 1, religious: 1 }),
    "activityCost": 5000,
    "visitDuration": 5,
    "popularity": 86,
    "recommendedSeason": "Dec - Apr",
    "description": "UNESCO primary tropical rainforest biosphere reserve."
  }
];

export const OPTIONAL_ACTIVITIES: OptionalActivity[] = [
  {
    id: 'opt-cooking',
    name: 'Spices & Cooking Masterclass',
    city: 'Kandy',
    cost: 4500,
    value: 8,
    durationHours: 2,
    linkedInterest: 'food'
  },
  {
    id: 'opt-surf-lesson',
    name: 'Private Surfing Coaching Session',
    city: 'Ahangama',
    cost: 6500,
    value: 9,
    durationHours: 2.5,
    linkedInterest: 'adventure'
  },
  {
    id: 'opt-whales-vip',
    name: 'Catamaran Upper-Deck Whale Tour',
    city: 'Mirissa',
    cost: 12000,
    value: 9.5,
    durationHours: 4,
    linkedInterest: 'wildlife'
  },
  {
    id: 'opt-tea-tasting',
    name: 'Highland Single-Origin Tea Pairing',
    city: 'Nuwara Eliya',
    cost: 3500,
    value: 7.5,
    durationHours: 1.5,
    linkedInterest: 'culture'
  },
  {
    id: 'opt-heritage',
    name: 'Archaeologist-led ruins tour',
    city: 'Anuradhapura',
    cost: 7000,
    value: 7,
    durationHours: 3,
    linkedInterest: 'history'
  }
];

export const ATTRACTION_MAP: Record<string, Attraction> = ATTRACTIONS.reduce(
  (acc, a) => ({ ...acc, [a.id]: a }),
  {}
);

export const HUB_MAP: Record<string, Hub> = HUBS.reduce((acc, h) => ({ ...acc, [h.id]: h }), {});

export interface GeoPoint {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  isHub: boolean;
}

export function getPoint(id: string): GeoPoint {
  const a = ATTRACTION_MAP[id];
  if (a) {
    return { id: a.id, name: a.name, city: a.city, lat: a.lat, lng: a.lng, isHub: false };
  }
  const h = HUB_MAP[id];
  if (h) {
    return { id: h.id, name: h.name, city: h.city, lat: h.lat, lng: h.lng, isHub: true };
  }
  return { id, name: id, city: '–', lat: 7, lng: 80.7, isHub: true };
}

export function pointName(id: string): string {
  return getPoint(id).name;
}
