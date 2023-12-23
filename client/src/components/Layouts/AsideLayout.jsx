import React from "react";
import { Button } from "react-bootstrap";
import { ChevronRight } from "lucide-react";
import { useAsideLayoutContext } from "../../context/AsideLayoutContext";

const AsideLayout = ({ asideContent, children }) => {
  // const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const { isCollapsed, collapse } = useAsideLayoutContext();

  return (
    <div className="flex relative h-screen overflow-x-auto bg-gray-100">
      {isCollapsed && (
        <Button onClick={collapse} className="absolute left-4 top-1">
          <ChevronRight />
        </Button>
      )}
      <aside
        className={` bg-gray-100 group/sidebar lg:relative transition-all overflow-x-hidden ease-in-out duration-300 h-full border-r-2 overflow-y-auto flex flex-col gap-y-4 ${
          isCollapsed ? "w-0 p-0" : "w-64 p-2 z-20 fixed"
        } `}
      >
        {!isCollapsed && asideContent}
      </aside>
      {children}
    </div>
  );
};

export default AsideLayout;
