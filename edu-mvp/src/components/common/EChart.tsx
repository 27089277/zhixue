import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

// ECharts 封装：折线/雷达/环形等图表统一入口。
export default function EChart({
  option,
  height = 240,
  className,
}: {
  option: EChartsOption;
  height?: number | string;
  className?: string;
}) {
  return (
    <ReactECharts
      option={option}
      className={className}
      style={{ height, width: "100%" }}
      notMerge
      lazyUpdate
    />
  );
}
