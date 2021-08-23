import App from "../src/App";
import Create from "../src/Create";

export default req => {
  return App({
    path: req.url.pathname,
    View: Create
  });
};
