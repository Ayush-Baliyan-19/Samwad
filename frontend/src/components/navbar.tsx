import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import React from "react";

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    console.log(theme);
  };

  return (
    <div className={`${theme === "dark" ? "bg-[#19181799]" : "bg-[#FFFAF599]"} z-[100] backdrop-blur-[13px] flex w-full justify-evenly fixed items-center pt-5 pb-2 tracking-[1px]`} >
      <div className="flex justify-between m-auto w-11/12">
        <p>
          <h1
            className={`hover:cursor-pointer transition-all duration-300 capitalize font-bold text-[1.4rem] tracking-[0.5px] max-sm:mx-5 max-sm:text-xl`}
          >
            Sam<span className="block-inline text-[#ffaa2b] ">wad</span>
          </h1>
        </p>
        <div>
          <div
            className="h-full flex justify-center flex-col max-sm:mx-5"
            onClick={toggleTheme}
          >
            {useTheme().theme === "light" ? (
              <SunIcon className="w-full"></SunIcon>
            ) : (
              <MoonIcon className="w-full"></MoonIcon>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
