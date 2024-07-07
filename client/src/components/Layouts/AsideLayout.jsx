import React from "react";
import { Button } from "react-bootstrap";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useAsideLayoutContext } from "../../context/AsideLayoutContext";

const AsideLayout = ({ asideContent, children, hideAsideContent=false }) => {
  const { isCollapsed, collapse } = useAsideLayoutContext();

  return (
    <div className="flex relative h-screen overflow-x-auto bg-gray-100">
      {!hideAsideContent && <>
        {isCollapsed && (
        <Button onClick={collapse} className="absolute left-4 top-1">
          <ChevronRight />
        </Button>
      )}
      <aside
        className={` bg-gray-100 z-20 group/sidebar lg:relative transition-all overflow-x-hidden ease-in-out duration-300 h-full  border-r-2 overflow-y-auto flex flex-col gap-y-4 ${isCollapsed ? "w-0 p-0" : "w-64 pt-16 px-2 fixed"
          } `}
      >
        {!isCollapsed && (
          <div
            role="button"
            onClick={collapse}
            className={
              "text-muted-foreground absolute transition-all duration-500 p-2 top-3 right-3 hover:bg-gray-200 rounded-lg group-hover/sidebar:!opacity-100"
            }
          >
            <ChevronLeft className="h-6 w-6 " />
          </div>
        )}
        {!isCollapsed && asideContent}
      </aside>
      </>}
      {children}
    </div>
  );
};

export default AsideLayout;
