import { useEffect, useState, useRef, useMemo, memo, useCallback } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "@vnedyalk0v/react19-simple-maps";
import { scaleLinear } from "d3-scale";

const PH_TOPO_URL = "/maps/Provinces.json";

const PROVINCE_NAME_MAPPINGS = {
  'metropolitanmanila': 'ncr',
  'isabela citybas': 'isabelacitybasilan',
};

const MapLegend = ({ min, max, colors }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10, fontSize: '0.8rem', color: '#666' }}>
    <span>{min}</span>
    <div style={{
      width: 150,
      height: 12,
      margin: '0 10px',
      background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
      borderRadius: 6
    }} />
    <span>{max.toLocaleString()}</span>
  </div>
);

// 1. Stable Geography Component
const MemoizedGeography = memo(({ geo, cur, colorScale, onMouseEnter, onMouseMove, onMouseLeave }) => {
  const rawName = geo.properties.PROVINCE || geo.properties.NAME_1;
  return (
    <Geography
      geography={geo}
      fill={cur ? colorScale(cur) : "#EEE"}
      stroke="#FFF"
      strokeWidth={0.5}
      onMouseEnter={(e) => onMouseEnter(rawName, cur, e)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        default: { outline: "none" },
        hover: { fill: "#F53", outline: "none", cursor: "pointer" },
        pressed: { outline: "none" },
      }}
    />
  );
});

// 2. Memoized List of Geographies
const GeographiesList = memo(({ geographies, normalizedData, colorScale, onMouseEnter, onMouseMove, onMouseLeave }) => {
  return (
    <>
      {geographies.map((geo, index) => {
        const rawName = geo.properties.PROVINCE || geo.properties.NAME_1 || "";
        const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, '') || "";
        let mapKey = normalize(rawName);
        
        // Apply name mapping for special cases
        if (PROVINCE_NAME_MAPPINGS[mapKey]) {
          mapKey = PROVINCE_NAME_MAPPINGS[mapKey];
        }
        
        const cur = normalizedData[mapKey] || 0;

        return (
          <MemoizedGeography
            key={geo.rsmKey || index}
            geo={geo}
            cur={cur}
            colorScale={colorScale}
            onMouseEnter={onMouseEnter}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          />
        );
      })}
    </>
  );
});

export default function PhilippinesChoroplethMap({ data }) {
  const [phMapData, setPhMapData] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    fetch(PH_TOPO_URL)
      .then((res) => res.json())
      .then((data) => setPhMapData(data))
      .catch((err) => console.error("Error loading PH map:", err));
  }, []);

  const maxValue = useMemo(() => {
    const values = Object.values(data);
    const max = values.length > 0 ? Math.max(...values) : 0;
    return max;
  }, [data]);

  const colorScale = useMemo(() => {
    const scale = scaleLinear()
      .domain([0, maxValue])
      .range(["#ffedea", "#ff5233"]);
    return scale;
  }, [maxValue]);

  // Pre-compute normalized data
  const normalizedData = useMemo(() => {
    const acc = {};
    Object.keys(data).forEach(key => {
      // Normalize: remove all non-alphanumeric chars and lowercase
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      acc[normalizedKey] = data[key];
    });
    return acc;
  }, [data]);

  const handleMouseEnter = useCallback((name, value, event) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = 1;
      tooltipRef.current.innerHTML = `
        <strong style="display:block; margin-bottom:4px;">${name}</strong>
        <div>${value.toLocaleString()} Emigrants</div>
      `;
      tooltipRef.current.style.left = `${event.clientX + 15}px`;
      tooltipRef.current.style.top = `${event.clientY + 15}px`;
    }
  }, []);

  const handleMouseMove = useCallback((event) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${event.clientX + 15}px`;
      tooltipRef.current.style.top = `${event.clientY + 15}px`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = 0;
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {phMapData && (
        <>
          <ComposableMap projection="geoMercator" projectionConfig={{ center: [122, 13], scale: 2000 }}>
            <ZoomableGroup center={[122, 13]}>
              <Geographies geography={phMapData}>
                {({ geographies }) => (
                  <GeographiesList 
                    geographies={geographies}
                    normalizedData={normalizedData}
                    colorScale={colorScale}
                    onMouseEnter={handleMouseEnter}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  />
                )}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          <MapLegend min={0} max={maxValue} colors={["#ffedea", "#ff5233"]} />
        </>
      )}
      
      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          background: "rgba(0, 0, 0, 0.85)",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "12px",
          pointerEvents: "none",
          zIndex: 9999,
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          opacity: 0,
          transition: "opacity 0.15s ease",
          top: 0,
          left: 0, 
        }}
      />
    </div>
  );
}

