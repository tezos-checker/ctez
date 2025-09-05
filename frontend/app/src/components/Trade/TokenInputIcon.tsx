import { InputRightElement, Text } from "@chakra-ui/react";
import React from "react";
import { TOKEN, TToken } from "../../constants/swap";
import { TezIcon, CTezIcon } from "../icons";

interface TokenInputIconProps {
  token: TToken;
}

const TokenInputIcon: React.FC<TokenInputIconProps> = ({ token }) => {
  if (token === TOKEN.Tez) {
    return (
      <InputRightElement backgroundColor="transparent" w={24}>
        <TezIcon height={28} width={28} />
        <Text mx={1}>tez</Text>
      </InputRightElement>
    );
  }

  return (
    <InputRightElement backgroundColor="transparent" w={24}>
      <CTezIcon height={28} width={28} />
      <Text mx={1}>ctez</Text>
    </InputRightElement>
  );
}

export default TokenInputIcon;
