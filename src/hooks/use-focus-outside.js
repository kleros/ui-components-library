import { useEffect } from "react";

function useFocusOutside(ref, callback) {
  useEffect(() => {
    function handleEvent(event) {
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
