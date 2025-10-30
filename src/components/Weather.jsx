// import React from 'react'
// import clear_icon from '../assets/clear.png'
// import humidity_icon from '../assets/humidity.png'
// import search_icon from '../assets/search.png'
// import wind_icon from '../assets/wind.png'
// import './Weather.css'

// function Weather() {
//   return (
//     <div className= 'weather'>
//     <div className="search-bar">
//     <input type="text" placeholder='Search' />
//     <img src={search_icon} alt="" />
//     </div>
//     <img src={clear_icon} alt="" className='weather-icon'/>
//     <p className='temperature'>16°c</p>
//     <p className='location'>London</p>
//     <div className= "weather-data">
//         <div className = "col">
//             <img src = {humidity_icon} alt =""/>
//             <div>
//                 <p>91%</p>
//                 <span>Humidity</span>
//             </div>
//         </div>
//         <div className = "col">
//             <img src = {wind_icon} alt =""/>
//             <div>
//                 <p>3.6 Km/hr</p>
//                 <span>Wind Speed</span>
//             </div>
//         </div>
//     </div>
//     </div>
//   )
// }

// export default Weather

import React, { useEffect, useRef, useState } from 'react'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import humidity_icon from '../assets/humidity.png'
import rain_icon from '../assets/rain.png'
import search_icon from '../assets/search.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'

import './Weather.css'

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

function Weather() {
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState({
    location: '',
    temperature: null, // °C
    humidity: null,    // %
    wind: null,        // km/h
    code: null,
  })

  useEffect(() => {
    // // want to display the msg
    // fetchWeatherByCity('London')
    // // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchWeatherByCity(city) {
    try {
      setError('')
      setLoading(true)

      // 1) Geocode city -> lat/lon
      const geoRes = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1`)
      if (!geoRes.ok) throw new Error('Geocoding failed')
      const geoJson = await geoRes.json()
      const place = geoJson?.results?.[0]
      if (!place) throw new Error('Location not found')

      const { latitude, longitude, name, country } = place

      // 2) Fetch current weather
    const url =
        `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
        `&wind_speed_unit=kmh&timezone=auto`

    //   const url =
    //     `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
    //     `&current=temperature_2m,relative_humidity_2m,wind_speed_10m` +
    //     `&wind_speed_unit=kmh&timezone=auto`


      const wxRes = await fetch(url)
      if (!wxRes.ok) throw new Error('Weather fetch failed')
      const wx = await wxRes.json()
      const cur = wx?.current

      setData({
        location: country ? `${name}, ${country}` : name,
        temperature: cur?.temperature_2m ?? null,
        humidity: cur?.relative_humidity_2m ?? null,
        wind: cur?.wind_speed_10m ?? null,
        code: cur?.weather_code ?? null,
      })
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function getIconByWMO(code) {
  if (code == null) return clear_icon;

  if (code === 0) return clear_icon;                           // Clear
  if ([1, 2, 3].includes(code)) return cloud_icon;             // Mainly clear/partly cloudy/overcast
  if ([45, 48].includes(code)) return cloud_icon;              // Fog
  if ([51, 53, 55, 56, 57].includes(code)) return drizzle_icon;// Drizzle / freezing drizzle
  if ([61, 63, 65, 80, 81, 82].includes(code)) return rain_icon; // Rain
  if ([66, 67].includes(code)) return rain_icon;               // Freezing rain (fallback to rain)
  if ([71, 73, 75, 77, 85, 86].includes(code)) return snow_icon;// Snow / snow showers
  if ([95, 96, 99].includes(code)) return rain_icon;           // Thunderstorms (fallback to rain)

  return clear_icon;
}


//   function onSearchClick() {
//     if (!query.trim()) return
//     fetchWeatherByCity(query.trim())
//   }

function onSearchClick() {
    const city = query.trim()
    if (!city) {
      alert('Enter city name')
      inputRef.current?.focus()
      return
    }
    fetchWeatherByCity(city)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') onSearchClick()
  }


  const weatherIcon = getIconByWMO(data.code)

  const hasData =
  data.temperature !== null ||
  data.humidity !== null ||
  data.wind !== null;

  return (
    <div className='weather'>
      <div className="search-bar">
        <input
          ref={inputRef}
          type="text"
          placeholder='Search city'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <img
          src={search_icon}
          alt="Search"
          role="button"
          tabIndex={0}
          onClick={onSearchClick}
          onKeyDown={(e) => e.key === 'Enter' && onSearchClick()}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {loading ? (
        <div className="loading-wrap">
            <div className="loader" role="status" aria-label="Loading" />
        </div>
        ) : error ? (
          <p className="error">{error}</p>
        ) : !hasData ? (
          <div className="empty-state">
            <p>Please enter the name of a city to get the current weather details.</p>
          </div>
      ) : (
        <>
          <img src={weatherIcon} alt="" className='weather-icon'/>
          <p className='temperature'>
            {data.temperature !== null ? `${Math.round(data.temperature)}°C` : '--'}
          </p>
          <p className='location'>{data.location || '—'}</p>

          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="Humidity"/>
              <div>
                <p>{data.humidity !== null ? `${Math.round(data.humidity)}%` : '--'}</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="Wind speed"/>
              <div>
                <p>{data.wind !== null ? `${Math.round(data.wind)} km/h` : '--'}</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Weather
