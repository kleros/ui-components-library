import { useEffect } from "react";

//! type
function useFocusOutside(ref: any, callback: Function) {
  useEffect(() => {
    function handleEvent(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener("focusin", handleEvent);
    document.addEventListener("mousedown", handleEvent);
    return () => {
      document.removeEventListener("focusin", handleEvent);
      document.removeEventListener("mousedown", handleEvent);
    };
  }, [ref, callback]);
}

export default useFocusOutside;
