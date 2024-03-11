import React from "react";
import { Button } from "react-bootstrap";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useAsideLayoutContext } from "../../context/AsideLayoutContext";

const ClientAsideLayout = ({ asideContent, children }) => {
  const { isCollapsed, collapse } = useAsideLayoutContext();

  return (
    <div className="flex relative overflow-x-auto  justify-between ">
      {isCollapsed && (
        <button
          onClick={collapse}
          className=" absolute p-2 hover:bg-gray-100 transition-all rounded-lg left-1 "
        >
          <ChevronRight />
        </button>
      )}
      <aside
        className={`z-20 group/sidebar  transition-all overflow-x-hidden ease-in-out duration-300 h-full  border-r-2 overflow-y-auto flex flex-col gap-y-4 ${
          isCollapsed ? "w-0 p-0" : "w-64 min-w-60 px-2"
        } `}
      >
        {!isCollapsed && (
          <div className="flex justify-end">
            <button
              onClick={collapse}
              className=" p-2 hover:bg-gray-100 group-hover/sidebar:!opacity-100 transition-all rounded-lg "
            >
              <ChevronLeft />
            </button>
          </div>
        )}
        {/* {!isCollapsed && asideContent} */}
        {asideContent}
      </aside>
      {children}
    </div>
  );
};

export default ClientAsideLayout;
