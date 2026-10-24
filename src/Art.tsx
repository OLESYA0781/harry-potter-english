export function Character({
  name = "Harry",
  action = false,
}: {
  name?: string;
  action?: boolean;
}) {
  const hair =
    name === "Hermione"
      ? "#633e2f"
      : name === "Ron"
        ? "#c56a32"
        : name === "Draco"
          ? "#e7d2a0"
          : name === "Dumbledore"
            ? "#e8e2d5"
            : "#302b27";
  const beard = name === "Hagrid" || name === "Dumbledore";
  return (
    <svg
      viewBox="0 0 180 190"
      role="img"
      aria-label={`${name}${action ? " " + ({ Harry: "drinking tea", Hermione: "reading a book", Ron: "eating a sandwich", Draco: "playing with a ball", Hagrid: "sleeping on a sofa", Dumbledore: "writing a letter" }[name] || "") : ""}`}
    >
      <ellipse cx="90" cy="177" rx="65" ry="8" fill="#30251d" opacity=".12" />
      {name === "Hagrid" && action && (
        <rect x="6" y="112" width="168" height="62" rx="17" fill="#a86b4d" />
      )}
      <path
        d="M34 174L43 117Q90 88 137 117L147 174Z"
        fill={
          name === "Draco"
            ? "#34584b"
            : name === "Hagrid"
              ? "#81624c"
              : "#34423d"
        }
      />
      <path d="M66 113L90 147L114 113" fill="#f5e9cc" />
      <path
        d="M85 120h10l5 36-10 10-10-10Z"
        fill={name === "Draco" ? "#7ba38d" : "#b1574e"}
      />
      <ellipse
        cx="90"
        cy="67"
        rx={name === "Hagrid" ? 47 : 43}
        ry="48"
        fill={hair}
      />
      <ellipse cx="90" cy="77" rx="33" ry="39" fill="#efc49b" />
      <path
        d="M55 61Q53 19 87 25Q123 16 128 65L110 46L96 53L85 42L68 58Z"
        fill={hair}
      />
      {name === "Hermione" && (
        <>
          <path d="M54 43Q17 83 51 128L68 109L57 79Z" fill={hair} />
          <path d="M123 43Q157 82 129 127L113 108L124 78Z" fill={hair} />
        </>
      )}
      {name === "Hagrid" && (
        <path
          d="M55 85Q49 151 90 146Q137 145 125 85L111 102L90 107L70 101Z"
          fill={hair}
        />
      )}
      {name === "Dumbledore" && (
        <>
          <path
            d="M57 86L72 154L90 175L108 151L124 86L108 105L73 105Z"
            fill={hair}
          />
          <path d="M52 43L91 0L128 44Z" fill="#6e7385" />
          <path
            d="M80 20l4 8 9-4-5 8 5 7-9-2-6 7 1-10-7-5 9-1Z"
            fill="#edcf77"
          />
        </>
      )}
      {name === "Hagrid" && action ? (
        <>
          <path
            d="M70 76q7 6 13 0M100 76q7 6 13 0"
            fill="none"
            stroke="#493e35"
            strokeWidth="3"
          />
          <text x="136" y="56" fill="#526a66" fontSize="22">
            z Z
          </text>
        </>
      ) : (
        <>
          <circle cx="77" cy="77" r="3" fill="#342c28" />
          <circle cx="103" cy="77" r="3" fill="#342c28" />
        </>
      )}
      {(name === "Harry" || name === "Dumbledore") && (
        <g fill="none" stroke="#584e42" strokeWidth="2.5">
          <circle cx="76" cy="78" r="13" />
          <circle cx="104" cy="78" r="13" />
          <path d="M89 77h2" />
        </g>
      )}
      {name === "Harry" && (
        <path
          d="M101 45l-5 9h7l-5 8"
          fill="none"
          stroke="#ae735b"
          strokeWidth="2"
        />
      )}
      {!beard && (
        <path
          d="M81 96q9 8 18 0"
          fill="none"
          stroke="#a96953"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {action && name === "Harry" && (
        <g>
          <path d="M98 121h30v24q-15 12-30 0Z" fill="#f5e6c6" />
          <path
            d="M128 125q20 0 0 15"
            fill="none"
            stroke="#f5e6c6"
            strokeWidth="5"
          />
          <path
            d="M106 114q-6-7 1-13m10 13q-6-7 1-13"
            stroke="#eddfc5"
            fill="none"
            strokeWidth="3"
          />
        </g>
      )}
      {action && name === "Hermione" && (
        <g stroke="#e6cd91" strokeWidth="2">
          <path d="M45 131l45 8v34l-45-8Z" fill="#87524c" />
          <path d="M135 131l-45 8v34l45-8Z" fill="#99665c" />
        </g>
      )}
      {action && name === "Ron" && (
        <g>
          <path
            d="M64 143l30-27 29 27Z"
            fill="#f3d490"
            stroke="#bc8b51"
            strokeWidth="3"
          />
          <path d="M69 145h50" stroke="#70924a" strokeWidth="5" />
        </g>
      )}
      {action && name === "Draco" && (
        <g>
          <circle cx="120" cy="147" r="24" fill="#d7b563" />
          <path
            d="M97 147h46m-23-24q-20 24 0 48m0-48q20 24 0 48"
            stroke="#9c644a"
            fill="none"
            strokeWidth="2"
          />
        </g>
      )}
      {action && name === "Dumbledore" && (
        <g>
          <path d="M86 136h55l-7 37H79Z" fill="#fff0c8" />
          <path d="M118 153l25-46q13-6 9 7Z" fill="#b18b5e" />
          <path d="M92 151h18m-20 8h27" stroke="#998065" />
        </g>
      )}
    </svg>
  );
}
export function Castle() {
  return (
    <svg
      viewBox="0 0 800 540"
      role="img"
      aria-label="An original illustration of a magical castle on a wooded hill under the moon"
    >
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stopColor="#243f3b" />
          <stop offset="1" stopColor="#4e6960" />
        </linearGradient>
        <linearGradient id="stone" x2="0" y2="1">
          <stop stopColor="#d4c7a4" />
          <stop offset="1" stopColor="#8d9c86" />
        </linearGradient>
      </defs>
      <rect width="800" height="540" rx="140" fill="url(#sky)" />
      <circle cx="582" cy="105" r="49" fill="#efdca2" />
      <circle cx="563" cy="90" r="45" fill="#2b4640" />
      {[40, 115, 220, 340, 420, 670, 735].map((x, i) => (
        <g key={x} fill="#e6ce86">
          <circle cx={x} cy={60 + ((i * 47) % 180)} r="2" />
          <path
            d={`M${x + 18} ${110 + ((i * 31) % 160)}v10m-5-5h10`}
            stroke="#e6ce86"
          />
        </g>
      ))}
      <path d="M0 448Q160 294 345 413Q620 290 800 438V540H0Z" fill="#243e35" />
      <path d="M100 477Q400 345 690 485L760 540H30Z" fill="#526b50" />
      <g fill="url(#stone)" stroke="#7f8c76" strokeWidth="2">
        <path d="M192 249h90v203h-90Z" />
        <path d="M287 215h166v237H287Z" />
        <path d="M464 275h114v177H464Z" />
        <path d="M357 142h56v310h-56Z" />
        <path d="M590 204h55v255h-55Z" />
      </g>
      <g fill="#5c6260">
        <path d="M175 249l61-106 63 106Z" />
        <path d="M272 215l98-91 98 91Z" />
        <path d="M340 142l45-94 46 94Z" />
        <path d="M446 275l76-80 74 80Z" />
        <path d="M574 204l44-89 44 89Z" />
      </g>
      <g fill="#efcc74">
        {[213, 250, 310, 345, 389, 427, 485, 548, 608].map((x, i) => (
          <g key={x}>
            <path d={`M${x} ${290 - (i % 3) * 20}q7-15 14 0v20h-14Z`} />
            <path d={`M${x} 364q7-15 14 0v20h-14Z`} />
          </g>
        ))}
      </g>
      <path d="M350 452v-47q25-38 50 0v47" fill="#4a5348" />
      <path
        d="M368 454Q320 489 423 540h150Q386 473 393 454"
        fill="#c6b98b"
        opacity=".8"
      />
      {[95, 140, 665, 710, 751].map((x, i) => (
        <g key={x}>
          <path d={`M${x} ${360 + (i % 2) * 40}l-35 100h70Z`} fill="#1c3930" />
          <path d={`M${x} 460v30`} stroke="#304632" strokeWidth="7" />
        </g>
      ))}
      <g fill="#f7d88a">
        <circle cx="166" cy="365" r="3" />
        <circle cx="620" cy="449" r="4" />
        <circle cx="473" cy="473" r="3" />
        <circle cx="302" cy="318" r="3" />
      </g>
    </svg>
  );
}
