import React, { Dispatch, SetStateAction, ReactNode } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  Tooltip,
  AreaChart,
  Area,
  YAxis,
  CartesianGrid,
  TooltipProps,
} from 'recharts';
import { format, parseISO } from 'date-fns/fp';
import { Box } from '@chakra-ui/react';
import { numberToMillionOrBillionFormate } from '../../utils/numberFormate';

const DEFAULT_HEIGHT = 300;
const formatDay = format('dd');
const formatMonth = format('LLL');

export type LineChartProps = {
  data: any[];
  color?: string | undefined;
  color2?: string | undefined;
  strokeColor?: string | undefined;
  height?: number | undefined;
  minHeight?: number;
  setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
  setLabel?: Dispatch<SetStateAction<number | undefined>>; // used for label of valye
  value?: number;
  label1?: number;
  topLeft?: ReactNode | undefined;
  topRight?: ReactNode | undefined;
  bottomLeft?: ReactNode | undefined;
  bottomRight?: ReactNode | undefined;
  isShowMonth?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const TwoLineChart = ({
  data,
  color = '#0F62FF',
  color2 = '#38CB89',
  strokeColor = '#CCD2E3',
  value,
  label1,
  setValue,
  setLabel,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  isShowMonth = false,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const parsedValue = value;
  const dataassending = data.sort((a, b) => a.value - b.value);
  const top = dataassending[dataassending.length - 2];
  const bottom = dataassending[0];
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active) {
      if (payload && setValue && parsedValue !== payload[0]?.payload.value) {
        setValue(payload ? payload[0]?.payload.value : 0);
      }

      const now = new Date().getTime();

      if (setLabel && label !== parseISO(label).getTime()) {
        setLabel(parseISO(label).getTime());
      }
    }

    return null;
  };
  return (
    <Box minHeight={minHeight}>
      <ResponsiveContainer height={minHeight}>
        <AreaChart
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: -50,
            bottom: 5,
          }}
          onMouseLeave={() => {
            setLabel && setLabel(undefined);
            setValue && setValue(undefined);
          }}
        >
          {/* <CartesianGrid  
        vertical={false}
        stroke="#aab8c2"
        /> */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3260EF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3560ED" stopOpacity={0.08} />
            </linearGradient>
            <linearGradient id="gradient2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38CB89" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#38CB89" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tickFormatter={(time) =>
              isShowMonth ? formatMonth(parseISO(time)) : formatDay(parseISO(time))
            }
            minTickGap={10}
            fontSize="12px"
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            orientation="left"
            domain={[bottom, top]}
            fontSize="12px"
            minTickGap={10}
            display="none"
            tickFormatter={(value1) => numberToMillionOrBillionFormate(value1, 2, true)}
          />
          <Tooltip
            contentStyle={{ display: 'none' }}
            content={<CustomTooltip />}
            // formatter={(
            //   value1: number,
            //   name: string,
            //   props: { payload: { time: string; value: number } },
            // ) => {
            //   if (setValue && parsedValue !== props.payload.value) {
            //     setValue(props.payload.value);
            //   }
            //   if (setLabel && label !== parseISO(props.payload.time).getTime()) {
            //     setLabel(parseISO(props.payload.time).getTime());
            //   }
            // }}
          />
          <Area
            type="monotone"
            dataKey="data1"
            stroke={color}
            fill="url(#gradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="data2"
            stroke={color2}
            fill="url(#gradient2)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <Box>
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </Box>
    </Box>
  );
};

export default TwoLineChart;
