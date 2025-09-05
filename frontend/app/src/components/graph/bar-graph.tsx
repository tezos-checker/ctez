import { Box, useColorMode, useTheme } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns/fp';
import React, { Dispatch, SetStateAction, ReactNode } from 'react';
import { BarChart, ResponsiveContainer, XAxis, Tooltip, Bar, Text, TooltipProps } from 'recharts';

export enum VolumeWindow {
  daily,
  weekly,
  monthly,
}

const DEFAULT_HEIGHT = 300;
const formatDay = format('dd');
const formatMonth = format('LLL');

export type LineChartProps = {
  data: any[];
  color?: string | undefined;
  height?: number | undefined;
  minHeight?: number;
  setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
  setLabel?: Dispatch<SetStateAction<number | undefined>>; // used for label of valye
  value?: number;
  label1?: number;
  activeWindow?: VolumeWindow;
  topLeft?: ReactNode | undefined;
  topRight?: ReactNode | undefined;
  bottomLeft?: ReactNode | undefined;
  bottomRight?: ReactNode | undefined;
  isShowMonth?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}) => {
  return (
    <g>
      <rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
    </g>
  );
};

const BarChartAlt = ({
  data,
  color = '#0F62FF',
  setValue,
  setLabel,
  value,
  label1,
  activeWindow,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = DEFAULT_HEIGHT,
  isShowMonth = false,
  ...rest
}: LineChartProps) => {
  const parsedValue = value;
  const { colorMode } = useColorMode();
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active) {
      if (payload && setValue && parsedValue !== payload[0]?.payload.value) {
        setValue(payload ? payload[0]?.payload.value : 0);
      }

      const now = new Date().getTime();

      if (setLabel && label !== now) {
        if (activeWindow === VolumeWindow.weekly) {
          setLabel(parseISO(label).getTime());
        } else if (activeWindow === VolumeWindow.monthly) {
          setLabel(parseISO(label).getTime());
        } else {
          setLabel(parseISO(label).getTime());
        }
      }
    }

    return null;
  };

  return (
    <Box minHeight={minHeight} {...rest}>
      <Box>
        {topLeft ?? null}
        {topRight ?? null}
      </Box>
      <ResponsiveContainer height={minHeight}>
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
          onMouseLeave={() => {
            setLabel && setLabel(undefined);
            setValue && setValue(undefined);
          }}
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tickFormatter={(time) =>
              isShowMonth ? formatMonth(parseISO(time)) : formatDay(parseISO(time))
            }
            fontSize="12px"
            minTickGap={10}
          />
          <Tooltip
            contentStyle={{ display: 'none' }}
            cursor={{ fill: colorMode === 'dark' ? '#44579e' : '#E2E8F1', strokeWidth: 2 }}
            content={<CustomTooltip />}
            // formatter={(
            //   value1: number,
            //   name: string,
            //   props: { payload: { time: string; value: number } },
            // ) => {
            //   if (setValue && parsedValue !== props.payload.value) {
            //     setValue(props.payload.value);
            //   }

            //   const now = new Date().getTime();

            //   if (setLabel && label !== now) {
            //     if (activeWindow === VolumeWindow.weekly) {
            //       setLabel(parseISO(props.payload.time).getTime());
            //     } else if (activeWindow === VolumeWindow.monthly) {
            //       setLabel(parseISO(props.payload.time).getTime());
            //     } else {
            //       setLabel(parseISO(props.payload.time).getTime());
            //     }
            //   }
            // }}
          />
          <Bar
            dataKey="value"
            fill={color}
            shape={(props : any) => {
              return (
                <CustomBar
                  height={props.height}
                  width={props.width}
                  x={props.x}
                  y={props.y}
                  fill={color}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <Box>
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </Box>
    </Box>
  );
};

export default BarChartAlt;
