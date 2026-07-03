import { Text, View } from "react-native";
import { useStore } from "@/store/useStore";
import { Card, Screen, SectionTitle, Tag, Empty } from "@/components/ui";
import { colors, font } from "@/theme/tokens";

export default function AdminPeople() {
  const s = useStore();
  return (
    <Screen>
      <SectionTitle title="班级" extra={<Tag text={`${s.classes.length}`} />} />
      {s.classes.length ? s.classes.map((c) => (
        <Card key={c.name}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>{c.name}</Text>
            <Text style={{ color: colors.sub, fontSize: font.sub }}>{c.count} 人</Text>
          </View>
          <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 2 }}>班主任 {c.owner} · 完成率 {c.rate}%</Text>
        </Card>
      )) : <Empty text="暂无班级" />}

      <SectionTitle title="人员" extra={<Tag text={`${s.users.length}`} />} />
      {s.users.length ? s.users.map((u, i) => (
        <Card key={u.id ?? i}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>{u.name}</Text>
            <Tag text={u.role} tone={u.role === "学生" ? "muted" : "brand"} />
          </View>
          <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 2 }}>{u.org} · {u.status}{u.phone ? ` · ${u.phone}` : ""}</Text>
        </Card>
      )) : <Empty text="暂无人员" />}
    </Screen>
  );
}
