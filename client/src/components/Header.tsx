import dynamic from "next/dynamic";
import Link from "next/link";
import SvgIcon from "./SvgIcon";
const MetaMask = dynamic(() => import("./MetaMask"));

interface IHeaderProps {
  path: string;
}

const Header = ({ path }: IHeaderProps) => {
  const isHomepage = path === "/";

  return (
    <div className="header">
      <Link href={`/`} prefetch>
        <img
          src="/static/images/enigma_logo.png"
          alt="Enigma Logo"
          width="125"
          style={{ cursor: "pointer" }}
        />
      </Link>
      <MetaMask />
      <Link href={isHomepage ? `/create` : `/`} prefetch>
        <div className="svgIconContainer">
          {isHomepage ? (
            <p>Add Lottery</p>
          ) : (
            <SvgIcon clickable={true} icon={isHomepage ? "add" : "clear"} />
          )}
        </div>
      </Link>

      <style jsx>{`
        .header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: 90vw;
          height: 5.5vh;
          margin-bottom: 1vh;
          margin-top: 1vh;
          margin-left: 5vw;
          margin-right: 5vw;
        }

        .svgIconContainer {
          display: flex;
          justify-content: flex-end;
          width: 125px;
          color: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Header;
