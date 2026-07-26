import { HotspotType } from '../services/hotspotService';

/**
 * Unified filter combining:
 * - Risk Level Filter (High, Medium, Low)
 * - District Dropdown Filter (e.g. "Bengaluru Urban")
 * - Text Search Filter (District, City, Cluster ID)
 */
export function filterHotspots(
  hotspots: HotspotType[],
  selectedDistrict: string,
  selectedRisk: 'All' | 'High' | 'Medium' | 'Low',
  searchQuery: string
): HotspotType[] {
  const query = searchQuery.trim().toLowerCase();
  const districtFilter = selectedDistrict.trim();

  return hotspots.filter((item) => {
    // 1. District dropdown filtering
    const matchesDistrict = 
      districtFilter === 'All' || 
      item.district.toLowerCase() === districtFilter.toLowerCase();

    // 2. Risk level button filtering
    const matchesRisk = 
      selectedRisk === 'All' || 
      item.risk_level === selectedRisk;

    // 3. Search query filtering
    if (!query) {
      return matchesDistrict && matchesRisk;
    }

    const matchesCluster = 
      item.cluster.toString() === query || 
      `cluster ${item.cluster}`.includes(query);

    const matchesDistrictSearch = item.district.toLowerCase().includes(query);

    // City name search mapping
    let matchesCity = false;
    if (query.includes('bengaluru') && item.district.toLowerCase().includes('bengaluru')) {
      matchesCity = true;
    } else if (query.includes('mysuru') && item.district.toLowerCase().includes('mysuru')) {
      matchesCity = true;
    } else if (query.includes('hubballi') && item.district.toLowerCase().includes('hubballi')) {
      matchesCity = true;
    } else if (query.includes('udupi') && item.district.toLowerCase().includes('udupi')) {
      matchesCity = true;
    }

    const matchesCoords = 
      item.latitude.toString().includes(query) || 
      item.longitude.toString().includes(query);

    return matchesDistrict && matchesRisk && (matchesCluster || matchesDistrictSearch || matchesCity || matchesCoords);
  });
}
