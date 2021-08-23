import ProgressCircle from "./ProgressCircle";

interface IProgressBar {
  status: 1 | 2 | 3;
}

const ProgressBar = ({ status }: IProgressBar) => (
  <div className="progress">
    <ProgressCircle text="1" active={status === 1} complete={status > 1} />
    <ProgressCircle text="2" active={status === 2} complete={status > 2} />
    <ProgressCircle text="3" active={status === 3} complete={status > 3} />

    <style jsx>{`
      .progress {
        height: 2vh;
        background-color: #003e86;
        display: flex;
        flex-direction: row;
        align-items: center;
        border-radius: 20px;
        justify-content: space-between;
        margin-bottom: 15vh;
        margin-top: 10vh;
        margin-left: 2vh;
        margin-right: 2vh;
      }
    `}</style>
  </div>
);

export default ProgressBar;
