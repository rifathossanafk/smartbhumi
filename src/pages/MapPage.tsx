import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { useStore } from '../store/useStore';
import { DIVISIONS } from '../data/seedData';
import type { LandRecord } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import {
  MapPin,
  FileCheck2,
  ExternalLink,
  Filter,
  CheckCircle2,
  Layers,
  Crosshair,
  Building,
  Lock,
  Search,
  Compass,
  ArrowRight,
  Maximize2,
  ShieldCheck,
  Check,
  Download,
  X,
} from 'lucide-react';

// Strict Bangladesh Geographic Boundaries
const BANGLADESH_BOUNDS: L.LatLngBoundsExpression = [
  [20.30, 88.00], // South-West
  [26.75, 92.75], // North-East
];

export const MapPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialRecordId = searchParams.get('record');
  const { landRecords } = useStore();
  const isBn = i18n.language === 'bn';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [selectedRecord, setSelectedRecord] = useState<LandRecord | null>(null);
  const [filterDivision, setFilterDivision] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedDagQuery, setSelectedDagQuery] = useState<string>('');
  const [mapLayerType, setMapLayerType] = useState<'cadastral' | 'satellite' | 'voyager'>('cadastral');
  const [tileError, setTileError] = useState(false);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return landRecords.filter((rec) => {
      if (filterDivision && rec.division !== filterDivision) return false;
      if (filterStatus) {
        if (filterStatus === 'frozen' && !rec.isFrozen) return false;
        if (filterStatus === 'flagged' && rec.status !== 'flagged') return false;
        if (filterStatus === 'active' && (rec.status !== 'active' || rec.isFrozen)) return false;
      }
      return true;
    });
  }, [landRecords, filterDivision, filterStatus]);

  // If initialRecordId is provided in URL, set selectedRecord
  useEffect(() => {
    if (initialRecordId) {
      const found = landRecords.find((r) => r.id === initialRecordId);
      if (found) {
        setSelectedRecord(found);
      }
    }
  }, [initialRecordId, landRecords]);

  // Tile provider URLs
  const TILE_LAYERS = {
    cadastral: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors • Smart Land Bangladesh Cadastre',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri World Imagery • Bangladesh Cadastral Overlay',
    },
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB Voyager • Ministry of Land GIS',
    },
  };

  // Initialize Map strictly constrained to Bangladesh
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center of Bangladesh: lat 23.8103, lng 90.4125
    const map = L.map(mapContainerRef.current, {
      center: [23.8103, 90.4125],
      zoom: 7,
      minZoom: 7, // Strictly prevents zooming out to view other countries
      maxZoom: 19,
      maxBounds: BANGLADESH_BOUNDS, // Restricts view to Bangladesh ONLY
      maxBoundsViscosity: 1.0, // Hard physics stop at boundaries
      bounceAtZoomLimits: true,
    });

    const initialTiles = L.tileLayer(TILE_LAYERS.cadastral.url, {
      attribution: TILE_LAYERS.cadastral.attribution,
      maxZoom: 19,
    });

    initialTiles.on('tileerror', () => {
      setTileError(true);
    });

    initialTiles.addTo(map);
    currentTileLayerRef.current = initialTiles;

    const polygonsLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    polygonsLayerRef.current = polygonsLayer;
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Layer Switcher
  const handleLayerChange = (layerType: 'cadastral' | 'satellite' | 'voyager') => {
    setMapLayerType(layerType);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const newLayer = L.tileLayer(TILE_LAYERS[layerType].url, {
      attribution: TILE_LAYERS[layerType].attribution,
      maxZoom: 19,
    });

    newLayer.addTo(map);
    currentTileLayerRef.current = newLayer;
  };

  // Update Markers and Vector Cadastral Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const polygonsLayer = polygonsLayerRef.current;
    if (!map || !markersLayer || !polygonsLayer) return;

    markersLayer.clearLayers();
    polygonsLayer.clearLayers();

    filteredRecords.forEach((record) => {
      const isSelected = selectedRecord?.id === record.id;
      const isFrozen = record.isFrozen;
      const isFlagged = record.status === 'flagged' || record.status === 'under_review';

      // Colors
      const primaryColor = isFrozen ? '#ef4444' : isFlagged ? '#f59e0b' : '#059669';
      const bgColor = isFrozen ? 'bg-red-600' : isFlagged ? 'bg-amber-500' : 'bg-emerald-600';
      const ringColor = isSelected ? 'ring-4 ring-emerald-400 scale-125 shadow-xl' : 'hover:scale-110';

      // 1. Render Cadastral Vector Polygon if coordinates exist
      if (record.cadastralPolygon && record.cadastralPolygon.length >= 3) {
        const polygon = L.polygon(record.cadastralPolygon, {
          color: primaryColor,
          weight: isSelected ? 4 : 2.5,
          opacity: isSelected ? 1 : 0.85,
          fillColor: primaryColor,
          fillOpacity: isSelected ? 0.35 : 0.18,
          className: isSelected ? 'selected-cadastral-polygon' : '',
        });

        polygon.on('click', () => {
          setSelectedRecord(record);
          map.flyTo([record.lat, record.lng], 16, { duration: 1.2 });
        });

        polygon.bindTooltip(
          `<div class="font-bold text-xs font-mono">${record.dagNumber}</div><div class="text-[10px] text-slate-600">${record.mouza} (${record.landArea} ${record.landAreaUnit})</div>`,
          { sticky: true, className: 'cadastral-tooltip' }
        );

        polygonsLayer.addLayer(polygon);
      }

      // 2. Custom Modern SVG & Pin Marker
      const customIcon = L.divIcon({
        className: 'custom-cadastral-pin',
        html: `
          <div class="relative flex items-center justify-center transition-all ${ringColor}" style="width:38px; height:38px;">
            <div class="${bgColor} text-white w-9 h-9 rounded-2xl shadow-lg flex flex-col items-center justify-center border-2 border-white font-mono text-[9px] font-bold leading-none">
              <span>${isFrozen ? '🔒' : isFlagged ? '⚠️' : '✓'}</span>
              <span class="text-[8px] mt-0.5 truncate max-w-[28px]">${record.dagNumber.replace('DAG-', '')}</span>
            </div>
            <div class="absolute -bottom-1 w-2.5 h-2.5 ${bgColor} rotate-45 border-r border-b border-white"></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([record.lat, record.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedRecord(record);
        map.flyTo([record.lat, record.lng], 16, { duration: 1.2 });
      });

      markersLayer.addLayer(marker);
    });
  }, [filteredRecords, selectedRecord]);

  // Center on selected record if changed
  useEffect(() => {
    if (selectedRecord && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedRecord.lat, selectedRecord.lng], 16, {
        duration: 1.2,
      });
    }
  }, [selectedRecord]);

  // Fly to selected Dag from quick selector
  const handleFlyToDag = (rec: LandRecord) => {
    setSelectedRecord(rec);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([rec.lat, rec.lng], 16, { duration: 1.4 });
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Title & Official National Cadastre Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              {isBn ? 'ক্যাডাস্ট্রাল ভূমি মানচিত্র ও মৌজা নকশা' : 'Cadastral GIS Land Map & Mouza Plots'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Bangladesh GIS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            {isBn
              ? 'শুধুমাত্র বাংলাদেশের ভূখণ্ডে সীমাবদ্ধ ডিজিটাল ক্যাডাস্ট্রাল ভেক্টর ম্যাপ — দাগে ক্লিক করে সরাসরি বিস্তারিত ও পর্চা দেখুন।'
              : 'Strictly bounded to Bangladesh territory with cadastral vector plot boundaries, automatic fly-to zoom, and title details.'}
          </p>
        </div>

        {/* Security & Scope Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>{isBn ? 'জাতীয় ভূমি রেকর্ড নেটওয়ার্ক' : 'National Land Registry Network'}</span>
        </div>
      </div>

      {/* Filter & Cadastral Controls Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>{isBn ? 'ফিল্টার:' : 'Filters:'}</span>
          </div>

          <select
            value={filterDivision}
            onChange={(e) => setFilterDivision(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">{t('fields.all')} {t('fields.division')}</option>
            {DIVISIONS.map((d) => (
              <option key={d.id} value={d.id}>{isBn ? d.nameBn : d.nameEn}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">{t('fields.all')} {t('fields.status')}</option>
            <option value="active">{isBn ? 'সক্রিয় / ভেরিফাইড (Active)' : 'Active / Verified'}</option>
            <option value="flagged">{isBn ? 'নজরদারি / শুনানি (Flagged)' : 'Under Review'}</option>
            <option value="frozen">{isBn ? 'জরুরি লক কার্যকর (Frozen)' : 'Locked / Frozen'}</option>
          </select>

          {/* Quick Dag Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">|</span>
            <span className="font-semibold text-slate-700">{isBn ? 'সরাসরি দাগে যান:' : 'Jump to Plot:'}</span>
            <select
              value={selectedDagQuery}
              onChange={(e) => {
                setSelectedDagQuery(e.target.value);
                const target = landRecords.find((r) => r.id === e.target.value);
                if (target) handleFlyToDag(target);
              }}
              className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/40 text-emerald-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="">{isBn ? '-- দাগ নির্বাচন করুন --' : '-- Select Plot --'}</option>
              {landRecords.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.dagNumber} — {r.mouza} ({r.landArea} {r.landAreaUnit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Map Layers & Legend */}
        <div className="flex items-center gap-3">
          {/* Layer switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleLayerChange('cadastral')}
              className={`px-2.5 py-1 rounded-lg transition ${
                mapLayerType === 'cadastral'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'মৌজা নকশা' : 'Cadastre'}
            </button>
            <button
              type="button"
              onClick={() => handleLayerChange('satellite')}
              className={`px-2.5 py-1 rounded-lg transition ${
                mapLayerType === 'satellite'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'স্যাটেলাইট' : 'Satellite'}
            </button>
            <button
              type="button"
              onClick={() => handleLayerChange('voyager')}
              className={`px-2.5 py-1 rounded-lg transition ${
                mapLayerType === 'voyager'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'স্লিট মোড' : 'Slate'}
            </button>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-slate-600 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>{isBn ? 'সক্রিয় দাগ' : 'Active'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>{isBn ? 'শুনানি' : 'Review'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>{isBn ? 'লক' : 'Locked'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Cadastral Map & Detail Side-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container */}
        <div className="lg:col-span-8 h-[580px] rounded-3xl overflow-hidden shadow-sm border border-slate-200 relative bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {tileError && (
            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white backdrop-blur p-2.5 rounded-xl border border-slate-700 text-[11px] shadow-md">
              GIS Cadastral offline mode active.
            </div>
          )}

          {/* Reset to Bangladesh National View Button */}
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([23.8103, 90.4125], 7, { duration: 1.2 });
              }
            }}
            className="absolute bottom-5 right-5 z-20 bg-white/95 hover:bg-white text-slate-800 px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 text-xs font-bold flex items-center gap-2 transition hover:scale-105 active:scale-95"
            title="Reset Map to Full Bangladesh View"
          >
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>{isBn ? 'সমগ্র বাংলাদেশ ভিউ' : 'Reset to Bangladesh'}</span>
          </button>

          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] font-semibold flex items-center gap-2 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isBn ? 'ক্যাডাস্ট্রাল ভেক্টর সীমানা সক্রিয়' : 'Vector Plot Polygons Active'}</span>
          </div>
        </div>

        {/* Selected Record Detail Panel / Cadastral Inspector */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          {selectedRecord ? (
            <div className="space-y-4 animate-fade-in">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {selectedRecord.deedNumber}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-2">
                    {t(`deedTypes.${selectedRecord.deedType}`, selectedRecord.deedType)}
                  </h3>
                </div>

                {selectedRecord.isFrozen ? (
                  <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>{isBn ? 'জরুরি লক' : 'Locked'}</span>
                  </span>
                ) : selectedRecord.status === 'flagged' ? (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    {isBn ? 'শুনানি প্রয়োজন' : 'Under Review'}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{isBn ? 'সক্রিয় ও বৈধ' : 'Active'}</span>
                  </span>
                )}
              </div>

              {/* Cadastral Coordinates & Location Pill */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>
                    {selectedRecord.mouza} (জে.এল {selectedRecord.jlNumber})
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedRecord.upazila}, {selectedRecord.district}, {selectedRecord.division}
                </div>
                <div className="font-mono text-[10px] text-slate-600 pt-0.5">
                  GPS: {selectedRecord.lat.toFixed(4)}° N, {selectedRecord.lng.toFixed(4)}° E
                </div>
              </div>

              {/* Plot Technical Specifications */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">{isBn ? 'দাগ নম্বর (Dag No):' : 'Plot Dag No:'}</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedRecord.dagNumber}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">{isBn ? 'খতিয়ান ও জরিপ শ্রেণি:' : 'Khatian & Survey:'}</span>
                  <span className="font-bold text-slate-900">
                    {selectedRecord.khatianType} — {selectedRecord.khatianNumber}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">{isBn ? 'জমির পরিমাপ:' : 'Plot Area:'}</span>
                  <span className="font-bold text-slate-900">
                    {selectedRecord.landArea} {t(`units.${selectedRecord.landAreaUnit}`, selectedRecord.landAreaUnit)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">{isBn ? 'জমির শ্রেণিবিভাগ:' : 'Land Class:'}</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedRecord.landClassification}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">{isBn ? 'ভূমি কর (LD Tax):' : 'Tax Status:'}</span>
                  <span className="font-bold text-emerald-800">
                    {selectedRecord.taxStatus === 'paid'
                      ? isBn ? 'পরিশোধিত ✓' : 'Paid ✓'
                      : isBn ? 'বকেয়া ⚠️' : 'Due ⚠️'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">{isBn ? 'নিবন্ধিত মালিক:' : 'Recorded Owner:'}</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedRecord.ownerRef}</span>
                </div>
              </div>

              {/* QR Code and Quick Verification Scan */}
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3.5">
                <div className="bg-white p-1.5 rounded-xl shadow-xs border border-emerald-200 shrink-0">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${encodeURIComponent(selectedRecord.deedNumber)}`}
                    size={64}
                    level="M"
                  />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">
                    {isBn ? 'স্মার্ট কিউআর ভেরিফিকেশন' : 'Smart QR Scan'}
                  </span>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {isBn
                      ? 'মোবাইল ক্যামেরা দিয়ে স্ক্যান করে ডিজিটাল পর্চা নিশ্চিত করুন।'
                      : 'Scan to verify cryptographic title on any device.'}
                  </p>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="pt-2 space-y-2">
                <Link
                  to={`/verify/${encodeURIComponent(selectedRecord.deedNumber)}`}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{isBn ? 'দলিল ও অখণ্ডতা যাচাই' : 'Verify Deed Authenticity'}</span>
                </Link>

                <Link
                  to={`/record/${selectedRecord.id}`}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 rounded-xl transition"
                >
                  <span>{isBn ? 'রেকর্ডের সম্পূর্ণ বিবরণ' : 'Full Record Details'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4 my-auto">
              <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <MapPin className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">
                  {isBn ? 'মানচিত্রে দাগ নির্বাচন করুন' : 'Select a Plot on the Map'}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {isBn
                    ? 'মানচিত্রে প্রদর্শিত যে কোনো ভেক্টর দাগে ক্লিক করুন অথবা উপরের ড্রপডাউন থেকে দাগ নির্বাচন করুন। মানচিত্র স্বয়ংক্রিয়ভাবে উক্ত স্থানে জুম করবে।'
                    : 'Click any cadastral plot polygon on the map or select from the toolbar to automatically zoom and inspect land details.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
