import { useEffect } from "react";
import { useLocation } from "react-router";

interface ScrollToTopProps {
  children: React.ReactNode;
}

const ScrollToTop: React.FC<ScrollToTopProps> = (props) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return <>{props.children}</>;
};

export default ScrollToTop;