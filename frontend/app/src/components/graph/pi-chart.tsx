import { useColorMode, useMediaQuery } from '@chakra-ui/react';
import { format } from 'date-fns/fp';
import React, { Dispatch, ReactNode, SetStateAction, useCallback, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';
import { useThemeColors } from '../../hooks/utilHooks';
import { trimAddress, trimSizeMap } from '../../utils/addressUtils';
import { NETWORK } from '../../utils/globals';
import { numberToMillionOrBillionFormate } from '../../utils/numberFormate';
import './pi-chart.css';

const RenderActiveShape = (props: any) => {
  function toDegrees(angle: number) {
    return angle * (180 / Math.PI);
  }
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
    textColor,
    address,
    name
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 10) * cos;
  const my = cy + (outerRadius + 10) * sin;
  const ex = mx + ((toDegrees(RADIAN * midAngle) > 60 && toDegrees(RADIAN * midAngle) < 136) ? ((cos >= 0 ? 1 : -1) * 12) : ((cos >= 0 ? 1 : -1) * 0.01));
  const ey = my + ((toDegrees(RADIAN * midAngle) > 60 && toDegrees(RADIAN * midAngle) < 136) ? -15 : 0);
  const textAnchor = cos >= 0 ? "start" : "end";
  const [largerScreen] = useMediaQuery(['(min-width: 900px)']);

  return (
    <g style={{ zIndex: 999 }}>
      <text x={cx} y={cy} dy={1} textAnchor="middle" fill={fill} fontSize={largerScreen ? '' : '10px'}>
        {payload.address === "Others" ? 'Others' :
          <a className='hoverPointer' href={`https://${NETWORK}.tzkt.io/${payload.address}`} target="_blank" rel="noreferrer" >{trimAddress(payload.address)}</a>}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 1}
        outerRadius={outerRadius + 4}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 10}
        y={ey}
        textAnchor={textAnchor}
        fill={textColor}
        fontSize={largerScreen ? '12px' : '10px'}
        className='alingright'
      >Minted</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 10}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill={textColor}
        fontWeight={600}
        fontSize={largerScreen ? '14px' : '12px'}
        className='alingright'
      >
        {`${name ? numberToMillionOrBillionFormate(name) : 0} CTEZ`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 10}
        y={ey}
        dy={32}
        fontSize={largerScreen ? '12px' : '10px'}
        className='alingright'
        textAnchor={textAnchor}
        fill='#B0B7C3'
      >
        {`${(percent * 100).toFixed(2)}%`}
      </text>
    </g>
  );
};
const ColorPalet = ['#463ABF', '#7B70FF', '#A586E3', '#675CD5', '#2161F7', '#8FA9FA']
const DEFAULT_HEIGHT = 300;
const DEFAULT_HEIGHT_MOBILE = 270;
const formatDay = format('dd');
const formatMonth = format('dd LLL');
export type PiChartProps = {
  data: any[];
  color?: string | undefined;
  color2?: string | undefined;
  strokeColor?: string | undefined;
  height?: number | undefined;
  minHeight?: number;
  setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
  setLabel?: Dispatch<SetStateAction<number | undefined>>; // used for label of valye
  value?: number;
  label?: number;
  topLeft?: ReactNode | undefined;
  topRight?: ReactNode | undefined;
  bottomLeft?: ReactNode | undefined;
  bottomRight?: ReactNode | undefined;
  isShowMonth?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const PiChart = ({
  data,
  color = '#0F62FF',
  color2 = '#38CB89',
  strokeColor = '#CCD2E3',
  value,
  label,
  setValue,
  setLabel,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  isShowMonth = false,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: PiChartProps) => {
  const parsedValue = value;
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  const [textColor, text4] = useThemeColors([
    'textColor',
    'text4',
  ]);
  const theme = useColorMode();
  const [largerScreen] = useMediaQuery(['(min-width: 900px)']);

  return (
    <ResponsiveContainer height={largerScreen ? DEFAULT_HEIGHT : DEFAULT_HEIGHT_MOBILE} width='100%'>

      <PieChart className="pie-chart">
        <Pie
          style={{ outline: 'none' }} 
          data={data}
          dataKey="ctez_outstanding" 
          nameKey="ctez_outstanding"
          cx="50%"
          cy="50%"
          innerRadius={largerScreen ? "58%" : '35%'}
          outerRadius={largerScreen ? "70%" : '50%'}
          focusable={false}
          fill="#82ca9d"
          activeIndex={activeIndex}
          activeShape={<RenderActiveShape textColor={theme.colorMode === 'dark' ? '#FFFFFF' : '#4E5D78'} />}
          onMouseEnter={onPieEnter}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={ColorPalet[index % ColorPalet.length]} style={{ outline: 'none' }} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PiChart;
