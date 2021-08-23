import SvgIcon from "./SvgIcon";

interface IProgress {
  text: string;
  active: boolean;
  complete: boolean;
}

const ProgressCircle = ({ text, active, complete }: IProgress) => (
  <div className="container">
    {complete ? <SvgIcon clickable={false} icon="done" /> : text}

    <style jsx>{`
      .container {
        background-color: ${active ? "#E72A9B" : "#003e86"};
        border-radius: 50%;
        border: ${!active ? "solid 2px #003e86" : " solid 2px #E72A9B"};
        width: 5.5vh;
        height: 5.5vh;
        line-height: 5.5vh;
        text-align: center;
        justify-content: center;
        font-size: 3vh;
        color: white;
      }
    `}</style>
  </div>
);

export default ProgressCircle;
