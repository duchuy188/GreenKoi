import { Anchor } from "antd";

const TempFix = () => {
  return (
    <Anchor
      items={[
        {
          key: "temp-key",
          href: "#temp-href",
          title: "Temp Title",
        },
      ]}
    />
  );
};

export default TempFix;
