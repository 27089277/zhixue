// 测试环境补丁：store/session 在模块加载时会读 localStorage（浏览器 API），
// node 下用内存实现顶上，保证纯逻辑单测可导入这些模块。
const mem = new Map<string, string>();
const shim = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => void mem.set(k, String(v)),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: (i: number) => Array.from(mem.keys())[i] ?? null,
  get length() {
    return mem.size;
  },
};
if (typeof (globalThis as any).localStorage === "undefined") {
  (globalThis as any).localStorage = shim;
}
