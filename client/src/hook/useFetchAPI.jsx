import { useEffect, useState } from "react";

const useFetchAPI = (apiURL) => {
  const [data, setData] = useState(null);
  const getData = async (apiURL) => {
    try {
      const res = await fetch(apiURL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setData(null);
    }
  };
  useEffect(() => {
    if (apiURL) {
      getData(apiURL);
    }
  }, [apiURL]);
  return data;
};

export default useFetchAPI;
