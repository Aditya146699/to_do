"use client"; // Mark this as a client component

import { useEffect, useState } from "react";

const ThemeProvider = () => {
  const [theme, setTheme] = useState<string>("default");

  // Load theme from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "default";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Update local storage and HTML attribute when theme changes
  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <>
      {/* Theme Dropdown */}
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn m-1">
          Theme
          <svg
            width="12px"
            height="12px"
            className="inline-block h-2 w-2 fill-current opacity-60"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
          >
            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
          </svg>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl"
        >
          {[
            "default",
            "cupcake",
            "retro",
            "luxury",
            "sunset",
            "night",
            "cyberpunk",
            "valentine",
            "aqua",
            "winter",
            "dracula",
            "synthwave",
            "halloween",
            "coffee",
          ].map((themeOption) => (
            <li key={themeOption}>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                aria-label={themeOption}
                value={themeOption}
                checked={theme === themeOption}
                onChange={() => changeTheme(themeOption)}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ThemeProvider;