import CircularProgress from "@material-ui/core/CircularProgress";

const Loading = () => {
  return (
    <CircularProgress
      style={{
        color: "white",
        width: "2vh",
        height: "2vh",
        margin: "1vh"
      }}
    />
  );
};

export default Loading;
