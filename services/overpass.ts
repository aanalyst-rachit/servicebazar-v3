import { calculateDistance } from '@/utils/distance';

export const CATEGORY_OSM_TAGS: Record<string, string[]> = {
  'bike repair': ['shop=bicycle', 'craft=bicycle_repair', 'shop=motorcycle', 'craft=motorcycle_repair'],
  'car repair': ['shop=car_repair', 'craft=car_repair', 'amenity=car_repair', 'shop=car'],
  'automobile services': ['shop=car_repair', 'craft=car_repair', 'shop=car', 'shop=motorcycle', 'shop=tyres'],
  'tyre': ['shop=tyres'],
  'tyre & wheel services': ['shop=tyres'],
  'battery services': ['shop=car_parts', 'craft=car_repair'],
  'towing services': ['amenity=car_repair'],
  'electrician': ['craft=electrician', 'shop=electrical'],
  'plumber': ['craft=plumber'],
  'carpenter': ['craft=carpenter'],
  'painter': ['craft=painter'],
  'mason': ['craft=builder'],
  'handyman': ['craft=handyman'],
  'ac services': ['craft=hvac', 'shop=hvac'],
  'appliance repair': ['shop=appliance', 'craft=electronics_repair'],
  'refrigerator repair': ['craft=electronics_repair', 'shop=appliance'],
  'tv repair': ['craft=electronics_repair', 'shop=electronics'],
  'washing machine repair': ['craft=electronics_repair', 'shop=appliance'],
  'microwave repair': ['craft=electronics_repair', 'shop=appliance'],
  'water purifier services': ['shop=appliance', 'craft=electronics_repair'],
  'generator repair': ['craft=electronics_repair'],
  'inverter / ups services': ['craft=electronics_repair', 'shop=electrical'],
  'mobile phone repair': ['shop=mobile_phone', 'craft=electronics_repair'],
  'computer & laptop services': ['shop=computer', 'craft=electronics_repair'],
  'printer services': ['shop=computer', 'craft=electronics_repair'],
  'cctv & security': ['shop=security'],
  'security guards': ['office=security'],
  'interior designers': ['office=interior_design', 'craft=interior_decorator'],
  'architects': ['office=architect'],
  'building contractors': ['craft=builder', 'office=construction_company'],
  'waterproofing': ['craft=builder'],
  'modular kitchen': ['shop=kitchen', 'craft=kitchen_fitter'],
  'false ceiling': ['craft=builder'],
  'furniture': ['shop=furniture'],
  'curtains & blinds': ['shop=curtain'],
  'flooring': ['shop=flooring', 'craft=floorer'],
  'beauty & personal care': ['shop=hairdresser', 'shop=beauty', 'shop=cosmetics'],
  'salon & spa': ['shop=hairdresser', 'shop=beauty'],
  'beauty parlour': ['shop=beauty', 'shop=hairdresser'],
  'massage centres': ['shop=massage', 'leisure=spa'],
  'makeup artists': ['shop=beauty'],
  'mehndi artists': ['shop=beauty'],
  'fitness & gym': ['leisure=fitness_centre', 'amenity=gym'],
  'yoga & wellness': ['leisure=fitness_centre', 'sport=yoga'],
  'photographers & videographers': ['shop=photo', 'craft=photographer'],
  'bakeries & cakes': ['shop=bakery', 'shop=pastry'],
  'food & tiffin services': ['amenity=restaurant', 'shop=food'],
  'catering services': ['shop=catering', 'craft=caterer'],
  'chartered accountant': ['office=accountant'],
  'legal services': ['office=lawyer'],
  'advocates & lawyers': ['office=lawyer'],
  'tax consultants': ['office=tax_advisor', 'office=accountant'],
  'company registration': ['office=lawyer', 'office=company'],
  'digital marketing': ['office=advertising_agency', 'office=it'],
  'web & app services': ['office=it', 'office=coworking'],
  'graphic design': ['office=graphic_design'],
  'printing services': ['shop=copyshop', 'craft=printer'],
  'insurance services': ['office=insurance'],
  'loans & finance': ['office=financial', 'amenity=bank'],
  'personal finance': ['office=financial_advisor'],
  'visa consultants': ['office=visa'],
  'tours & travels': ['office=travel_agent', 'shop=travel_agency'],
  'tour operators': ['office=travel_agent'],
  'vehicle rentals': ['amenity=car_rental', 'shop=car_rental'],
  'driving services': ['amenity=driving_school'],
  'doctors': ['amenity=doctors', 'healthcare=doctor'],
  'clinics': ['amenity=clinic', 'healthcare=clinic'],
  'hospitals': ['amenity=hospital'],
  'pharmacy': ['amenity=pharmacy'],
  'pharmacy & medical store': ['amenity=pharmacy'],
  'nursing care': ['healthcare=nurse', 'amenity=clinic'],
  'home nursing': ['healthcare=nurse'],
  'physiotherapy': ['healthcare=physiotherapist'],
  'dental services': ['amenity=dentist'],
  'eye care': ['healthcare=optometrist', 'shop=optician'],
  'mental wellness': ['healthcare=psychotherapist'],
  'veterinary services': ['amenity=veterinary'],
  'astrologers': ['shop=religion'],
  'pandit / religious services': ['amenity=place_of_worship'],
  'laundry / dry cleaning': ['shop=laundry', 'shop=dry_cleaning'],
  'tailoring': ['shop=tailor'],
  'clothing services': ['shop=clothes', 'shop=tailor'],
  'retail stores': ['shop=department_store', 'shop=general'],
  'grocery': ['shop=supermarket', 'shop=grocery', 'shop=convenience'],
  'electronics & repair': ['shop=electronics', 'craft=electronics_repair'],
  'internet services': ['office=telecommunication', 'shop=computer'],
  'real estate': ['office=estate_agent'],
  'property services': ['office=estate_agent'],
  'rental services': ['shop=rental'],
  'music & entertainment': ['shop=music', 'craft=musical_instrument'],
  'pet services': ['shop=pet', 'amenity=veterinary'],
  'gardening / landscaping': ['craft=gardener', 'shop=garden_centre'],
  'courier / delivery': ['amenity=post_office', 'office=courier'],
};

export const getOsmTagFiltersForCategory = (categoryText: string | null | undefined): string[] | null => {
  const norm = (categoryText || '').toLowerCase().trim();
  if (!norm) return null;
  if (CATEGORY_OSM_TAGS[norm]) return CATEGORY_OSM_TAGS[norm];
  for (const key of Object.keys(CATEGORY_OSM_TAGS)) {
    if (norm.includes(key) || key.includes(norm)) return CATEGORY_OSM_TAGS[key];
  }
  return null;
};

export const buildOverpassQuery = (
  tagFilters: string[] | null,
  nameKeyword: string | null | undefined,
  lat: number,
  lon: number,
  radiusMeters = 6000
): string | null => {
  const around = `around:${radiusMeters},${lat},${lon}`;
  const clauses: string[] = [];
  (tagFilters || []).forEach((tf) => {
    const [k, v] = tf.split('=');
    clauses.push(`nwr["${k}"="${v}"](${around});`);
  });
  const trimmedName = (nameKeyword || '').trim();
  if (trimmedName.length > 1) {
    const escapedName = trimmedName.replace(/["\\]/g, '');
    clauses.push(`nwr["name"~"${escapedName}",i](${around});`);
  }
  if (clauses.length === 0) return null;
  return `[out:json][timeout:25];(${clauses.join('')});out center tags;`;
};

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export type ExternalBusinessResult = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  category: string;
  address: string;
  phone: string | null;
};

export const fetchExternalNearbyBusinesses = async (
  categoryText: string | null,
  searchText: string,
  lat: number,
  lon: number
): Promise<ExternalBusinessResult[]> => {
  const tagFilters =
    getOsmTagFiltersForCategory(categoryText) || getOsmTagFiltersForCategory(searchText);
  const query = buildOverpassQuery(tagFilters, searchText || categoryText, lat, lon, 6000);
  if (!query || !lat || !lon) return [];

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!response.ok) continue;
      const json = await response.json();
      const elements = json.elements || [];

      const results = elements
        .filter((el: { tags?: { name?: string } }) => el.tags && el.tags.name)
        .map((el: {
          type: string;
          id: number;
          lat?: number;
          lon?: number;
          center?: { lat?: number; lon?: number };
          tags: Record<string, string>;
        }) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          if (!elLat || !elLon) return null;
          const distanceKm = parseFloat(calculateDistance(lat, lon, elLat, elLon) || '0');
          return {
            id: `${el.type}/${el.id}`,
            name: el.tags.name,
            lat: elLat,
            lon: elLon,
            distanceKm,
            category:
              el.tags.shop ||
              el.tags.craft ||
              el.tags.office ||
              el.tags.amenity ||
              el.tags.healthcare ||
              categoryText ||
              'Business',
            address: [
              el.tags['addr:housenumber'],
              el.tags['addr:street'],
              el.tags['addr:city'],
            ]
              .filter(Boolean)
              .join(', '),
            phone: el.tags.phone || el.tags['contact:phone'] || null,
          };
        })
        .filter(Boolean)
        .sort(
          (a: ExternalBusinessResult | null, b: ExternalBusinessResult | null) =>
            (a?.distanceKm || 0) - (b?.distanceKm || 0)
        )
        .slice(0, 10) as ExternalBusinessResult[];

      return results;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.log('Overpass fetch failed on', endpoint, message);
    }
  }
  return [];
};
