from datetime import datetime, timedelta

from sqlalchemy import select

from .database import Base, SessionLocal, engine
from .models import Assignment, Organization, Paper, Question, RoleCode, User, UserRole


def seed() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.scalar(select(Paper.id).limit(1)):
            return

        org = Organization(name="光明中学")
        db.add(org)
        db.flush()

        teacher = User(organization_id=org.id, phone="13800000000", name="张老师", enabled=True)
        student = User(organization_id=org.id, phone="13900000000", name="王子涵", enabled=True)
        db.add_all([teacher, student])
        db.flush()
        db.add_all([
            UserRole(user_id=teacher.id, role=RoleCode.teacher, scope={"class_ids": [1]}),
            UserRole(user_id=student.id, role=RoleCode.student, scope={"class_ids": [1]}),
        ])

        paper = Paper(
            title="2024 上海中考数学真题卷",
            subject="数学",
            exam_type="中考真题",
            region="上海",
            year=2024,
            duration_minutes=100,
            total_score=150,
            published=True,
        )
        db.add(paper)
        db.flush()
        db.add_all([
            Question(
                paper_id=paper.id,
                number=1,
                type="单选题",
                stem="下列各数中，是无理数的是（ ）",
                options=["0", "√2", "1/3", "-2"],
                standard_answer="B",
                analysis="√2 是无限不循环小数。",
                score=4,
                knowledge_points=["实数"],
            ),
            Question(
                paper_id=paper.id,
                number=2,
                type="填空题",
                stem="若 x + 2 = 5，则 x = ____。",
                options=None,
                standard_answer="3",
                analysis="移项得到 x = 3。",
                score=4,
                knowledge_points=["一元一次方程"],
            ),
            Question(
                paper_id=paper.id,
                number=3,
                type="解答题",
                stem="解方程：x² - 5x + 6 = 0，并写出完整过程。",
                options=None,
                standard_answer={"roots": [2, 3]},
                analysis="因式分解为 (x-2)(x-3)=0。",
                score=10,
                knowledge_points=["一元二次方程"],
            ),
        ])
        db.flush()
        db.add(Assignment(
            paper_id=paper.id,
            teacher_id=teacher.id,
            title="周末数学真题训练",
            target_scope={"class_ids": [1]},
            deadline=datetime.utcnow() + timedelta(days=3),
            settings={"auto_grade": True, "allow_stylus": True},
        ))
        db.commit()


if __name__ == "__main__":
    seed()
