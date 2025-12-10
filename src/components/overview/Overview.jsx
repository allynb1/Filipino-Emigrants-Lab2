import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import MLPForecast from '../MLPForecast'

import { getEmigrantAges } from "../../services/emigrantsAgeService";
import { getEmigrantCivilStatuses } from "../../services/emigrantsCivilStatusService";
import { getEmigrantEdus } from "../../services/emigrantsEduService";
import { getEmigrantOccupations } from "../../services/emigrantsOccupationService";
import { getEmigrantSexes } from "../../services/emigrantsSexService";
import { getCountriesAll, getCountriesMajor } from "../../services/emigrantsCountriesService";
import { getOriginProvinces, getOriginRegions } from "../../services/emigrantsOriginService";

import WorldChoroplethMap from "./WorldChoroplethMap";
import PhilippinesChoroplethMap from "./PhilippinesChoroplethMap";
import DashboardCard from "./DashboardCard";

import AgeTrendChart from "./charts/AgeTrendChart";
import CivilStatusChart from "./charts/CivilStatusChart";
import MajorCountriesChart from "./charts/MajorCountriesChart";
import EducationChart from "./charts/EducationChart";
import OccupationChart from "./charts/OccupationChart";
import RegionChart from "./charts/RegionChart";
import SexPyramidChart from "./charts/SexPyramidChart";

// --- Modern Styles ---
const containerStyle = {
  display: "grid",
  gap: "32px",
  gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))", // ⬅️ was 350px
  padding: "32px",
  backgroundColor: "#f9fafb",
  justifyItems: "stretch",
};


export default function Overview() {
  const [ageData, setAgeData] = useState([]);
  const [civilData, setCivilData] = useState([]);
  const [eduData, setEduData] = useState([]);
  const [occData, setOccData] = useState([]);
  const [sexData, setSexData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [majorCountryData, setMajorCountryData] = useState([]);
  const [originProvData, setOriginProvData] = useState([]);
  const [originRegionData, setOriginRegionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [age, civil, edu, occ, sex, countries, majorCountries, prov, region] = await Promise.all([
          getEmigrantAges(),
          getEmigrantCivilStatuses(),
          getEmigrantEdus(),
          getEmigrantOccupations(),
          getEmigrantSexes(),
          getCountriesAll(),
          getCountriesMajor(),
          getOriginProvinces(),
          getOriginRegions()
        ]);
        setAgeData(age);
        setCivilData(civil);
        setEduData(edu);
        setOccData(occ);
        setSexData(sex);
        setCountryData(countries);
        setMajorCountryData(majorCountries);
        setOriginProvData(prov);
        setOriginRegionData(region);
      } catch (e) {
        console.error("Failed to fetch overview data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Process Data ---

  const ageTrend = useMemo(() => {
    return ageData.sort((a, b) => a.year - b.year).map(r => {
      const total = Object.keys(r).reduce((sum, k) => (k !== 'id' && k !== 'year') ? sum + (r[k] || 0) : sum, 0);
      return { year: r.year, total };
    });
  }, [ageData]);

  const forecastSeries = useMemo(() => {
  return ageTrend.map(row => ({
    year: row.year,
    emigrants: row.total, // use total emigrants per year as the series
  }));
}, [ageTrend]);

  const civilTotal = useMemo(() => {
    const acc = {};
    civilData.forEach(r => Object.keys(r).forEach(k => {
      if (k !== 'id' && k !== 'year') acc[k] = (acc[k] || 0) + (r[k] || 0);
    }));
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [civilData]);

  const countryTotals = useMemo(() => {
    const acc = {};
    countryData.forEach(r => Object.keys(r).forEach(k => {
      if (k !== 'id' && k !== 'year') acc[k] = (acc[k] || 0) + (r[k] || 0);
    }));
    return acc;
  }, [countryData]);

  const majorCountryTotals = useMemo(() => {
    const acc = {};
    majorCountryData.forEach(r => Object.keys(r).forEach(k => {
      if (k !== 'id' && k !== 'year') acc[k] = (acc[k] || 0) + (r[k] || 0);
    }));
    return Object.entries(acc)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [majorCountryData]);

  const eduTotal = useMemo(() => {
    const acc = {};
    eduData.forEach(r => Object.keys(r).forEach(k => {
      if (k !== 'id' && k !== 'year') acc[k] = (acc[k] || 0) + (r[k] || 0);
    }));
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [eduData]);

  const occTotal = useMemo(() => {
    const acc = {};
    occData.forEach(r => Object.keys(r).forEach(k => {
      if (k !== 'id' && k !== 'year') acc[k] = (acc[k] || 0) + (r[k] || 0);
    }));
    return Object.entries(acc).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [occData]);

  const originProvTotals = useMemo(() => {
    const acc = {};
    originProvData.forEach(r => Object.keys(r).forEach(k => {
      if (k !== 'id' && k !== 'year') acc[k] = (acc[k] || 0) + (r[k] || 0);
    }));
    return acc;
  }, [originProvData]);

  const originRegionTotals = useMemo(() => {
    const acc = {};
    originRegionData.forEach(r => Object.keys(r).forEach(k => {
      if (k !== 'id' && k !== 'year') acc[k] = (acc[k] || 0) + (r[k] || 0);
    }));
    return Object.entries(acc).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [originRegionData]);

  const sexPyramidData = useMemo(() => {
    return sexData.sort((a, b) => b.year - a.year).map(r => ({
      year: r.year.toString(),
      male: -(Number(r.male) || 0),
      female: Number(r.female) || 0,
    }));
  }, [sexData]);


  if (loading) return <div style={{ padding: 24 }}>Loading Overview...</div>;

  return (
    <div style={containerStyle}>

       <DashboardCard title="Overview" style={{ gridColumn: "1 / -1" }}>
        <p style={{ marginTop: 8, lineHeight: 1.6 }}>
          This overview presents a data-driven look at four decades of Filipino
          emigration from 1981 to 2020 using official data from the Commission
          on Filipinos Overseas (CFO). The dashboard visualizes key trends and
          migrant characteristics, including the total number of emigrants per
          year, their civil status, sex, educational attainment, occupations,
          and places of origin within the Philippines. It also highlights global
          destination countries, showing where most Filipino emigrants have
          settled. By transforming these datasets into clear charts and maps,
          the platform helps reveal long-term patterns—such as shifts in
          migration volume, changing demographic profiles, and regional or
          international preferences—that support deeper understanding of the
          Filipino diaspora and its development implications.
        </p>
      </DashboardCard>  
      
      <DashboardCard
       title="MLP Forecast: Total Filipino Emigrants"
       style={{ gridColumn: "1 / -1" }}
       >
        <MLPForecast data={forecastSeries} />
      </DashboardCard>

      <DashboardCard title="Emigrants Trend (Total per Year)">
        <AgeTrendChart data={ageTrend} />
      </DashboardCard>

      <DashboardCard title="Emigrants by Civil Status">
        <CivilStatusChart data={civilTotal} />
      </DashboardCard>

      <DashboardCard title="Emigrant Destinations (World Map)" style={{ gridColumn: "1 / -1" }}>
        <WorldChoroplethMap data={countryTotals} />
      </DashboardCard>

      <DashboardCard title="Top 10 Destination Countries">
        <MajorCountriesChart data={majorCountryTotals} />
      </DashboardCard>

      <DashboardCard title="Emigrants by Education">
        <EducationChart data={eduTotal} />
      </DashboardCard>

      <DashboardCard title="Top 10 Occupations" style={{ gridColumn: "1 / -1" }}>
        <OccupationChart data={occTotal} />
      </DashboardCard>

      <DashboardCard title="Emigrants Origin (Philippines)" style={{ gridColumn: "1 / -1" }}>
        <PhilippinesChoroplethMap data={originProvTotals} />
      </DashboardCard>

      <DashboardCard title="Total Emigrants by Region" style={{ gridColumn: "1 / -1" }}>
        <RegionChart data={originRegionTotals} />
      </DashboardCard>

      <DashboardCard title="Emigrants by Sex (Population Pyramid)" style={{ gridColumn: "1 / -1" }}>
        <SexPyramidChart data={sexPyramidData} />
      </DashboardCard>
    </div>
  );
}