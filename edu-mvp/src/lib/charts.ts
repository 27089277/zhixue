import type { EChartsOption } from "echarts";

const GREEN = "#087c59";
const AMBER = "#e49a20";
const RED = "#d93d36";

export const scoreTrendOption: EChartsOption = {
  tooltip: { trigger: "axis" },
  legend: { data: ["初三(1)班", "王子涵"], bottom: 0 },
  grid: { left: 36, right: 16, top: 16, bottom: 36 },
  xAxis: {
    type: "category",
    data: ["作业1", "周测", "作业2", "单元测", "作业3", "本周"],
  },
  yAxis: { type: "value", min: 50, max: 100 },
  series: [
    {
      name: "初三(1)班",
      type: "line",
      smooth: true,
      data: [78, 81, 83, 80, 86, 88],
      areaStyle: { opacity: 0.08 },
      itemStyle: { color: GREEN },
    },
    {
      name: "王子涵",
      type: "line",
      smooth: true,
      data: [58, 62, 66, 68, 70, 72],
      areaStyle: { opacity: 0.06 },
      itemStyle: { color: AMBER },
    },
  ],
};

export const masteryRadarOption: EChartsOption = {
  tooltip: {},
  radar: {
    radius: "66%",
    indicator: [
      { name: "一元二次", max: 100 },
      { name: "二次函数", max: 100 },
      { name: "相似三角形", max: 100 },
      { name: "勾股定理", max: 100 },
      { name: "圆", max: 100 },
    ],
  },
  series: [
    {
      type: "radar",
      data: [{ value: [86, 62, 48, 78, 55], name: "掌握率" }],
      areaStyle: { opacity: 0.18 },
      itemStyle: { color: GREEN },
    },
  ],
};

export const submitDonutOption: EChartsOption = {
  tooltip: { trigger: "item" },
  legend: { bottom: 0 },
  series: [
    {
      type: "pie",
      radius: ["58%", "78%"],
      label: { formatter: "{b}\n{c}人" },
      data: [
        { value: 83, name: "已提交", itemStyle: { color: GREEN } },
        { value: 8, name: "未提交", itemStyle: { color: AMBER } },
        { value: 12, name: "待批", itemStyle: { color: RED } },
      ],
    },
  ],
};

export function knowledgeBarOption(
  knowledge: { name: string; mastery: number }[]
): EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    grid: { left: 80, right: 24, top: 16, bottom: 24 },
    xAxis: { type: "value", max: 100 },
    yAxis: { type: "category", data: knowledge.map((k) => k.name) },
    series: [
      {
        type: "bar",
        data: knowledge.map((k) => k.mastery),
        itemStyle: { color: GREEN, borderRadius: [0, 6, 6, 0] },
        barWidth: 14,
      },
    ],
  };
}
