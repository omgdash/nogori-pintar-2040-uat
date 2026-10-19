import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Layers, 
  Zap, 
  Compass, 
  Building2, 
  Eye, 
  ChevronRight,
  Filter,
  Info
} from 'lucide-react';
import { MasterInitiative } from '../types';
import { getComponentColor, getStatusStyle, normalizeComponent } from '../utils/formatters';

interface SmartMapProps {
  initiatives: MasterInitiative[];
  onSelectInitiative: (initiative: MasterInitiative) => void;
  selectedInitiativeForMap?: MasterInitiative | null;
}

export const SmartMap: React.FC<SmartMapProps> = ({
  initiatives,
  onSelectInitiative,
  selectedInitiativeForMap
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker[] }>({});

  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [selectedCompFilter, setSelectedCompFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [fastTrackOnly, setFastTrackOnly] = useState(false);
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('');
  const [activeInitiativeKey, setActiveInitiativeKey] = useState<string | null>(null);

  // Inisiatif yang mempunyai sekurang-kurangnya satu koordinat sah
  const mappedInitiatives = useMemo(() => {
    return initiatives.filter(i => i.hasCoordinates && i.coordinates.length > 0);
  }, [initiatives]);

  // Senarai agensi yang mempunyai projek berkoordinat
  const mappedAgencies = useMemo(() => {
    const set = new Set<string>();
    mappedInitiatives.forEach(i => set.add(i.agensiUtama));
    return Array.from(set).sort();
  }, [mappedInitiatives]);

  // Inisiatif yang ditapis untuk senarai peta
  const filteredMappedInitiatives = useMemo(() => {
    return mappedInitiatives.filter(item => {
      if (mapSearchQuery) {
        const q = mapSearchQuery.toLowerCase();
        const matchTitle = item.inisiatif.toLowerCase().includes(q);
        const matchCode = item.kodInisiatif.toLowerCase().includes(q);
        const matchAgency = item.agensiUtama.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchAgency) return false;
      }

      if (selectedCompFilter && normalizeComponent(item.komponen) !== normalizeComponent(selectedCompFilter)) {
        return false;
      }

      if (selectedStatusFilter && item.statusPelaksanaan !== selectedStatusFilter) {
        return false;
      }

      if (fastTrackOnly && !item.isFastTrack) {
        return false;
      }

      if (selectedAgencyFilter && item.agensiUtama !== selectedAgencyFilter) {
        return false;
      }

      return true;
    });
  }, [mappedInitiatives, mapSearchQuery, selectedCompFilter, selectedStatusFilter, fastTrackOnly, selectedAgencyFilter]);

  // Statistik Peta
  const mapStats = useMemo(() => {
    const totalLocations = filteredMappedInitiatives.reduce((acc, i) => acc + i.coordinates.length, 0);
    const uniqueComps = new Set(filteredMappedInitiatives.map(i => normalizeComponent(i.komponen))).size;
    const ftCount = filteredMappedInitiatives.filter(i => i.isFastTrack).length;

    return {
      totalInitiatives: filteredMappedInitiatives.length,
      totalLocations,
      uniqueComps,
      ftCount
    };
  }, [filteredMappedInitiatives]);

  // Inisialisasi Peta Leaflet (Negeri Sembilan: Lat ~2.7258, Lng ~101.9424)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Bersihkan sebarang pengenal pasti Leaflet terdahulu jika wujud
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      try {
        const map = L.map(mapContainerRef.current, {
          center: [2.7258, 101.9424],
          zoom: 10,
          scrollWheelZoom: true,
          attributionControl: false
        });

        // OpenStreetMap Tiles dengan reka bentuk cerah & mesra pengguna
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Attribution ringkas di penjuru bawah
        L.control.attribution({ position: 'bottomright', prefix: 'OSM &copy; PLANMalaysia NS' }).addTo(map);

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn('Ralat inisialisasi Leaflet map:', err);
      }
    }

    return () => {
      // Pembersihan jika komponen dinyahpasang
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Kemas kini Penanda (Markers) di atas Peta mengikut Inisiatif yang Ditapis
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Padam semua marker sedia ada
    Object.values(markersRef.current).forEach(markerArr => {
      markerArr.forEach(m => m.remove());
    });
    markersRef.current = {};

    const bounds = L.latLngBounds([]);

    filteredMappedInitiatives.forEach(item => {
      const compColor = getComponentColor(item.komponen);
      const statusStyle = getStatusStyle(item.statusPelaksanaan);
      const markersForThisItem: L.Marker[] = [];

      item.coordinates.forEach((point, pointIndex) => {
        // Cipta Ikon Penanda Khas Bertema Komponen
        const customIcon = L.divIcon({
          className: 'custom-nogori-marker',
          html: `
            <div style="
              width: 32px; 
              height: 32px; 
              background-color: ${compColor.hex}; 
              border: 3px solid white; 
              border-radius: 50% 50% 50% 0; 
              transform: rotate(-45deg); 
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: transform 0.2s ease;
            ">
              <div style="
                width: 10px; 
                height: 10px; 
                background-color: white; 
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const marker = L.marker([point.lat, point.lng], { icon: customIcon });

        // Kandungan Popup Elegan
        const popupContent = document.createElement('div');
        popupContent.className = 'p-4 min-w-[260px] max-w-[320px] font-sans text-stone-900';
        popupContent.innerHTML = `
          <div style="margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="
              background-color: ${compColor.lightHex}50; 
              color: ${compColor.hex}; 
              font-size: 11px; 
              font-weight: 800; 
              padding: 2px 8px; 
              border-radius: 6px;
            ">${item.kodInisiatif}</span>
            ${item.isFastTrack ? '<span style="background-color: #FEF3C7; color: #92400E; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 9999px;">⚡ FAST TRACK</span>' : ''}
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #6B7280; text-transform: uppercase; margin-bottom: 4px;">
            ${normalizeComponent(item.komponen)}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #171717; line-height: 1.3; margin-bottom: 8px;">
            ${item.inisiatif}
          </div>
          ${point.label ? `<div style="font-size: 11px; color: #4B5563; font-style: italic; margin-bottom: 6px;">📍 ${point.label}</div>` : ''}
          <div style="font-size: 11px; color: #374151; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
            🏢 <b>${item.agensiUtama}</b>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 12px; background-color: #F9FAFB; padding: 6px 8px; border-radius: 8px;">
            <span>Kemajuan: <b>${item.peratusKemajuan ?? 0}%</b></span>
            <span style="font-weight: 700; color: ${statusStyle.text === 'Siap' ? '#059669' : '#0D9488'};">${item.statusPelaksanaan}</span>
          </div>
          <button id="btn-popup-${item.compositeKey}-${pointIndex}" style="
            width: 100%;
            background-color: #171717;
            color: white;
            font-size: 11px;
            font-weight: 700;
            padding: 8px 12px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
          ">LIHAT BUTIRAN INISIATIF</button>
        `;

        marker.bindPopup(popupContent);

        // Tambah pendengar klik pada butang popup
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-popup-${item.compositeKey}-${pointIndex}`);
          if (btn) {
            btn.onclick = () => onSelectInitiative(item);
          }
        });

        marker.addTo(map);
        markersForThisItem.push(marker);
        bounds.extend([point.lat, point.lng]);
      });

      markersRef.current[item.compositeKey] = markersForThisItem;
    });

    // Sesuaikan peta jika terdapat titik
    if (filteredMappedInitiatives.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [filteredMappedInitiatives, onSelectInitiative]);

  // Sekiranya ada inisiatif yang dipilih untuk dipaparkan secara langsung di atas peta
  useEffect(() => {
    if (!selectedInitiativeForMap || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const compKey = selectedInitiativeForMap.compositeKey;
    const markers = markersRef.current[compKey];

    if (markers && markers.length > 0) {
      const firstMarker = markers[0];
      const latLng = firstMarker.getLatLng();
      map.flyTo(latLng, 14, { duration: 1.2 });
      setTimeout(() => {
        firstMarker.openPopup();
      }, 1250);
      setActiveInitiativeKey(compKey);
    }
  }, [selectedInitiativeForMap]);

  // Klik item dalam senarai sisi peta
  const handleFlyTo = (item: MasterInitiative) => {
    setActiveInitiativeKey(item.compositeKey);
    const map = mapInstanceRef.current;
    if (!map) return;

    const markers = markersRef.current[item.compositeKey];
    if (markers && markers.length > 0) {
      const targetMarker = markers[0];
      map.flyTo(targetMarker.getLatLng(), 14, { duration: 1.2 });
      setTimeout(() => {
        targetMarker.openPopup();
      }, 1250);
    }
  };

  return (
    <section id="smart-map" className="py-12 border-b border-[#E8B6C8]/30">
      
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#46B7B0]">
          <MapPin className="w-4 h-4" />
          <span>Sistem Maklumat Geografi (GIS)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
          SMART MAP PELAN INDUK BANDAR PINTAR 2040
        </h2>
        <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
          Visualisasi taburan geospatial projek berkoordinat di Seremban, Port Dickson, Jempol, Rembau, Tampin dan Kuala Pilah.
        </p>
      </div>

      {/* Map Analytics KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 uppercase block">Inisiatif Dipetakan</span>
          <span className="text-2xl font-black text-[#171717] mt-1 block">{mapStats.totalInitiatives}</span>
          <span className="text-[10px] text-stone-400">Koordinat rasmi</span>
        </div>

        <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200">
          <span className="text-[11px] font-bold text-teal-800 uppercase block">Jumlah Titik Lokasi</span>
          <span className="text-2xl font-black text-[#1d6d68] mt-1 block">{mapStats.totalLocations}</span>
          <span className="text-[10px] text-teal-700">Termasuk multikoordinat</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F4C6A6]/60">
          <span className="text-[11px] font-bold text-stone-600 uppercase block">Komponen Terlibat</span>
          <span className="text-2xl font-black text-[#171717] mt-1 block">{mapStats.uniqueComps}</span>
          <span className="text-[10px] text-stone-500">Komponen Pintar</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <span className="text-[11px] font-bold text-amber-800 uppercase block">Fast Track Dipetakan</span>
          <span className="text-2xl font-black text-amber-950 mt-1 block">{mapStats.ftCount}</span>
          <span className="text-[10px] text-amber-700">Keutamaan tinggi</span>
        </div>
      </div>

      {/* Strict Coordinates Notice */}
      <div className="mb-6 p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2.5 text-xs text-stone-600">
        <Info className="w-4 h-4 text-[#46B7B0] shrink-0" />
        <span>
          <b>Peringatan Integriti Data:</b> Hanya inisiatif yang mempunyai rekod koordinat sah dalam lembaran <b>DATA</b> dipaparkan di atas peta. Peta tidak merekayasa lokasi inisiatif yang belum mempunyai koordinat fizikal.
        </span>
      </div>

      {/* Desktop 70% Map / 30% Sidebar Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
        
        {/* Left Side: Leaflet Map (70% on lg) */}
        <div className="lg:col-span-8 relative">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[520px] sm:h-[620px] rounded-xl overflow-hidden border border-stone-200 z-10"
          />
        </div>

        {/* Right Side: Interactive Sidebar List & Filters (30% on lg) */}
        <div className="lg:col-span-4 flex flex-col h-[520px] sm:h-[620px]">
          
          {/* Sidebar Filters */}
          <div className="space-y-3 pb-4 border-b border-stone-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                placeholder="Cari projek di peta..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedCompFilter}
                onChange={(e) => setSelectedCompFilter(e.target.value)}
                className="py-1.5 px-2 text-xs bg-stone-50 border border-stone-200 rounded-lg font-medium"
              >
                <option value="">Semua Komponen</option>
                <option value="Smart Government">Smart Government</option>
                <option value="Smart Economy">Smart Economy</option>
                <option value="Smart Environment">Smart Environment</option>
                <option value="Smart Mobility">Smart Mobility</option>
                <option value="Smart People">Smart People</option>
                <option value="Smart Digital Infrastructure">Smart Digital Infrastructure</option>
                <option value="Smart Living">Smart Living</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="py-1.5 px-2 text-xs bg-stone-50 border border-stone-200 rounded-lg font-medium"
              >
                <option value="">Semua Status</option>
                <option value="Siap">Siap</option>
                <option value="Dalam Pelaksanaan">Dalam Pelaksanaan</option>
                <option value="Belum Mula">Belum Mula</option>
                <option value="Ditangguh">Ditangguh</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setFastTrackOnly(!fastTrackOnly)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  fastTrackOnly 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Fast Track Sahaja</span>
              </button>

              <span className="text-[11px] text-stone-500 font-semibold">
                {filteredMappedInitiatives.length} projek
              </span>
            </div>
          </div>

          {/* Sidebar Mapped Initiatives List */}
          <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 pr-1">
            {filteredMappedInitiatives.length === 0 ? (
              <div className="text-center py-12 text-xs text-stone-400">
                Tiada projek peta sepadan dengan tapisan ini.
              </div>
            ) : (
              filteredMappedInitiatives.map((item) => {
                const isSelected = activeInitiativeKey === item.compositeKey;
                const compColor = getComponentColor(item.komponen);
                const statusStyle = getStatusStyle(item.statusPelaksanaan);

                return (
                  <div
                    key={item.compositeKey}
                    onClick={() => handleFlyTo(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#46B7B0] bg-[#9EDBD7]/15 ring-2 ring-[#46B7B0]/50' 
                        : 'border-stone-200 hover:border-[#46B7B0] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span 
                        className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase"
                        style={{ backgroundColor: `${compColor.lightHex}50`, color: compColor.hex }}
                      >
                        {item.kodInisiatif}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle.badgeBg}`}>
                        {statusStyle.text}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-[#171717] leading-snug line-clamp-2 mb-1.5">
                      {item.inisiatif}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="truncate max-w-[170px]">{item.agensiUtama}</span>
                      <span className="font-bold text-teal-800">
                        {item.coordinates.length} lokasi
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </section>
  );
};
