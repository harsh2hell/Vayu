import React from 'react';

/**
 * WeatherStatusAnimation
 * 
 * Premium Apple Weather-inspired live animated weather status illustration.
 * Dynamically reacts to the city's current weather condition, cloud cover,
 * rain/thunderstorm intensity, and diurnal state.
 */
export const WeatherStatusAnimation = ({
  condition = '',
  icon = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  isNight = false,
  className = ''
}) => {
  const condLower = (condition || '').toLowerCase();
  const iconLower = (icon || '').toLowerCase();

  // Determine weather category
  const isThunderstorm = condLower.includes('thunder') || condLower.includes('storm') || condLower.includes('squall') || iconLower.includes('thunder');
  const isHail = isThunderstorm && condLower.includes('hail');
  const isRain = !isThunderstorm && (condLower.includes('rain') || condLower.includes('drizzle') || condLower.includes('shower') || iconLower.includes('rain'));
  const isSnow = condLower.includes('snow') || condLower.includes('sleet') || condLower.includes('ice');
  const isFog = condLower.includes('fog') || condLower.includes('haze') || condLower.includes('mist') || condLower.includes('dust') || iconLower.includes('fog');
  const isPartlyCloudy = !isThunderstorm && !isRain && !isSnow && !isFog && (condLower.includes('partly') || condLower.includes('scattered') || condLower.includes('mainly') || condLower.includes('sun'));
  const isCloudy = !isThunderstorm && !isRain && !isSnow && !isFog && (condLower.includes('cloud') || condLower.includes('overcast') || iconLower.includes('cloud'));
  const isClear = !isThunderstorm && !isRain && !isSnow && !isFog && !isCloudy;

  // Sizing definitions
  const dimensions = {
    sm: { width: 44, height: 44, box: 'w-11 h-11' },
    md: { width: 56, height: 56, box: 'w-14 h-14' },
    lg: { width: 68, height: 68, box: 'w-16 sm:w-[68px] h-16 sm:h-[68px]' }
  }[size] || { width: 56, height: 56, box: 'w-14 h-14' };

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${dimensions.box} ${className}`}
      title={condition}
      aria-label={condition}
    >
      <style>{`
        @keyframes weather-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }
        @keyframes weather-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes weather-sun-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.7)); }
        }
        @keyframes weather-rain-drop {
          0% { transform: translateY(-6px) scaleY(0.8); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.9; }
          100% { transform: translateY(18px) scaleY(1.2); opacity: 0; }
        }
        @keyframes weather-lightning-flash {
          0%, 82%, 88%, 94%, 100% { opacity: 0; transform: scaleY(0.7); }
          83%, 87% { opacity: 1; transform: scaleY(1.05); filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.95)); }
          90%, 93% { opacity: 0.9; transform: scaleY(1); filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.8)); }
        }
        @keyframes weather-cloud-drift-back {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-4px); }
        }
        @keyframes weather-cloud-drift-front {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(4px); }
        }
        @keyframes weather-fog-drift {
          0%, 100% { transform: translateX(-3px); opacity: 0.7; }
          50% { transform: translateX(3px); opacity: 0.95; }
        }
        @keyframes weather-hail-bounce {
          0% { transform: translateY(-5px) scale(0.8); opacity: 0; }
          30% { opacity: 1; }
          75% { transform: translateY(14px) scale(1); opacity: 0.9; }
          85% { transform: translateY(11px) scale(0.9); }
          100% { transform: translateY(15px) scale(0.7); opacity: 0; }
        }
        @keyframes weather-star-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .anim-float {
          animation: weather-float 3.5s ease-in-out infinite;
        }
        .anim-spin {
          animation: weather-spin-slow 16s linear infinite;
          transform-origin: 50% 50%;
        }
        .anim-sun-pulse {
          animation: weather-sun-pulse 3s ease-in-out infinite;
          transform-origin: 50% 50%;
        }
        .anim-cloud-back {
          animation: weather-cloud-drift-back 4s ease-in-out infinite;
        }
        .anim-cloud-front {
          animation: weather-cloud-drift-front 4.5s ease-in-out infinite;
        }
        .anim-lightning {
          animation: weather-lightning-flash 3.2s ease-in-out infinite;
          transform-origin: 50% 0%;
        }
      `}</style>

      {/* 1. THUNDERSTORM / SEVERE THUNDERSTORM & HAIL */}
      {isThunderstorm && (
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(30,58,138,0.25)] dark:drop-shadow-[0_4px_16px_rgba(56,189,248,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ambient Storm Glow */}
          <circle cx="32" cy="24" r="18" fill="url(#stormGlow)" opacity="0.6" className="anim-lightning" />
          
          {/* Dark Storm Cloud */}
          <g className="anim-float">
            <path
              d="M46 36C49.3137 36 52 33.3137 52 30C52 26.9676 49.7423 24.4608 46.8044 24.0622C46.1264 18.3975 41.3197 14 35.5 14C30.6477 14 26.5492 17.0706 25.0457 21.4111C24.0886 20.8354 22.9627 20.5 21.75 20.5C18.4363 20.5 15.75 23.1863 15.75 26.5C15.75 27.0504 15.8242 27.5835 15.9626 28.0894C13.6845 28.847 12 30.9847 12 33.5C12 36.5376 14.4624 39 17.5 39H46C49.3137 39 52 36.3137 52 33"
              fill="url(#stormCloudGrad)"
            />
            {/* Specular Rim Highlight */}
            <path
              d="M25.5 21C26.8 17 30.8 14.5 35.5 14.5C41 14.5 45.6 18.5 46.3 24"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>

          {/* Lightning Bolt */}
          <path
            d="M32 30L26 41H32L28 53L41 38H34L37 30H32Z"
            fill="url(#lightningGrad)"
            className="anim-lightning"
          />

          {/* Animated Falling Rain Droplets */}
          <g>
            <line
              x1="20" y1="41" x2="18" y2="47"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{ animation: 'weather-rain-drop 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '0.1s' }}
            />
            <line
              x1="26" y1="42" x2="24" y2="48"
              stroke="#0284c7"
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{ animation: 'weather-rain-drop 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '0.45s' }}
            />
            <line
              x1="40" y1="41" x2="38" y2="47"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{ animation: 'weather-rain-drop 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '0.25s' }}
            />
            <line
              x1="46" y1="43" x2="44" y2="49"
              stroke="#0284c7"
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{ animation: 'weather-rain-drop 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '0.65s' }}
            />
          </g>

          {/* Hailstones for Hailstorm Conditions */}
          {isHail && (
            <g>
              <circle
                cx="23" cy="46" r="1.6"
                fill="#e0f2fe"
                stroke="#bae6fd"
                strokeWidth="0.8"
                style={{ animation: 'weather-hail-bounce 0.9s ease-in-out infinite', animationDelay: '0.15s' }}
              />
              <circle
                cx="43" cy="47" r="1.6"
                fill="#ffffff"
                stroke="#93c5fd"
                strokeWidth="0.8"
                style={{ animation: 'weather-hail-bounce 0.9s ease-in-out infinite', animationDelay: '0.5s' }}
              />
            </g>
          )}

          <defs>
            <linearGradient id="stormCloudGrad" x1="12" y1="14" x2="52" y2="39" gradientUnits="userSpaceOnUse">
              <stop stopColor="#475569" />
              <stop offset="0.5" stopColor="#334155" />
              <stop offset="1" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="lightningGrad" x1="26" y1="30" x2="41" y2="53" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.5" stopColor="#facc15" />
              <stop offset="1" stopColor="#eab308" />
            </linearGradient>
            <radialGradient id="stormGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(32 24) rotate(90) scale(18)">
              <stop stopColor="#fde047" stopOpacity="0.8" />
              <stop offset="1" stopColor="#fde047" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      )}

      {/* 2. RAIN / SHOWERS / DRIZZLE */}
      {isRain && (
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(2,132,199,0.22)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Rain Cloud */}
          <g className="anim-float">
            <path
              d="M46 34C49.3137 34 52 31.3137 52 28C52 24.9676 49.7423 22.4608 46.8044 22.0622C46.1264 16.3975 41.3197 12 35.5 12C30.6477 12 26.5492 15.0706 25.0457 19.4111C24.0886 18.8354 22.9627 18.5 21.75 18.5C18.4363 18.5 15.75 21.1863 15.75 24.5C15.75 25.0504 15.8242 25.5835 15.9626 26.0894C13.6845 26.847 12 28.9847 12 31.5C12 34.5376 14.4624 37 17.5 37H46C49.3137 37 52 34.3137 52 31"
              fill="url(#rainCloudGrad)"
            />
            {/* Top Gloss */}
            <path
              d="M25.5 19C26.8 15 30.8 12.5 35.5 12.5C41 12.5 45.6 16.5 46.3 22"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>

          {/* Staggered Rain Streaks */}
          <g>
            <line
              x1="21" y1="39" x2="18" y2="47"
              stroke="#0284c7"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ animation: 'weather-rain-drop 1.1s ease-in infinite', animationDelay: '0.0s' }}
            />
            <line
              x1="28" y1="41" x2="25" y2="49"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ animation: 'weather-rain-drop 1.1s ease-in infinite', animationDelay: '0.4s' }}
            />
            <line
              x1="35" y1="40" x2="32" y2="48"
              stroke="#0284c7"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ animation: 'weather-rain-drop 1.1s ease-in infinite', animationDelay: '0.2s' }}
            />
            <line
              x1="42" y1="41" x2="39" y2="49"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ animation: 'weather-rain-drop 1.1s ease-in infinite', animationDelay: '0.6s' }}
            />
            <line
              x1="48" y1="39" x2="45" y2="47"
              stroke="#0284c7"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ animation: 'weather-rain-drop 1.1s ease-in infinite', animationDelay: '0.35s' }}
            />
          </g>

          <defs>
            <linearGradient id="rainCloudGrad" x1="12" y1="12" x2="52" y2="37" gradientUnits="userSpaceOnUse">
              <stop stopColor="#94a3b8" />
              <stop offset="0.5" stopColor="#64748b" />
              <stop offset="1" stopColor="#475569" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 3. SUNNY / CLEAR SKY */}
      {isClear && !isNight && (
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-[0_0_16px_rgba(251,191,36,0.45)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rotating Corona Rays */}
          <g className="anim-spin">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
              <line
                key={deg}
                x1="32" y1="8" x2="32" y2="13"
                stroke="url(#sunRayGrad)"
                strokeWidth={i % 2 === 0 ? "2.5" : "1.8"}
                strokeLinecap="round"
                transform={`rotate(${deg} 32 32)`}
              />
            ))}
          </g>

          {/* Pulsating Glowing Sun Disc */}
          <g className="anim-sun-pulse">
            <circle cx="32" cy="32" r="14" fill="url(#sunBodyGrad)" />
            {/* Top Specular Crescent Arc */}
            <path
              d="M21 27C23 21 28 19 35 20"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>

          <defs>
            <linearGradient id="sunBodyGrad" x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.4" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="sunRayGrad" x1="32" y1="8" x2="32" y2="13" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fbbf24" />
              <stop offset="1" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 4. CLEAR NIGHT / STARRY SKY */}
      {isClear && isNight && (
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-[0_4px_14px_rgba(99,102,241,0.22)] dark:drop-shadow-[0_0_16px_rgba(186,230,253,0.45)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Ambient Night Aura Disc for contrast on both light & dark backgrounds */}
          <circle cx="32" cy="32" r="23" fill="url(#nightAuraGrad)" opacity="0.85" />

          {/* Glowing Stars with distinct contrast */}
          <circle cx="16" cy="18" r="1.5" fill="#38bdf8" style={{ animation: 'weather-star-twinkle 2s ease-in-out infinite' }} />
          <circle cx="48" cy="16" r="1.8" fill="#818cf8" style={{ animation: 'weather-star-twinkle 2.5s ease-in-out infinite', animationDelay: '0.6s' }} />
          <circle cx="45" cy="46" r="1.4" fill="#fbbf24" style={{ animation: 'weather-star-twinkle 2.2s ease-in-out infinite', animationDelay: '1.2s' }} />
          <circle cx="20" cy="46" r="1.2" fill="#60a5fa" style={{ animation: 'weather-star-twinkle 2.8s ease-in-out infinite', animationDelay: '0.9s' }} />
          
          {/* Luminous Crescent Moon with Rich Lunar Gold / Warm Silver Gradient */}
          <g className="anim-float">
            <path
              d="M38 15C26.9543 15 18 23.9543 18 35C18 46.0457 26.9543 55 38 55C41.5938 55 44.9576 54.0483 47.8576 52.3888C39.4674 50.1585 33.2 42.4542 33.2 33.3C33.2 24.1458 39.4674 16.4415 47.8576 14.2112C44.9576 12.5517 41.5938 15 38 15Z"
              fill="url(#moonGrad)"
              stroke="rgba(254, 240, 138, 0.4)"
              strokeWidth="0.8"
            />
            {/* Highlight Edge */}
            <path
              d="M23 27C21.5 31 22 36.5 24.5 41"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>

          <defs>
            <radialGradient id="nightAuraGrad" cx="32" cy="32" r="23" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4338ca" stopOpacity="0.18" />
              <stop offset="0.7" stopColor="#312e81" stopOpacity="0.08" />
              <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="moonGrad" x1="18" y1="15" x2="48" y2="55" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.4" stopColor="#fde047" />
              <stop offset="0.75" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 5. PARTLY CLOUDY (SUN PEAKING BEHIND CLOUD) */}
      {isPartlyCloudy && (
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-[0_4px_14px_rgba(251,191,36,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sun in background */}
          <g className="anim-sun-pulse" style={{ transformOrigin: '42px 22px' }}>
            <circle cx="42" cy="22" r="11" fill="url(#sunCore)" />
            {/* Radiating Rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="42" y1="7" x2="42" y2="10"
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeLinecap="round"
                transform={`rotate(${deg} 42 22)`}
              />
            ))}
          </g>

          {/* Front Floating Cloud */}
          <g className="anim-cloud-front">
            <path
              d="M44 43C47.3137 43 50 40.3137 50 37C50 33.9676 47.7423 31.4608 44.8044 31.0622C44.1264 25.3975 39.3197 21 33.5 21C28.6477 21 24.5492 24.0706 23.0457 28.4111C22.0886 27.8354 20.9627 27.5 19.75 27.5C16.4363 27.5 13.75 30.1863 13.75 33.5C13.75 34.0504 13.8242 34.5835 13.9626 35.0894C11.6845 35.847 10 37.9847 10 40.5C10 43.5376 12.4624 46 15.5 46H44C47.3137 46 50 43.3137 50 40"
              fill="url(#partlyCloudGrad)"
              stroke="rgba(148, 163, 184, 0.35)"
              strokeWidth="0.8"
            />
            {/* Top Gloss Curve */}
            <path
              d="M23.5 28C24.8 24 28.8 21.5 33.5 21.5C39 21.5 43.6 25.5 44.3 31"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>

          <defs>
            <linearGradient id="sunCore" x1="33" y1="13" x2="51" y2="31" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fde047" />
              <stop offset="0.6" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="partlyCloudGrad" x1="10" y1="21" x2="50" y2="46" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.65" stopColor="#e2e8f0" />
              <stop offset="1" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 6. CLOUDY / OVERCAST */}
      {isCloudy && (
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(100,116,139,0.25)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back Cloud */}
          <g className="anim-cloud-back" opacity="0.75">
            <path
              d="M48 32C50.7614 32 53 29.7614 53 27C53 24.473 51.1186 22.384 48.6703 22.0518C48.1053 17.3313 44.1 13.6667 39.25 13.6667C35.2064 13.6667 31.791 16.2255 30.5381 19.8426C29.7405 19.3628 28.8023 19.0833 27.7917 19.0833C25.0302 19.0833 22.7917 21.3219 22.7917 24.0833C22.7917 24.542 22.8535 24.9863 22.9688 25.4078C21.0704 26.0392 19.6667 27.8206 19.6667 29.9167C19.6667 32.448 21.7187 34.5 24.25 34.5H48C50.7614 34.5 53 32.2614 53 29.5"
              fill="url(#cloudBackGrad)"
            />
          </g>

          {/* Front Cloud */}
          <g className="anim-cloud-front">
            <path
              d="M43 42C46.3137 42 49 39.3137 49 36C49 32.9676 46.7423 30.4608 43.8044 30.0622C43.1264 24.3975 38.3197 20 32.5 20C27.6477 20 23.5492 23.0706 22.0457 27.4111C21.0886 26.8354 19.9627 26.5 18.75 26.5C15.4363 26.5 12.75 29.1863 12.75 32.5C12.75 33.0504 12.8242 33.5835 12.9626 34.0894C10.6845 34.847 9 36.9847 9 39.5C9 42.5376 11.4624 45 14.5 45H43C46.3137 45 49 42.3137 49 39"
              fill="url(#cloudFrontGrad)"
              stroke="rgba(148, 163, 184, 0.35)"
              strokeWidth="0.8"
            />
            {/* Rim Highlight */}
            <path
              d="M22.5 27C23.8 23 27.8 20.5 32.5 20.5C38 20.5 42.6 24.5 43.3 30"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>

          <defs>
            <linearGradient id="cloudBackGrad" x1="19.6" y1="13.6" x2="53" y2="34.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#94a3b8" />
              <stop offset="1" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="cloudFrontGrad" x1="9" y1="20" x2="49" y2="45" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.6" stopColor="#e2e8f0" />
              <stop offset="1" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 7. FOG / HAZE / MIST */}
      {isFog && (
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(100,116,139,0.25)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Drifting Horizontal Mist Bands */}
          <g style={{ animation: 'weather-fog-drift 3.2s ease-in-out infinite' }}>
            <line x1="16" y1="20" x2="48" y2="20" stroke="url(#fogGrad)" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="12" y1="28" x2="52" y2="28" stroke="url(#fogGrad)" strokeWidth="3.6" strokeLinecap="round" />
            <line x1="18" y1="36" x2="46" y2="36" stroke="url(#fogGrad)" strokeWidth="3.4" strokeLinecap="round" />
            <line x1="14" y1="44" x2="50" y2="44" stroke="url(#fogGrad)" strokeWidth="3" strokeLinecap="round" />
          </g>

          <defs>
            <linearGradient id="fogGrad" x1="12" y1="28" x2="52" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#64748b" stopOpacity="0.45" />
              <stop offset="0.5" stopColor="#334155" stopOpacity="0.85" />
              <stop offset="1" stopColor="#64748b" stopOpacity="0.45" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 8. SNOW / SLEET */}
      {isSnow && (
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(147,197,253,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cloud */}
          <g className="anim-float">
            <path
              d="M44 34C47.3137 34 50 31.3137 50 28C50 24.9676 47.7423 22.4608 44.8044 22.0622C44.1264 16.3975 39.3197 12 33.5 12C28.6477 12 24.5492 15.0706 23.0457 19.4111C22.0886 18.8354 20.9627 18.5 19.75 18.5C16.4363 18.5 13.75 21.1863 13.75 24.5C13.75 25.0504 13.8242 25.5835 13.9626 26.0894C11.6845 26.847 10 28.9847 10 31.5C10 34.5376 12.4624 37 15.5 37H44C47.3137 37 50 34.3137 50 31"
              fill="url(#snowCloudGrad)"
            />
          </g>

          {/* Falling Snowflakes */}
          <g>
            <circle cx="22" cy="42" r="2" fill="#ffffff" stroke="#93c5fd" strokeWidth="0.8" style={{ animation: 'weather-rain-drop 1.8s ease-in infinite', animationDelay: '0.1s' }} />
            <circle cx="32" cy="44" r="2.2" fill="#ffffff" stroke="#93c5fd" strokeWidth="0.8" style={{ animation: 'weather-rain-drop 1.8s ease-in infinite', animationDelay: '0.6s' }} />
            <circle cx="42" cy="42" r="1.8" fill="#ffffff" stroke="#93c5fd" strokeWidth="0.8" style={{ animation: 'weather-rain-drop 1.8s ease-in infinite', animationDelay: '1.1s' }} />
          </g>

          <defs>
            <linearGradient id="snowCloudGrad" x1="10" y1="12" x2="50" y2="37" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.6" stopColor="#e2e8f0" />
              <stop offset="1" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
};

export default WeatherStatusAnimation;
