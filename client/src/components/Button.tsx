import { CSSProperties } from "react";
import Loading from "./Loading";

interface IButtonProps {
  children?: any;
  onClick?: () => any;
  disabled?: boolean;
  style?: CSSProperties;
  loading?: boolean;
  undertext?: any;
}

const Button = ({
  children,
  onClick,
  disabled,
  style,
  loading = false,
  undertext
}: IButtonProps) => (
  <>
    <button onClick={onClick} style={style} disabled={disabled}>
      {loading ? (
        <div className="loading">
          <Loading />
        </div>
      ) : (
        <div>{children}</div>
      )}
    </button>
    {undertext ? <div className="undertext">{undertext}</div> : null}

    <style jsx>{`
      button {
        background: ${!disabled ? "#e72a9b" : "#634e5a"};
        font-size: 2vh;
        width: 10vh;
        height: 4vh;
        color: white;
        border: none;
        border-radius: 15px;
        margin-left: 1vh;
        margin-right: 1vh;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        cursor: pointer;
      }
    `}</style>
  </>
);

export default Button;
