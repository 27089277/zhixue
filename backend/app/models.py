from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional, Union

from sqlalchemy import JSON, Boolean, DateTime, Enum as SqlEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class RoleCode(str, Enum):
    student = "student"
    teacher = "teacher"
    researcher = "researcher"
    admin = "admin"


class SubmissionStatus(str, Enum):
    draft = "draft"
    submitted = "submitted"
    grading = "grading"
    graded = "graded"


class Organization(Base):
    __tablename__ = "organizations"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id", ondelete="RESTRICT"), index=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(80))
    password_hash: Mapped[Optional[str]] = mapped_column(String(255))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    organization: Mapped[Organization] = relationship()
    roles: Mapped[list["UserRole"]] = relationship(cascade="all, delete-orphan")


class UserRole(Base):
    __tablename__ = "user_roles"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[RoleCode] = mapped_column(SqlEnum(RoleCode))
    scope: Mapped[dict] = mapped_column(JSON, default=dict)


class Paper(Base):
    __tablename__ = "papers"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    subject: Mapped[str] = mapped_column(String(40), index=True)
    exam_type: Mapped[str] = mapped_column(String(60), index=True)
    region: Mapped[str] = mapped_column(String(60))
    year: Mapped[int] = mapped_column(Integer, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer)
    total_score: Mapped[int] = mapped_column(Integer)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    questions: Mapped[list["Question"]] = relationship(cascade="all, delete-orphan", order_by="Question.number")


class Question(Base):
    __tablename__ = "questions"
    id: Mapped[int] = mapped_column(primary_key=True)
    paper_id: Mapped[int] = mapped_column(ForeignKey("papers.id", ondelete="CASCADE"), index=True)
    number: Mapped[int] = mapped_column(Integer)
    type: Mapped[str] = mapped_column(String(30))
    stem: Mapped[str] = mapped_column(Text)
    options: Mapped[Optional[list]] = mapped_column(JSON)
    standard_answer: Mapped[Optional[Union[dict, str]]] = mapped_column(JSON)
    analysis: Mapped[Optional[str]] = mapped_column(Text)
    score: Mapped[int] = mapped_column(Integer)
    knowledge_points: Mapped[list] = mapped_column(JSON, default=list)


class Assignment(Base):
    __tablename__ = "assignments"
    id: Mapped[int] = mapped_column(primary_key=True)
    paper_id: Mapped[int] = mapped_column(ForeignKey("papers.id", ondelete="RESTRICT"), index=True)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    target_scope: Mapped[dict] = mapped_column(JSON)
    deadline: Mapped[datetime] = mapped_column(DateTime)
    settings: Mapped[dict] = mapped_column(JSON, default=dict)


class Submission(Base):
    __tablename__ = "submissions"
    id: Mapped[int] = mapped_column(primary_key=True)
    assignment_id: Mapped[int] = mapped_column(ForeignKey("assignments.id", ondelete="CASCADE"), index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    status: Mapped[SubmissionStatus] = mapped_column(SqlEnum(SubmissionStatus), default=SubmissionStatus.draft)
    answers: Mapped[dict] = mapped_column(JSON, default=dict)
    objective_score: Mapped[Optional[int]] = mapped_column(Integer)
    manual_score: Mapped[Optional[int]] = mapped_column(Integer)
    feedback: Mapped[Optional[str]] = mapped_column(Text)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    graded_at: Mapped[Optional[datetime]] = mapped_column(DateTime)


class Video(Base):
    __tablename__ = "videos"
    id: Mapped[int] = mapped_column(primary_key=True)
    uploader_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    object_key: Mapped[str] = mapped_column(String(500), unique=True)
    status: Mapped[str] = mapped_column(String(30), default="uploading")
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    bindings: Mapped[dict] = mapped_column(JSON, default=dict)
