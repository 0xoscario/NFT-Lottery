import App from "../src/App";
import Home from "../src/Home";

export default req => {
  return App({
    path: req.url.pathname,
    View: Home
  });
};
