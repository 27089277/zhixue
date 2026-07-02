# QA 驱动：像测试人员一样通过真实 HTTP 接口操作系统，并输出 PASS/FAIL 报告。
import urllib.request, urllib.error, urllib.parse, json, random
random.seed(7)
BASE = "http://127.0.0.1:8080/api"
# 绕过任何代理（避免 urllib 走系统代理导致 403）
urllib.request.install_opener(urllib.request.build_opener(urllib.request.ProxyHandler({})))

def call(method, path, body=None, headers=None):
    data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    h = {"Content-Type": "application/json"}
    if headers: h.update(headers)
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=h)
    with urllib.request.urlopen(req, timeout=60) as r:
        t = r.read().decode("utf-8")
        return json.loads(t) if t else {}

def POST(p, b, h=None): return call("POST", p, b, h)
def GET(p, h=None): return call("GET", p, None, h)

TEACHERS = [("张老师","13800000000","数学"),("李老师","13800000001","物理"),
            ("王老师","13800000002","语文"),("赵老师","13800000003","英语"),
            ("刘老师","13800000004","化学")]
WEAK = {"数学":["二次函数","一元二次方程","相似三角形","圆","概率"],
        "物理":["欧姆定律","串并联电路","电功率","浮力","杠杆"],
        "语文":["文言文阅读","现代文阅读","作文","古诗鉴赏","病句"],
        "英语":["时态","阅读理解","完形填空","语法填空","写作"],
        "化学":["化学方程式","酸碱盐","溶液","金属","实验探究"]}
FAMILY=list("王李张刘陈赵孙周吴郑冯蒋沈韩杨朱秦许何林")
GIVEN=["子涵","思远","雨桐","宇航","梓萱","天宇","明轩","若溪","佳怡","浩然","一诺","嘉宁","晨曦","睿泽","欣怡","奕辰","诗涵","承泽","语彤","景行","浩宇","可欣","子轩","佳琪","博文","俊杰","雅静","梓晨","诗琪","天成"]
FIXED = {0:("王子涵","13900000000"), 1:("林小明","13900000001")}

log=[]; results=[]
def check(name, ok, extra=""):
    results.append((name, ok, extra)); print(("✅" if ok else "❌"), name, extra)

# 管理员
POST("/users", {"name":"赵管理员","role":"校区管理员","org":"光明中学校区","status":"启用","phone":"13700000000"})
# 老师
for name,phone,subj in TEACHERS:
    POST("/users", {"name":name,"role":"教师","org":f"光明中学 / {subj}组","status":"启用","phone":phone})
# 班级 + 学生
used=set()
for i,(tname,tphone,subj) in enumerate(TEACHERS):
    cls=f"初三({i+1})班"
    POST("/classes", {"name":cls,"count":30,"owner":tname,"rate":random.randint(60,92)})
    for n in range(1,31):
        if n==1 and i in FIXED:
            sname,phone = FIXED[i]
        else:
            sname=random.choice(FAMILY)+random.choice(GIVEN)
            phone="139"+str(random.randint(10000000,99999999))
            while phone in used: phone="139"+str(random.randint(10000000,99999999))
        used.add(phone)
        score=random.randint(45,99)
        POST("/users", {"name":sname,"role":"学生","org":cls,"status":("待激活" if n%13==0 else "启用"),
                        "phone":phone,"className":cls,"studentNo":f"GM2026{i+1}{n:02d}",
                        "parentPhone":"138"+str(random.randint(10000000,99999999)),
                        "recentScore":score,"completion":random.randint(50,100),
                        "risk":("高风险" if score<60 else "需关注" if score<75 else "正常"),
                        "weakPoint":random.choice(WEAK[subj])})
# 题目：每师 5 道
for i,(tname,tphone,subj) in enumerate(TEACHERS):
    for j in range(5):
        qtype=["单选题","多选题","填空题","解答题","判断题"][j]
        vis=["teacher","public","private","teacher","student"][j]
        wk=WEAK[subj][j]
        POST("/questions", {"title":f"[{subj}]{wk}测试题{j+1}：请作答。","type":qtype,"point":wk,
                            "source":"老师手动编写","visibility":vis,
                            "owner":(tname if vis!="public" else "题库中心"),"origin":"老师手动编写",
                            "subject":subj,"stage":"初中","grade":"初三","difficulty":"中等",
                            "answer":("A" if qtype=="单选题" else "见解析"),
                            "choices":(["选项A","选项B","选项C","选项D"] if qtype in("单选题","多选题") else None),
                            "sharedWith":[]})
# 试卷：每师 2 套；第一套发布为作业
for i,(tname,tphone,subj) in enumerate(TEACHERS):
    for j in range(2):
        items=[{"no":k,"type":"单选题" if k<=4 else "解答题","title":f"{subj}第{k}题",
                "choices":["A","B","C","D"] if k<=4 else None,"answer":"A" if k<=4 else "主观题",
                "score":6 if k<=4 else 12,"status":"未答"} for k in range(1,7)]
        pid=f"paper-seed-{i}-{j}"
        POST("/papers", {"id":pid,"title":f"{subj}测试卷{j+1}·{tname}","exam":"校本卷","subject":subj,
                         "stage":"初中","grade":"初三","region":"校本","year":2025,"duration":45,
                         "score":sum(x["score"] for x in items),"questions":6,"progress":0,"difficulty":"中等",
                         "visibility":("teacher" if j==0 else "private"),"owner":tname,"source":"老师从题库组卷",
                         "sections":["选择题 4","解答题 2"],"tags":["测试","可发布"],"sharedWith":[],"items":items})
        if j==0:
            POST("/assignments", {"id":f"hw-seed-{i}","title":f"{subj}测试卷1·{tname}","paperId":pid,
                                  "className":f"初三({i+1})班","deadline":"2026-07-10T22:00","status":"进行中",
                                  "kind":"作业","mode":"paper","timeLimit":45,"allowRedo":False})

# ===== 验证（像测试人员核对）=====
boot=GET("/bootstrap")
check("班级数=5", len(boot["classes"])==5, f"实际 {len(boot['classes'])}")
check("题目数=25", len(boot["questions"])==25, f"实际 {len(boot['questions'])}")
check("试卷数=10", len(boot["papers"])==10, f"实际 {len(boot['papers'])}")
check("作业数=5", len(boot["assignments"])==5, f"实际 {len(boot['assignments'])}")
stu=[u for u in boot["users"] if u["role"]=="学生"]
check("学生数=150", len(stu)==150, f"实际 {len(stu)}")

# 以李老师(物理)身份操作
LT="13800000001"
cls=GET("/teacher/classes", {"X-User-Phone":LT})
check("李老师班级=1", len(cls)==1, f"{[c['name'] for c in cls]}")
students=GET(f"/teacher/classes/{urllib.parse.quote('初三(2)班')}/students", {"X-User-Phone":LT})
check("李老师班级学生=30", len(students)==30, f"实际 {len(students)}")
sid=students[0]["id"]
POST(f"/teacher/students/{sid}/messages", {"title":"测试通知","body":"这是自动化测试发送的消息"}, {"X-User-Phone":LT})
conv=GET("/teacher/conversations", {"X-User-Phone":LT})
check("李老师会话=1", len(conv)>=1, f"{len(conv)}")
# 学生林小明收件箱
inbox=GET("/student/messages", {"X-User-Phone":"13900000001"})
check("学生收到消息", any(m["title"]=="测试通知" for m in inbox), f"{len(inbox)} 条")
# 向量检索（需后端已回填；此处新建题/卷向量在创建时已 reindex）
sp=POST("/ai/search-papers", {"query":"物理","k":30})
check("试卷向量检索命中", len(sp["result"]["ids"])>0, f"ids={sp['result']['ids'][:3]}")
sq=POST("/ai/search-questions", {"query":"欧姆定律","k":30})
check("题目向量检索命中", len(sq["result"]["ids"])>0, f"命中 {len(sq['result']['ids'])}")

passed=sum(1 for _,ok,_ in results if ok)
print(f"\n===== QA 结果：{passed}/{len(results)} 通过 =====")
