import { Add, Clear, Done } from "@material-ui/icons";

interface ISvgIconProps {
  icon: "add" | "clear" | "done";
  clickable: boolean;
}

const defaultStyle = {
  fill: "white",
  width: "5.5vh",
  height: "5.5vh"
};

const clickableStyle = {
  ...defaultStyle,
  cursor: "pointer"
};

const SvgIcon = ({ icon, clickable }: ISvgIconProps) => {
  const style = clickable ? clickableStyle : defaultStyle;

  if (icon === "add") {
    return <Add style={style} />;
  }
  if (icon === "clear") {
    return <Clear style={style} />;
  }
  if (icon === "done") {
    return <Done style={style} />;
  }
};

export default SvgIcon;
