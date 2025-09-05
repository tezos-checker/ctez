import { RadioGroup, Stack, Radio } from "@chakra-ui/react"
import React from "react"
import { useThemeColors } from "../../../hooks/utilHooks"

export type DexSide = 'ctez' | 'tez'

export interface DexSideSelectorProps {
  value: DexSide;
  onChange: (value: DexSide) => void;
}

const DexSideSelector: React.FC<DexSideSelectorProps> = ({ value, onChange }) => {
  const [text2] = useThemeColors([
    'text2',
  ]);

  return <RadioGroup onChange={onChange} value={value} color={text2}>
    <Stack direction='row' mb={4} spacing={6}>
      <Radio value='ctez'>Ctez</Radio>
      <Radio value='tez'>Tez</Radio>
    </Stack>
  </RadioGroup>
}

export default DexSideSelector
