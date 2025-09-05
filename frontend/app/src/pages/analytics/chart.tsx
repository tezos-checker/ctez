import { init, getInstanceByDom, EChartsOption, ECharts, SetOptionOpts } from 'echarts';
import React, { useRef, useEffect, CSSProperties, useMemo } from 'react';
import clsx from 'clsx'
import { useColorMode } from '@chakra-ui/react';
import useResizeObserver from '@react-hook/resize-observer'

interface ChartProps {
  option: EChartsOption;
  className?: string;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  title?: string;
  showZoom?: boolean;
  zoomStartDate?: string;
  zoomEndDate?: string;
}

export const Chart = (props: ChartProps) => {
  const { colorMode } = useColorMode();
  const chartElRef = useRef<HTMLDivElement>(null);
  const theme = colorMode === 'dark' ? 'dark' : 'light';

  const option = useMemo(() => {
    const showZoom = props.showZoom === undefined || props.showZoom;

    return {
      backgroundColor: 'transparent',
      title: {
        text: props.title,
        padding: 0,
      },
      dataZoom: showZoom ? [{
        type: 'inside',
        filterMode: 'none',
      }, {
        type: 'slider',
        filterMode: 'none',
      }] : undefined,
      ...props.option,
      grid: {
        top: 45,
        left: 'left',
        right: 0,
        containLabel: true,
        ...(!showZoom && { bottom: 0 }),
        ...props.option.grid
      },
      legend: {
        top: 0,
        left: 'left',
        padding: 0,
        type: 'scroll',
        ...props.option.legend
      },
    };
  }, [props.option, props.showZoom, props.title]);

  useEffect(() => {
    let chart: ECharts | undefined;
    if (chartElRef.current) {
      chart = init(chartElRef.current, theme);
    }

    return () => {
      chart?.dispose();
    };
  }, [theme]);

  useResizeObserver(chartElRef.current, () => {
    if (chartElRef.current) {
      const chart = getInstanceByDom(chartElRef.current);
      setTimeout(() => chart?.resize(), 0);
      setTimeout(() => chart?.resize(), 1000);
    }
  });

  useEffect(() => {
    if (chartElRef.current) {
      const chart = getInstanceByDom(chartElRef.current);
      if (chart && !chart.getOption()) {
        chart?.setOption(option, props.settings);
      }
      chart?.dispatchAction({
        type: 'dataZoom',
        dataZoomIndex: 0,
        start: props.zoomStartDate === undefined ? 0 : undefined,
        end: props.zoomEndDate === undefined ? 100 : undefined,
        startValue: props.zoomStartDate,
        endValue: props.zoomEndDate
      });
    }
  }, [props.zoomStartDate, props.zoomEndDate]);

  useEffect(() => {
    if (chartElRef.current) {
      const chart = getInstanceByDom(chartElRef.current);
      chart?.setOption(option, props.settings);
    }
  }, [option, props.settings, theme]);

  useEffect(() => {
    if (chartElRef.current) {
      const chart = getInstanceByDom(chartElRef.current);
      props.loading === true ? chart?.showLoading() : chart?.hideLoading();
    }
  }, [props.loading, theme]);

  return <div className={clsx('chart-container', props.className)} ref={chartElRef} style={{ width: '100%', height: '100%', ...props.style }} />;
};

export const ChartPure = React.memo(Chart);
