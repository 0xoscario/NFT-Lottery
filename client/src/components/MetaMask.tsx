import { observer } from "mobx-react";
import web3Store from "../stores/web3";

const GetText = ({
  isInstalled,
  isLoggedIn,
  account,
  network
}: typeof web3Store) => {
  if (!isInstalled) {
    return (
      <a
        href="https://metamask.io/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#FF6A29", textDecoration: "none" }}
      >
        INSTALL METAMASK
      </a>
    );
  } else if (!isLoggedIn) {
    return <div>UNLOCK METAMASK</div>;
  }

  const accountSmall = (() => {
    const start = account.substr(0, 3);
    const end = account.substr(account.length - 3, account.length);

    return `${start}...${end}`;
  })();

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ paddingRight: "1vh" }}>{`[${accountSmall}]`}</div>
      <div>{network}</div>
    </div>
  );
};

const Metamask = observer(() => {
  const { isLoggedIn } = web3Store;

  return (
    <div className="metamaskStatus">
      <img
        src="/static/images/metamask.png"
        alt="Metamask Logo"
        className="img"
      />
      {GetText(web3Store)}

      <style jsx>{`
        .img {
          width: 4vh;
          height: 4vh;
          padding-right: 1vh;
        }

        .metamaskStatus {
          background-color: #fafafa;
          border: 1px solid ${isLoggedIn ? "#56A2BA" : "#FF6A29"};
          color: ${isLoggedIn ? "#56A2BA" : "#FF6A29"};
          border-radius: 3px;
          padding-left: 2vh;
          padding-right: 2vh;
          font-size: calc(12px + 0.4vw);
          height: 4.5vh;
          display: flex;
          flex-direction: row;
          justify-content: space-evenly;
          align-items: center;
        }
      `}</style>
    </div>
  );
});

export default Metamask;
