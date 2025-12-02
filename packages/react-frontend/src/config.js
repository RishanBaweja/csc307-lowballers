const isHosted =
  typeof window !== "undefined" &&
  window.location.hostname.includes("azurestaticapps.net");

const API_BASE = isHosted
  ? "https://lowballers-efdua2e5h8fsg5bx.westus3-01.azurewebsites.net/"
  : "http://localhost:8000";

export default API_BASE;
